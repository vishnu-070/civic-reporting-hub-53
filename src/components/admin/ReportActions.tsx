
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';
import { useState } from 'react';

interface ReportActionsProps {
  status: string;
  reportId: string;
  assignedOfficerId?: string;
  onStatusUpdate: (status: string) => void;
  onOfficerAssign: (officerId: string) => void;
}

const ReportActions = ({ status, reportId, assignedOfficerId, onStatusUpdate, onOfficerAssign }: ReportActionsProps) => {
  const [showOfficerSelect, setShowOfficerSelect] = useState(false);

  const { data: officers = [] } = useQuery({
    queryKey: ['officers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleStartProcessing = () => {
    setShowOfficerSelect(true);
    onStatusUpdate('in_progress');
  };

  const handleOfficerSelection = (officerId: string) => {
    onOfficerAssign(officerId);
    setShowOfficerSelect(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {status === 'pending' && (
          <Button 
            size="sm" 
            onClick={handleStartProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Processing
          </Button>
        )}
        {status === 'in_progress' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onStatusUpdate('resolved')}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Mark Resolved
          </Button>
        )}
      </div>

      {/* Officer Assignment Section */}
      {(showOfficerSelect || assignedOfficerId) && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Assign Officer:</span>
          <Select
            value={assignedOfficerId || 'unassigned'}
            onValueChange={handleOfficerSelection}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select officer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassign</SelectItem>
              {officers.map((officer: any) => (
                <SelectItem key={officer.id} value={officer.id}>
                  {officer.name} ({officer.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ReportActions;
