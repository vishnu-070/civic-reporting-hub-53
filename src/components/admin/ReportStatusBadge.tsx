
import { Badge } from '@/components/ui/badge';

interface ReportStatusBadgeProps {
  status: string;
}

const ReportStatusBadge = ({ status }: ReportStatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default ReportStatusBadge;
