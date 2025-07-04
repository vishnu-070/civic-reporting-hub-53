import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Joyride from 'react-joyride';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import ChatBot from '@/components/ChatBot';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, BarChart3, AlertTriangle, MapPin, Calendar, CheckCircle2, Clock, User } from 'lucide-react';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [runTour, setRunTour] = useState(false);

  // Fetch recently resolved reports from backend
  const { data: recentlyResolvedReports = [] } = useQuery({
    queryKey: ['recently-resolved-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          categories(name),
          officers(name)
        `)
        .eq('status', 'resolved')
        .order('updated_at', { ascending: false })
        .limit(4);
      
      if (error) {
        console.error('Error fetching resolved reports:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const getTypeColor = (type: string) => {
    return type === 'emergency' 
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRunTour(true);
      localStorage.setItem('hasSeenTour', 'true');
    }
  }, []);

  const tourSteps = [
    {
      target: '.new-report-card',
      content: t('newReportDesc'),
    },
    {
      target: '.my-reports-card',
      content: t('myReportsDesc'),
    },
    {
      target: '.system-overview-card',
      content: t('systemOverviewDesc'),
    },
  ];

  return (
    <Layout title={t('citizenDashboard')}>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#3b82f6',
          }
        }}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTour(false);
          }
        }}
      />
      
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('welcome')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t('welcomeSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="new-report-card hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200 hover:border-red-300" onClick={() => navigate('/new-report')}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-700 text-base sm:text-lg">{t('newReport')}</CardTitle>
              <CardDescription className="text-sm">
                {t('newReportDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t('createReport')}
              </Button>
            </CardContent>
          </Card>

          <Card className="my-reports-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-reports')}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700 text-base sm:text-lg">{t('myReports')}</CardTitle>
              <CardDescription className="text-sm">
                {t('myReportsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button variant="outline" className="w-full text-sm sm:text-base">
                {t('viewMyReports')}
              </Button>
            </CardContent>
          </Card>

          <Card className="system-overview-card hover:shadow-lg transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1" onClick={() => navigate('/system-overview')}>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-700 text-base sm:text-lg">{t('systemOverview')}</CardTitle>
              <CardDescription className="text-sm">
                {t('systemOverviewDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button variant="outline" className="w-full text-sm sm:text-base">
                {t('viewStatistics')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recently Resolved Reports Section - Now Dynamic */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                {t('recentlyResolved')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('recentlyResolvedDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {recentlyResolvedReports.slice(0, 3).map((report: any) => (
                  <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm truncate pr-2">
                        {report.title}
                      </h4>
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {report.resolution_details || report.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-16 sm:max-w-20">
                          {report.location_address?.split(',')[0] || 'Location'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">{formatTimeAgo(report.updated_at)}</span>
                        <span className="sm:hidden">{formatTimeAgo(report.updated_at).split(' ')[0]}</span>
                      </div>
                      <Badge variant="outline" className={getTypeColor(report.type) + " text-xs"}>
                        {report.type === 'emergency' ? t('emergency') : t('nonEmergency')}
                      </Badge>
                    </div>
                    
                    {report.officers?.name && (
                      <div className="mt-2 text-xs text-blue-600">
                        <User className="h-3 w-3 inline mr-1" />
                        <span className="truncate">{report.officers.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {recentlyResolvedReports.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No resolved reports to display
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" className="px-4 text-sm">
                  {t('viewAllResolved')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New ChatBot Component */}
      <ChatBot />
    </Layout>
  );
};

export default CitizenDashboard;
