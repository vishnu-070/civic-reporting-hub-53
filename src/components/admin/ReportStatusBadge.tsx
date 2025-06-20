
import { Badge } from '@/components/ui/badge';

interface ReportStatusBadgeProps {
  status: string;
}

const ReportStatusBadge = ({ status }: ReportStatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 px-3 py-1 font-medium">
          ⏳ Pending
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 px-3 py-1 font-medium">
          🔄 In Progress
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 px-3 py-1 font-medium">
          ✅ Resolved
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200 px-3 py-1 font-medium">
          {status}
        </Badge>
      );
  }
};

export default ReportStatusBadge;
