
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, AlertTriangle, CheckCircle, Clock, Filter, Image, Eye } from 'lucide-react';

const AdminDashboard = () => {
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

  const renderImages = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    const imageUrls = imageUrl.split(',').filter(url => url.trim());
    
    if (imageUrls.length === 0) return null;

    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <Image className="h-4 w-4" />
          <span className="text-sm font-medium">Images ({imageUrls.length})</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {imageUrls.map((url, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <img
                    src={url}
                    alt={`Report image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Report Image {index + 1}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <img
                    src={url}
                    alt={`Report image ${index + 1}`}
                    className="max-w-full max-h-[70vh] object-contain rounded"
                  />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="emergency-filter" className="text-xs text-gray-600">Report Type</Label>
        <RadioGroup
          value={emergencyFilter}
          onValueChange={setEmergencyFilter}
          className="flex flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="emergency" id="emergency" />
            <Label htmlFor="emergency" className="text-sm">Emergency</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-emergency" id="non-emergency" />
            <Label htmlFor="non-emergency" className="text-sm">Non-Emergency</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category-filter" className="text-xs text-gray-600">Category</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderReportsList = (filteredReports: any[]) => (
    <div className="space-y-4">
      {filteredReports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reports found with the current filters.
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
                {renderImages(report.image_url)}
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
                {renderFilters()}
                {renderReportsList(filterReports())}
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
                {renderFilters()}
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
                {renderFilters()}
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
