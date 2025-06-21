
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';

const MyReports = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['my-reports', user?.email],
    queryFn: async () => {
      if (!user?.email) {
        console.log('No user email available');
        return [];
      }

      console.log('Fetching reports for user email:', user.email);
      
      // First get the user ID from the users table using email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return [];
      }

      console.log('Found user data:', userData);

      // Then fetch reports for this user
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          categories(name),
          officers(name)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
      
      if (reportsError) {
        console.error('Error fetching user reports:', reportsError);
        throw reportsError;
      }
      
      console.log('Fetched user reports:', reportsData);
      return reportsData || [];
    },
    enabled: !!user?.email
  });

  // Set up real-time subscription for user's reports
  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase
      .channel('user-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Real-time update received for reports:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, refetch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{t('pending')}</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">{t('inProgress')}</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">{t('resolved')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'emergency' 
      ? <Badge variant="destructive">{t('emergency')}</Badge>
      : <Badge variant="secondary">{t('nonEmergency')}</Badge>;
  };

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const handleVoiceToText = (reportId: string, text: string) => {
    console.log('Voice converted to text for report:', reportId, text);
  };

  if (isLoading) {
    return (
      <Layout title={t('myReports')} showBack={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('myReports')} showBack={true}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('yourReports')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('trackStatus')}
          </p>
        </div>

        {!user?.email ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('loginRequired')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('loginRequiredDesc')}
              </p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('noReportsYet')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('noReportsDesc')}
              </p>
              <Button onClick={() => navigate('/new-report')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createFirstReport')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              {t('showingReports')} {reports.length} {reports.length !== 1 ? t('reports') : t('report')} {t('for')} {user.name || user.email}
            </div>
            {reports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.categories?.name || t('uncategorized')}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('description')}</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{report.description}</p>
                    
                    {/* Voice Recorder for Description */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReportExpansion(report.id)}
                      >
                        {expandedReports.has(report.id) ? 'Hide' : 'Add'} Voice Message
                      </Button>
                      
                      {expandedReports.has(report.id) && (
                        <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                          <VoiceRecorder 
                            onTextConverted={(text) => handleVoiceToText(report.id, text)}
                          />
                          <Textarea
                            placeholder="Voice message will appear here or type additional notes..."
                            className="min-h-[80px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </div>
                    {(report.location_address || (report.location_lat && report.location_lng)) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.location_address || `${report.location_lat?.toFixed(6)}, ${report.location_lng?.toFixed(6)}`}
                      </div>
                    )}
                  </div>
                  
                  {report.officers?.name && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>{t('assignedOfficer')}:</strong> {report.officers.name}
                      </p>
                    </div>
                  )}
                  
                  {report.resolution_details && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>{t('resolution')}:</strong> {report.resolution_details}
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
