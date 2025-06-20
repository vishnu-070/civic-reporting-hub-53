
import { Button } from '@/components/ui/button';

interface ReportActionsProps {
  status: string;
  onStatusUpdate: (status: string) => void;
}

const ReportActions = ({ status, onStatusUpdate }: ReportActionsProps) => {
  return (
    <div className="flex gap-2">
      {status === 'pending' && (
        <Button 
          size="sm" 
          onClick={() => onStatusUpdate('in_progress')}
        >
          Start Processing
        </Button>
      )}
      {status === 'in_progress' && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onStatusUpdate('resolved')}
        >
          Mark Resolved
        </Button>
      )}
    </div>
  );
};

export default ReportActions;
