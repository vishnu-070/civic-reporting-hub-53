
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users } from 'lucide-react';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;
      
      if (isSignup) {
        success = await signup(name, email, password);
        if (success) {
          toast({
            title: "Account created successfully!",
            description: "Welcome to the citizen reporting system.",
          });
          navigate('/citizen');
        } else {
          toast({
            title: "Signup failed",
            description: "Please check your details and try again.",
            variant: "destructive",
          });
        }
      } else {
        success = await login(email, password);
        if (success) {
          navigate('/citizen');
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === 'admin@gmail.com' && password === '123456' && pin === '0000') {
      const success = await login(email, password);
      if (success) {
        navigate('/admin');
      } else {
        toast({
          title: "Admin login failed",
          description: "Could not authenticate admin user.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please check your email, password, and PIN.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex items-center justify-center gap-8">
        {/* Government Emblem and Branding */}
        <div className="hidden lg:flex flex-col items-center space-y-6 text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Emblem_of_Telangana.svg/1200px-Emblem_of_Telangana.svg.png" 
            alt="Government of Telangana" 
            className="h-32 w-32 object-contain"
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">RTIRS</h1>
            <p className="text-lg text-gray-600 font-medium">Real-Time Incident Report System</p>
            <p className="text-sm text-gray-500 max-w-sm">
              Government of Telangana's official platform for citizen incident reporting and emergency response
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="lg:hidden">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Emblem_of_Telangana.svg/1200px-Emblem_of_Telangana.svg.png" 
                alt="Government of Telangana" 
                className="h-16 w-16 object-contain mx-auto mb-2"
              />
            </div>
            <CardTitle className="text-xl font-bold">
              RTIRS Portal
            </CardTitle>
            <CardDescription className="text-blue-100">
              Secure Access to Real-Time Incident Report System
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="citizen" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="citizen" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white border-2 border-green-200 data-[state=active]:border-green-500"
                >
                  <Users className="h-4 w-4" />
                  Citizen Portal
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white border-2 border-red-200 data-[state=active]:border-red-500"
                >
                  <Shield className="h-4 w-4" />
                  Admin Portal
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="citizen">
                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50/30">
                  <form onSubmit={handleCitizenSubmit} className="space-y-4">
                    {isSignup && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border-green-300 focus:border-green-500 focus:ring-green-500"
                          required
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium" 
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : (isSignup ? 'Register Account' : 'Citizen Login')}
                    </Button>
                    
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        {isSignup ? 'Already registered? Login here' : "New citizen? Register here"}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="admin">
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-gray-700 font-medium">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="text-gray-700 font-medium">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pin" className="text-gray-700 font-medium">Security PIN</Label>
                      <Input
                        id="pin"
                        type="password"
                        placeholder="Enter 4-digit PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        maxLength={4}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium" 
                      disabled={loading}
                    >
                      {loading ? 'Authenticating...' : 'Admin Login'}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
