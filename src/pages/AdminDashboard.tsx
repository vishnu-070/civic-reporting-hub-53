
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { data: reports = [], refetch } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          users(name),
          categories(name),
          subcategories(name),
          officers(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' });
      
      const { data: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      const { data: resolvedReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('status', 'resolved');
      
      return {
        total: totalReports?.length || 0,
        pending: pendingReports?.length || 0,
        resolved: resolvedReports?.length || 0
      };
    }
  });

  const updateReportStatus = async (reportId: string, status: string) => {
    await supabase
      .from('reports')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);
    
    refetch();
  };

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

  const filterReports = (status?: string) => {
    if (!status) return reports;
    return reports.filter((report: any) => report.status === status);
  };

  const renderReportsList = (filteredReports: any[]) => (
    <div className="space-y-4">
      {filteredReports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reports found.
        </div>
      ) : (
        filteredReports.map((report: any) => (
          <div key={report.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{report.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-xs text-gray-500">
                    Reported by: {report.users?.name} | {report.categories?.name} - {report.subcategories?.name}
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
              </div>
              <div className="flex items-center gap-2 ml-4">
                {report.type === 'emergency' && (
                  <Badge variant="destructive">Emergency</Badge>
                )}
                {getStatusBadge(report.status)}
              </div>
            </div>
            
            <div className="flex gap-2">
              {report.status === 'pending' && (
                <Button 
                  size="sm" 
                  onClick={() => updateReportStatus(report.id, 'in_progress')}
                >
                  Start Processing
                </Button>
              )}
              {report.status === 'in_progress' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateReportStatus(report.id, 'resolved')}
                >
                  Mark Resolved
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <Tabs defaultValue="total" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="total" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Reports ({stats?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending ({stats?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved ({stats?.resolved || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="total" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Reports</CardTitle>
                <CardDescription>Complete list of all reports with timestamps</CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsList(reports)}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports</CardTitle>
                <CardDescription>Reports waiting to be processed</CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsList(filterReports('pending'))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resolved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Reports</CardTitle>
                <CardDescription>Successfully completed reports</CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsList(filterReports('resolved'))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
