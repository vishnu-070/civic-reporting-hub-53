
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

        {/* Recently Resolved Reports Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              Recently Resolved Reports
            </CardTitle>
            <CardDescription>
              See the latest issues that have been successfully resolved in your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentlyResolvedReports.map((report) => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                        {report.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className={getTypeColor(report.type)}>
                          {report.type === 'emergency' ? 'Emergency' : 'Non-Emergency'}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(report.priority)}>
                          {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="secondary">
                          {report.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600 ml-4">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                    {report.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{report.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Resolved {report.resolvedDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>by {report.resolvedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm" className="px-6">
                View All Resolved Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CitizenDashboard;
