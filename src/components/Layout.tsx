
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/citizen');
    }
  };

  const isAdmin = user?.role === 'admin';
  const dashboardType = isAdmin ? 'Admin Dashboard' : 'Citizen Dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cream-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b-2 border-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mr-1 sm:mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              
              {/* Logo and Title Section */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Emblem_of_Telangana.svg/1200px-Emblem_of_Telangana.svg.png" 
                    alt="Telangana Government" 
                    className="h-8 w-8 sm:h-12 sm:w-12 border-2 border-green-500 rounded-full p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <h1 className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">RTIRS</h1>
                    <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">|</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-20 sm:max-w-none">
                      {isMobile ? title.split(' ')[0] : title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Real-Time Incident Report System</p>
                    <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      {isMobile ? (isAdmin ? 'Admin' : 'Citizen') : dashboardType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user?.name}
              </span>
              {!isAdmin && <LanguageSwitcher />}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3">
              <div className="flex flex-col space-y-2">
                <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.name}
                </div>
                {!isAdmin && (
                  <div className="px-4 py-2">
                    <LanguageSwitcher />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="justify-start px-4"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Light Mode
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="justify-start px-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
