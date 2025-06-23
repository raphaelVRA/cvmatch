
-- Create table for promo codes
CREATE TABLE public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for user subscriptions
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'startup', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  promo_code_used TEXT REFERENCES public.promo_codes(code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add premium features to profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'startup', 'business'));

-- Enable RLS for new tables
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Promo codes policies (admin only for insert/update, public for select active codes)
CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert some test promo codes
INSERT INTO public.promo_codes (code, discount_percent, usage_limit, valid_until) VALUES
('WELCOME50', 50, 100, NOW() + INTERVAL '30 days'),
('STARTUP25', 25, 50, NOW() + INTERVAL '60 days'),
('PREMIUM10', 10, NULL, NOW() + INTERVAL '90 days');

-- Update existing quota functions to consider subscription plans
CREATE OR REPLACE FUNCTION public.get_monthly_analysis_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT subscription_plan INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  CASE user_plan
    WHEN 'startup' THEN RETURN 50;
    WHEN 'business' THEN RETURN 200;
    ELSE RETURN 3; -- free plan
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_monthly_evaluation_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT subscription_plan INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  CASE user_plan
    WHEN 'startup' THEN RETURN 50;
    WHEN 'business' THEN RETURN 200;
    ELSE RETURN 10; -- free plan
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
