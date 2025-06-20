import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Upload, X, Camera, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const NewReport = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'non-emergency',
    category_id: '',
    subcategory_id: '',
    location_address: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories', formData.category_id],
    queryFn: async () => {
      if (!formData.category_id) return [];
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', formData.category_id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!formData.category_id
  });

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        console.log('Uploading file:', fileName, 'Size:', file.size);

        // Upload file to storage bucket with better error handling
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL with proper error handling
        const { data: { publicUrl } } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName);

        console.log('Public URL generated:', publicUrl);
        return publicUrl;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  const submitReport = useMutation({
    mutationFn: async (reportData: any) => {
      let imageUrls: string[] = [];
      
      // Handle image uploads first
      if (selectedImages.length > 0) {
        setIsUploading(true);
        try {
          console.log('Starting upload of', selectedImages.length, 'images');
          imageUrls = await uploadImages(selectedImages);
          console.log('All images uploaded successfully:', imageUrls);
          toast.success(`${imageUrls.length} images uploaded successfully!`);
        } catch (error) {
          console.error('Error uploading images:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
          toast.error(`Failed to upload images: ${errorMessage}`);
          throw new Error(`Image upload failed: ${errorMessage}`);
        } finally {
          setIsUploading(false);
        }
      }

      console.log('Submitting report with image URLs:', imageUrls);

      // Create report payload and convert empty strings to null for UUID fields
      const reportPayload = {
        title: reportData.title.trim(),
        description: reportData.description.trim(),
        type: reportData.type,
        category_id: reportData.category_id || null,
        subcategory_id: reportData.subcategory_id || null,
        location_address: reportData.location_address.trim() || null,
        location_lat: reportData.location_lat,
        location_lng: reportData.location_lng,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        user_id: null // Allow null for now since we don't have proper auth
      };

      console.log('Report payload:', reportPayload);

      // Insert the report
      const { data, error } = await supabase
        .from('reports')
        .insert(reportPayload)
        .select()
        .single();

      if (error) {
        console.error('Error creating report:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Report created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Report submission successful:', data);
      toast.success('Report submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      navigate('/citizen');
    },
    onError: (error) => {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to submit report: ${errorMessage}`);
    }
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = selectedImages.length + files.length;
    
    if (totalImages > 5) {
      toast.error('You can only upload up to 5 images per report.');
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file.`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude
          }));
          toast.success('Location captured successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get current location. Please enter address manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your report.');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description for your report.');
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Please select a category for your report.');
      return;
    }
    
    console.log('Submitting form with', selectedImages.length, 'selected images');
    submitReport.mutate(formData);
  };

  const isSubmitting = submitReport.isPending || isUploading;

  return (
    <Layout title="Submit New Report">
      <style>
        {`
          input[type="file"][capture]::-webkit-file-upload-button {
            transform: scaleX(-1);
          }
          
          video {
            transform: scaleX(-1);
          }
          
          .camera-preview {
            transform: scaleX(-1);
          }
        `}
      </style>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit New Report</CardTitle>
            <CardDescription>
              Report an incident or issue that needs attention from local authorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your report"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the incident or issue"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Report Type *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  className="flex flex-row gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-emergency" id="non-emergency" />
                    <Label htmlFor="non-emergency">Non-Emergency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Emergency
                    </Label>
                  </div>
                </RadioGroup>
                {formData.type === 'emergency' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      <strong>Emergency reports</strong> require immediate attention and will be prioritized.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      category_id: value,
                      subcategory_id: '' // Reset subcategory when category changes
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.category_id && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select 
                      value={formData.subcategory_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}
                    >
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
              </div>

              <div className="space-y-4">
                <Label>Location</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.location_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                    placeholder="Enter address or location description"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={getCurrentLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                </div>
                {formData.location_lat && formData.location_lng && (
                  <Badge variant="secondary" className="text-sm">
                    Location: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <Label>Upload Images (Optional)</Label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        disabled={selectedImages.length >= 5}
                        className="cursor-pointer"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.capture = 'environment';
                        input.style.transform = 'scaleX(-1)';
                        input.onchange = (e) => handleImageSelect(e as any);
                        input.click();
                      }}
                      disabled={selectedImages.length >= 5}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </Button>
                  </div>
                  
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
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
                  
                  <p className="text-sm text-gray-500">
                    You can upload up to 5 images. Accepted formats: JPG, PNG, GIF, WebP (Max 50MB per image)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? 'Uploading Images...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/citizen')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewReport;
