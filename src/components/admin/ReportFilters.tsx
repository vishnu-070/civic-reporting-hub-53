
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

interface ReportFiltersProps {
  emergencyFilter: string;
  setEmergencyFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: any[];
}

const ReportFilters = ({
  emergencyFilter,
  setEmergencyFilter,
  categoryFilter,
  setCategoryFilter,
  categories
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="emergency-filter" className="text-xs text-gray-600">Report Type</Label>
        <RadioGroup
          value={emergencyFilter}
          onValueChange={setEmergencyFilter}
          className="flex flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="emergency" id="emergency" />
            <Label htmlFor="emergency" className="text-sm">Emergency</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-emergency" id="non-emergency" />
            <Label htmlFor="non-emergency" className="text-sm">Non-Emergency</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category-filter" className="text-xs text-gray-600">Category</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilters;
