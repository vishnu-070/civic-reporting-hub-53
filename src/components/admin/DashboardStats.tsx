
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const DashboardStats = ({ defaultValue, onValueChange, children }: DashboardStatsProps) => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get all reports
      const { data: allReports, error: allError } = await supabase
        .from('reports')
        .select('status');
      
      if (allError) throw allError;
      
      // Count by status
      const total = allReports?.length || 0;
      const pending = allReports?.filter(report => report.status === 'pending').length || 0;
      const resolved = allReports?.filter(report => report.status === 'resolved').length || 0;
      
      console.log('Stats calculated:', { total, pending, resolved });
      
      return {
        total,
        pending,
        resolved
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
      {children}
    </Tabs>
  );
};

export default DashboardStats;
