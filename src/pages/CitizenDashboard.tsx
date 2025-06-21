
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import CitizenReports from '@/components/CitizenReports';
import { FileText, Plus, BarChart3, AlertTriangle, MapPin, Calendar, CheckCircle2, Clock, User } from 'lucide-react';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);

  // Dummy recently resolved reports data
  const recentlyResolvedReports = [
    {
      id: 1,
      title: "Broken Street Light on Main Street",
      category: "Infrastructure",
      type: "non_emergency",
      location: "Main Street & 5th Avenue",
      resolvedDate: "2 hours ago",
      resolvedBy: "Officer Martinez",
      description: "Street light has been repaired and is now functioning properly.",
      priority: "medium"
    },
    {
      id: 2,
      title: "Power Line Down",
      category: "Electricity",
      type: "emergency",
      location: "Oak Park residential area",
      resolvedDate: "6 hours ago",
      resolvedBy: "Emergency Response Team",
      description: "Power line safely removed and electricity restored to affected homes.",
      priority: "high"
    },
    {
      id: 3,
      title: "Pothole on Highway 101",
      category: "Transportation",
      type: "non_emergency",
      location: "Highway 101, Mile Marker 23",
      resolvedDate: "1 day ago",
      resolvedBy: "Public Works Dept.",
      description: "Pothole has been filled and road surface restored.",
      priority: "low"
    },
    {
      id: 4,
      title: "Small Kitchen Fire",
      category: "Fire",
      type: "emergency",
      location: "Elm Street Apartments",
      resolvedDate: "2 days ago",
      resolvedBy: "Fire Department",
      description: "Fire extinguished quickly, no injuries reported. Kitchen ventilation repaired.",
      priority: "high"
    }
  ];

  const getTypeColor = (type: string) => {
    return type === 'emergency' 
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
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

        {/* My Reports and Recently Resolved Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <CitizenReports />
          
          {/* Recently Resolved Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                Recently Resolved
              </CardTitle>
              <CardDescription>
                Latest issues resolved in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentlyResolvedReports.slice(0, 2).map((report) => (
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
                      {report.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-20">{report.location.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{report.resolvedDate}</span>
                      </div>
                      <Badge variant="outline" className={getTypeColor(report.type) + " text-xs"}>
                        {report.type === 'emergency' ? 'Emergency' : 'Non-Emergency'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" className="px-4">
                  View All Resolved
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CitizenDashboard;
