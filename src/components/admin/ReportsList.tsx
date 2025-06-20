
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import ReportImages from './ReportImages';
import ReportStatusBadge from './ReportStatusBadge';
import ReportActions from './ReportActions';

interface ReportsListProps {
  reports: any[];
  onStatusUpdate: (reportId: string, status: string) => void;
}

const ReportsList = ({ reports, onStatusUpdate }: ReportsListProps) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reports found with the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report: any) => (
        <div key={report.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold">{report.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{report.description}</p>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-gray-500">
                  Reported by: {report.users?.name || 'Unknown'} | {report.categories?.name} - {report.subcategories?.name}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Created: {formatDateTime(report.created_at)}</span>
                  </div>
                  {report.updated_at !== report.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {formatDateTime(report.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
              <ReportImages imageUrl={report.image_url} />
            </div>
            <div className="flex items-center gap-2 ml-4">
              {report.type === 'emergency' && (
                <Badge variant="destructive">Emergency</Badge>
              )}
              <ReportStatusBadge status={report.status} />
            </div>
          </div>
          
          <ReportActions 
            status={report.status}
            onStatusUpdate={(status) => onStatusUpdate(report.id, status)}
          />
        </div>
      ))}
    </div>
  );
};

export default ReportsList;
