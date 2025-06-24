
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { jobPositions, jobCategories } from "@/data/jobPositions";

interface JobPositionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  showCategory?: boolean;
}

export const JobPositionSelector = ({ 
  value, 
  onValueChange, 
  showCategory = false 
}: JobPositionSelectorProps) => {
  const selectedJob = jobPositions.find(job => job.id === value);

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-12 text-lg">
          <SelectValue placeholder="Sélectionnez un poste" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {Object.entries(jobCategories).map(([categoryId, categoryName]) => (
            <div key={categoryId}>
              <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                {categoryName}
              </div>
              {jobPositions
                .filter(job => job.category === categoryId)
                .map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {selectedJob && showCategory && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-sm">
            {jobCategories[selectedJob.category as keyof typeof jobCategories]}
          </Badge>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Expérience requise :</span> {selectedJob.experience.min}+ ans 
            (idéalement {selectedJob.experience.preferred}+ ans)
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-sm font-medium text-gray-600">Compétences clés :</span>
            {selectedJob.keywords.required.slice(0, 4).map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
