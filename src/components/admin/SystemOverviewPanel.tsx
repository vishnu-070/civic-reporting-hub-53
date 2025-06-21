
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Shield,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SystemOverviewPanel = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-system-overview'],
    queryFn: async () => {
      // Get comprehensive statistics
      const [
        { data: totalReports, count: totalCount },
        { data: pendingReports, count: pendingCount },
        { data: inProgressReports, count: inProgressCount },
        { data: resolvedReports, count: resolvedCount },
        { data: emergencyReports, count: emergencyCount },
        { data: nonEmergencyReports, count: nonEmergencyCount },
        { data: todayReports, count: todayCount },
        { data: thisWeekReports, count: weekCount },
        { data: officers },
        { data: categories },
        { data: users },
        { data: recentReports }
      ] = await Promise.all([
        supabase.from('reports').select('*', { count: 'exact' }),
        supabase.from('reports').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('reports').select('*', { count: 'exact' }).eq('status', 'in_progress'),
        supabase.from('reports').select('*', { count: 'exact' }).eq('status', 'resolved'),
        supabase.from('reports').select('*', { count: 'exact' }).eq('type', 'emergency'),
        supabase.from('reports').select('*', { count: 'exact' }).eq('type', 'non_emergency'),
        supabase.from('reports').select('*', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('reports').select('*', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('officers').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('users').select('*'),
        supabase.from('reports').select(`
          *,
          users(name),
          categories(name)
        `).order('created_at', { ascending: false }).limit(5)
      ]);

      // Calculate response time (mock data for demo)
      const avgResponseTime = '2.4 hours';
      const resolutionRate = resolvedCount ? Math.round((resolvedCount / totalCount) * 100) : 0;

      return {
        total: totalCount || 0,
        pending: pendingCount || 0,
        inProgress: inProgressCount || 0,
        resolved: resolvedCount || 0,
        emergency: emergencyCount || 0,
        nonEmergency: nonEmergencyCount || 0,
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        officers: officers || [],
        categories: categories || [],
        users: users || [],
        recentReports: recentReports || [],
        avgResponseTime,
        resolutionRate
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading system overview...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'emergency' 
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.pending || 0) + (stats?.inProgress || 0)}</div>
            <p className="text-xs text-muted-foreground">Pending + In Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.resolutionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgResponseTime || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Average processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending</span>
              <Badge className={getStatusColor('pending')}>{stats?.pending || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">In Progress</span>
              <Badge className={getStatusColor('in_progress')}>{stats?.inProgress || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Resolved</span>
              <Badge className={getStatusColor('resolved')}>{stats?.resolved || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Emergency</span>
              <Badge className={getTypeColor('emergency')}>{stats?.emergency || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Non-Emergency</span>
              <Badge className={getTypeColor('non_emergency')}>{stats?.nonEmergency || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Today</span>
              <Badge variant="outline">{stats?.today || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">This Week</span>
              <Badge variant="outline">{stats?.thisWeek || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Officers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.officers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active officers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Citizens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Report categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Reports
          </CardTitle>
          <CardDescription>Latest submissions to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recentReports?.length > 0 ? (
              stats.recentReports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{report.title}</h4>
                    <p className="text-xs text-gray-500">
                      By {report.users?.name || 'Unknown'} • {report.categories?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(report.type)}>
                      {report.type === 'emergency' ? 'Emergency' : 'Non-Emergency'}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent reports</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverviewPanel;
