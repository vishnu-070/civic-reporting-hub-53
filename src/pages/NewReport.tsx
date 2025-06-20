
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Phone, MapPin } from 'lucide-react';

const NewReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: emergencyCategories = [] } = useQuery({
    queryKey: ['emergency-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'emergency');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: nonEmergencyCategories = [] } = useQuery({
    queryKey: ['non-emergency-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'non_emergency');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId
  });

  const submitReport = async (type: 'emergency' | 'non_emergency') => {
    if (!title || !description || !categoryId || !subcategoryId) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user?.id,
          title,
          description,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          type,
          location_address: location,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Report submitted successfully!",
        description: "We'll review your report and take appropriate action."
      });

      navigate('/my-reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setSubcategoryId('');
    setLocation('');
  };

  return (
    <Layout title="New Report" showBack={true}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Submit a Report
            </CardTitle>
            <CardDescription>
              Report incidents or issues that need government attention
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="emergency" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="emergency" className="text-red-600">
                  Emergency
                </TabsTrigger>
                <TabsTrigger value="non-emergency">
                  Non-Emergency
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="emergency" className="space-y-4 mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">For life-threatening emergencies, call 911 immediately</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emergency-title">Title *</Label>
                    <Input
                      id="emergency-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief description of the emergency"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency-category">Category *</Label>
                    <Select value={categoryId} onValueChange={(value) => {
                      setCategoryId(value);
                      setSubcategoryId('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emergency category" />
                      </SelectTrigger>
                      <SelectContent>
                        {emergencyCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {subcategories.length > 0 && (
                    <div>
                      <Label htmlFor="emergency-subcategory">Subcategory *</Label>
                      <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((subcategory: any) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="emergency-location">Location</Label>
                    <Input
                      id="emergency-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Street address or landmark"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency-description">Description *</Label>
                    <Textarea
                      id="emergency-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed information about the emergency"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => submitReport('emergency')} 
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Submitting...' : 'Submit Emergency Report'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="non-emergency" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="non-emergency-title">Title *</Label>
                    <Input
                      id="non-emergency-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="non-emergency-category">Category *</Label>
                    <Select value={categoryId} onValueChange={(value) => {
                      setCategoryId(value);
                      setSubcategoryId('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {nonEmergencyCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {subcategories.length > 0 && (
                    <div>
                      <Label htmlFor="non-emergency-subcategory">Subcategory *</Label>
                      <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((subcategory: any) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="non-emergency-location">Location</Label>
                    <Input
                      id="non-emergency-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Street address or landmark"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="non-emergency-description">Description *</Label>
                    <Textarea
                      id="non-emergency-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed information about the issue"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => submitReport('non_emergency')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewReport;
