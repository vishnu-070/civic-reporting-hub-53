
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { FileText, Plus, BarChart3, AlertTriangle, Bell, CheckCircle, Zap, Shield } from 'lucide-react';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);

  // Dummy recent updates data
  const recentUpdates = [
    {
      id: 1,
      title: "New Emergency Report Categories Added",
      description: "We've added Aviation, Fire, and Electricity as dedicated emergency categories for faster response times.",
      date: "2 hours ago",
      type: "feature",
      icon: Zap
    },
    {
      id: 2,
      title: "System Performance Improvements",
      description: "Report submission is now 40% faster with our latest backend optimizations.",
      date: "1 day ago",
      type: "improvement",
      icon: CheckCircle
    },
    {
      id: 3,
      title: "Enhanced Security Features",
      description: "Added two-factor authentication and improved data encryption for better account security.",
      date: "3 days ago",
      type: "security",
      icon: Shield
    },
    {
      id: 4,
      title: "Mobile App Update Available",
      description: "Version 2.1 is now available with improved navigation and offline report drafting.",
      date: "1 week ago",
      type: "update",
      icon: Bell
    }
  ];

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-blue-600 bg-blue-100';
      case 'improvement': return 'text-green-600 bg-green-100';
      case 'security': return 'text-purple-600 bg-purple-100';
      case 'update': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      content: 'Click here to create a new incident report. You can report both emergency and non-emergency issues.',
    },
    {
      target: '.my-reports-card',
      content: 'View all your submitted reports and track their status here.',
    },
    {
      target: '.system-overview-card',
      content: 'Check system-wide statistics and see how the community is doing.',
    },
  ];

  return (
    <Layout title="Citizen Dashboard">
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
      
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Citizen Services
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Report incidents and stay connected with your local government
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="new-report-card hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200 hover:border-red-300" onClick={() => navigate('/new-report')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-700">New Report</CardTitle>
              <CardDescription>
                Report emergencies or civic issues in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>

          <Card className="my-reports-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-reports')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700">My Reports</CardTitle>
              <CardDescription>
                View and track your submitted reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View My Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="system-overview-card hover:shadow-lg transition-shadow cursor-pointer md:col-span-2 lg:col-span-1" onClick={() => navigate('/system-overview')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-700">System Overview</CardTitle>
              <CardDescription>
                View community statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Statistics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Updates Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Recent Updates
            </CardTitle>
            <CardDescription>
              Stay informed about the latest improvements and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update) => {
                const IconComponent = update.icon;
                return (
                  <div key={update.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className={`p-2 rounded-full ${getUpdateTypeColor(update.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {update.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {update.description}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {update.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Updates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CitizenDashboard;
