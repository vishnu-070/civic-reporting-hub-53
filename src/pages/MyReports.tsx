
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const MyReports = () => {
  const { user } = useAuth();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['my-reports', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          categories(name),
          subcategories(name),
          officers(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
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
      ? <Badge variant="destructive">Emergency</Badge>
      : <Badge variant="secondary">Non-Emergency</Badge>;
  };

  if (isLoading) {
    return (
      <Layout title="My Reports" showBack={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your reports...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Reports" showBack={true}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Reports
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track the status of your submitted reports
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No reports yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You haven't submitted any reports. Create your first report to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.categories?.name} - {report.subcategories?.name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">{report.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </div>
                    {report.location_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.location_address}
                      </div>
                    )}
                  </div>
                  
                  {report.officers?.name && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Assigned Officer:</strong> {report.officers.name}
                      </p>
                    </div>
                  )}
                  
                  {report.resolution_details && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>Resolution:</strong> {report.resolution_details}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyReports;
