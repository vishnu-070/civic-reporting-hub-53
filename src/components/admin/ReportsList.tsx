
import { Badge } from '@/components/ui/badge';
import { Clock, User, Tag, MapPin } from 'lucide-react';
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
      <div className="text-center py-12 text-gray-500">
        <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
          <p className="text-lg font-medium">No reports found with the current filters.</p>
          <p className="text-sm mt-2">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report: any) => (
        <div key={report.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h4>
                <p className="text-gray-700 leading-relaxed mb-4">{report.description}</p>
              </div>
              <div className="flex items-center gap-3 ml-6">
                {report.type === 'emergency' && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
                    🚨 Emergency
                  </Badge>
                )}
                <ReportStatusBadge status={report.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Reported by:</span>
                <span className="font-medium text-blue-700">{report.users?.name || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-green-700">
                  {report.categories?.name} - {report.subcategories?.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-purple-700">{formatDateTime(report.created_at)}</span>
              </div>

              {report.updated_at !== report.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium text-orange-700">{formatDateTime(report.updated_at)}</span>
                </div>
              )}
            </div>

            <ReportImages imageUrl={report.image_url} />
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <ReportActions 
              status={report.status}
              onStatusUpdate={(status) => onStatusUpdate(report.id, status)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportsList;
