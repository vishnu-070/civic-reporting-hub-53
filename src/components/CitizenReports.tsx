
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';

const CitizenReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['my-reports', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          categories(name),
          officers(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3); // Show only latest 3 reports
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
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

  const getTypeBadge = (type: string) => {
    return type === 'emergency' 
      ? <Badge variant="destructive" className="text-xs">Emergency</Badge>
      : <Badge variant="secondary" className="text-xs">Non-Emergency</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-sm text-gray-500">Loading your reports...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">My Recent Reports</CardTitle>
            <CardDescription>Your latest submitted reports</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-reports')}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-xs text-gray-500 mb-4">Submit your first report to get started</p>
            <Button size="sm" onClick={() => navigate('/new-report')}>
              <Plus className="h-4 w-4 mr-1" />
              Create Report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report: any) => (
              <div key={report.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm truncate pr-2">{report.title}</h4>
                  <div className="flex gap-1 flex-shrink-0">
                    {getTypeBadge(report.type)}
                    {getStatusBadge(report.status)}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(report.created_at), 'MMM dd')}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {report.categories?.name || 'Uncategorized'}
                  </div>
                  {(report.location_address || (report.location_lat && report.location_lng)) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-20">
                        {report.location_address?.split(',')[0] || 'Location'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CitizenReports;
