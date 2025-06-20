
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
}

const DashboardStats = ({ defaultValue, onValueChange }: DashboardStatsProps) => {
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

  return (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className="w-full">
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
    </Tabs>
  );
};

export default DashboardStats;
