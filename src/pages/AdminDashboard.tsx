
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from '@/components/admin/DashboardStats';
import ReportFilters from '@/components/admin/ReportFilters';
import ReportsList from '@/components/admin/ReportsList';
import SystemOverviewPanel from '@/components/admin/SystemOverviewPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [emergencyFilter, setEmergencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: reports = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          users(name),
          categories(name),
          officers(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }
      console.log('Fetched reports:', data);
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Set up real-time subscription for reports
  useEffect(() => {
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (error) {
        console.error('Error updating report status:', error);
        throw error;
      }
      
      console.log('Report status updated successfully');
      // Refetch will be triggered by real-time subscription
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const applyFilters = (reportsList: any[]) => {
    let filtered = reportsList;

    console.log('Applying filters - Emergency filter:', emergencyFilter, 'Category filter:', categoryFilter);
    console.log('Reports before filtering:', filtered.length);

    // Filter by emergency type - FIXED: Check for correct values
    if (emergencyFilter === 'emergency') {
      filtered = filtered.filter(report => {
        console.log('Report type:', report.type, 'Is emergency:', report.type === 'emergency');
        return report.type === 'emergency';
      });
    } else if (emergencyFilter === 'non-emergency') {
      filtered = filtered.filter(report => {
        // FIXED: Check for both 'non_emergency' and 'non-emergency' to handle both cases
        const isNonEmergency = report.type === 'non_emergency' || report.type === 'non-emergency';
        console.log('Report type:', report.type, 'Is non-emergency:', isNonEmergency);
        return isNonEmergency;
      });
    }

    console.log('Reports after emergency filter:', filtered.length);

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => {
        console.log('Report category_id:', report.category_id, 'Filter category:', categoryFilter);
        return report.category_id === categoryFilter;
      });
    }

    console.log('Reports after category filter:', filtered.length);
    return filtered;
  };

  const filterReports = (status?: string) => {
    let filteredReports = reports;
    
    console.log('Filtering reports by status:', status);
    console.log('Total reports available:', reports.length);
    
    // Apply status filter first
    if (status) {
      filteredReports = filteredReports.filter((report: any) => {
        // FIXED: Handle both 'pending' and 'in_progress' for pending section
        if (status === 'pending') {
          const isPending = report.status === 'pending' || report.status === 'in_progress';
          console.log('Report status:', report.status, 'Is pending/in_progress:', isPending);
          return isPending;
        }
        console.log('Report status:', report.status, 'Target status:', status, 'Match:', report.status === status);
        return report.status === status;
      });
      console.log(`Reports with status "${status}":`, filteredReports.length);
    }
    
    // Then apply other filters
    const finalFiltered = applyFilters(filteredReports);
    console.log('Final filtered reports:', finalFiltered.length);
    return finalFiltered;
  };

  if (isLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reports...</div>
        </div>
      </Layout>
    );
  }

  console.log('All reports:', reports);
  console.log('Pending reports:', filterReports('pending'));
  console.log('Resolved reports:', filterReports('resolved'));

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <DashboardStats defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Comprehensive dashboard with real-time system metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemOverviewPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="total" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Reports ({filterReports().length})</CardTitle>
                <CardDescription>Complete list of all reports with timestamps</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportFilters
                  emergencyFilter={emergencyFilter}
                  setEmergencyFilter={setEmergencyFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  categories={categories}
                />
                <ReportsList
                  reports={filterReports()}
                  onStatusUpdate={updateReportStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Reports ({filterReports('pending').length})</CardTitle>
                <CardDescription>Reports that are pending or currently being processed</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportFilters
                  emergencyFilter={emergencyFilter}
                  setEmergencyFilter={setEmergencyFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  categories={categories}
                />
                <ReportsList
                  reports={filterReports('pending')}
                  onStatusUpdate={updateReportStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resolved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Reports ({filterReports('resolved').length})</CardTitle>
                <CardDescription>Successfully completed reports</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportFilters
                  emergencyFilter={emergencyFilter}
                  setEmergencyFilter={setEmergencyFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  categories={categories}
                />
                <ReportsList
                  reports={filterReports('resolved')}
                  onStatusUpdate={updateReportStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </DashboardStats>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
