
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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
      
      const { data: emergencyReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('type', 'emergency');
      
      return {
        total: totalReports?.length || 0,
        pending: pendingReports?.length || 0,
        resolved: resolvedReports?.length || 0,
        emergency: emergencyReports?.length || 0
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

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.resolved || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Reports</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.emergency || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Manage and respond to citizen reports with timestamps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report: any) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
