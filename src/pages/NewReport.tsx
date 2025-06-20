
import { useState, useEffect } from 'react';
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
import { AlertTriangle, Phone, MapPin, Upload, X } from 'lucide-react';

const NewReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [autoLocation, setAutoLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

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

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setAutoLocation(data.display_name || `${latitude}, ${longitude}`);
          } catch (error) {
            setAutoLocation(`${latitude}, ${longitude}`);
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location access denied",
            description: "Please enable location access or enter manually.",
            variant: "destructive"
          });
          setLocationLoading(false);
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      setLocationLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (selectedImages.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images only.",
        variant: "destructive"
      });
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    
    for (const image of selectedImages) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('report-images')
        .upload(fileName, image);
      
      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const submitReport = async (type: 'emergency' | 'non_emergency') => {
    if (!title || !description || !categoryId) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      const locationToUse = autoLocation || manualLocation;

      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user?.id,
          title,
          description,
          category_id: categoryId,
          subcategory_id: null,
          type,
          location_address: locationToUse,
          image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
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
    setManualLocation('');
    setAutoLocation('');
    setSelectedImages([]);
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
                    <Select value={categoryId} onValueChange={setCategoryId}>
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
                  
                  <div>
                    <Label>Location</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          {locationLoading ? 'Getting location...' : 'Get Current Location'}
                        </Button>
                      </div>
                      {autoLocation && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <strong>Detected:</strong> {autoLocation}
                        </div>
                      )}
                      <Input
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="Or enter location manually (optional)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Photos (up to 5)</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="cursor-pointer"
                      />
                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                    <Select value={categoryId} onValueChange={setCategoryId}>
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
                  
                  <div>
                    <Label>Location</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          {locationLoading ? 'Getting location...' : 'Get Current Location'}
                        </Button>
                      </div>
                      {autoLocation && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <strong>Detected:</strong> {autoLocation}
                        </div>
                      )}
                      <Input
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="Or enter location manually (optional)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Photos (up to 5)</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="cursor-pointer"
                      />
                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
