import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from '@/components/admin/DashboardStats';
import ReportFilters from '@/components/admin/ReportFilters';
import ReportsList from '@/components/admin/ReportsList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('total');
  const [emergencyFilter, setEmergencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const applyFilters = (reportsList: any[]) => {
    let filtered = reportsList;

    // Filter by emergency type
    if (emergencyFilter === 'emergency') {
      filtered = filtered.filter(report => report.type === 'emergency');
    } else if (emergencyFilter === 'non-emergency') {
      filtered = filtered.filter(report => report.type !== 'emergency');
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category_id === categoryFilter);
    }

    return filtered;
  };

  const filterReports = (status?: string) => {
    let filteredReports = status ? reports.filter((report: any) => report.status === status) : reports;
    return applyFilters(filteredReports);
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <DashboardStats defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="total" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Reports</CardTitle>
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
                <CardTitle>Pending Reports</CardTitle>
                <CardDescription>Reports waiting to be processed</CardDescription>
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
                <CardTitle>Resolved Reports</CardTitle>
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
