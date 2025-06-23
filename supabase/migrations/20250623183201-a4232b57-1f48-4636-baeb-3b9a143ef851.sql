
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('candidate', 'company')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for CV analyses (for candidates)
CREATE TABLE public.cv_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  position_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  matched_keywords TEXT[],
  missing_keywords TEXT[],
  strengths TEXT[],
  improvements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for job postings (for companies)
CREATE TABLE public.job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for CV evaluations (company analyses)
CREATE TABLE public.cv_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID REFERENCES public.job_postings ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  matched_keywords TEXT[],
  missing_keywords TEXT[],
  summary TEXT,
  experience TEXT,
  education TEXT,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_evaluations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- CV analyses policies (candidates)
CREATE POLICY "Users can view own CV analyses" ON public.cv_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV analyses" ON public.cv_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job postings policies (companies)
CREATE POLICY "Users can view own job postings" ON public.job_postings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job postings" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job postings" ON public.job_postings
  FOR UPDATE USING (auth.uid() = user_id);

-- CV evaluations policies (companies)
CREATE POLICY "Users can view own CV evaluations" ON public.cv_evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV evaluations" ON public.cv_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, account_type)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'account_type', 'candidate')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to get monthly analysis count for candidates
CREATE OR REPLACE FUNCTION public.get_monthly_analysis_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.cv_analyses
    WHERE user_id = user_uuid
    AND created_at >= date_trunc('month', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get monthly evaluation count for companies
CREATE OR REPLACE FUNCTION public.get_monthly_evaluation_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT job_posting_id)
    FROM public.cv_evaluations
    WHERE user_id = user_uuid
    AND created_at >= date_trunc('month', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
