
import { Badge } from '@/components/ui/badge';
import { Clock, User, Tag, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  const handleOfficerAssignment = async (reportId: string, officerId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          assigned_officer_id: officerId === 'unassigned' ? null : officerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (error) {
        console.error('Error assigning officer:', error);
        throw error;
      }
      
      console.log('Officer assigned successfully');
    } catch (error) {
      console.error('Failed to assign officer:', error);
    }
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
                  {report.categories?.name || 'Uncategorized'}
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

              {(report.location_address || (report.location_lat && report.location_lng)) && (
                <div className="flex items-center gap-2 text-sm md:col-span-2 lg:col-span-1">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-red-700">
                    {report.location_address || `${report.location_lat?.toFixed(6)}, ${report.location_lng?.toFixed(6)}`}
                  </span>
                </div>
              )}
            </div>

            <ReportImages imageUrl={report.image_url} />

            {/* Current Officer Assignment Display */}
            {report.officers?.name && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Assigned Officer: {report.officers.name} ({report.officers.department || 'N/A'})
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <ReportActions 
              status={report.status}
              reportId={report.id}
              assignedOfficerId={report.assigned_officer_id}
              onStatusUpdate={(status) => onStatusUpdate(report.id, status)}
              onOfficerAssign={(officerId) => handleOfficerAssignment(report.id, officerId)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportsList;
