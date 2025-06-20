
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Eye } from 'lucide-react';

interface ReportImagesProps {
  imageUrl: string | null;
}

const ReportImages = ({ imageUrl }: ReportImagesProps) => {
  console.log('Rendering images for URL:', imageUrl);
  
  if (!imageUrl) {
    console.log('No image URL provided');
    return null;
  }

  const imageUrls = imageUrl.split(',').map(url => url.trim()).filter(url => url);
  
  if (imageUrls.length === 0) {
    console.log('No valid image URLs found after processing');
    return null;
  }

  console.log('Processing image URLs:', imageUrls);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Image className="h-4 w-4" />
        <span className="text-sm font-medium">Images ({imageUrls.length})</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {imageUrls.map((url, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div className="relative cursor-pointer group">
                <img
                  src={url}
                  alt={`Report image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border hover:opacity-80 transition-opacity"
                  onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                  onError={(e) => {
                    console.error(`Error loading image ${index + 1}:`, url);
                    console.error('Image error event:', e);
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Report Image {index + 1}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={url}
                  alt={`Report image ${index + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                  onLoad={() => console.log(`Modal image ${index + 1} loaded successfully`)}
                  onError={(e) => {
                    console.error(`Error loading modal image ${index + 1}:`, url);
                    console.error('Modal image error event:', e);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default ReportImages;
