import { useState, useRef } from 'react';
import { Loader2, X, Image as ImageIcon, Video, Play, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaUploadProps {
  imageUrl: string;
  videoUrl: string;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
}

export function MediaUpload({ 
  imageUrl, 
  videoUrl, 
  onImageChange, 
  onVideoChange 
}: MediaUploadProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Store the file in state
    setSelectedImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be less than 100MB');
      return;
    }

    // Store the file in state
    setSelectedVideoFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const uploadImage = async () => {
    if (!selectedImageFile) {
      toast.error('No file selected');
      return;
    }

    const file = selectedImageFile;

    setUploadingImage(true);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to upload images');
        setUploadingImage(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(uploadError.message || 'Failed to upload image');
        setUploadingImage(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      setImagePreview(null);
      setSelectedImageFile(null);
      toast.success('Image uploaded successfully');
      
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadVideo = async () => {
    if (!selectedVideoFile) {
      toast.error('No file selected');
      return;
    }

    const file = selectedVideoFile;

    setUploadingVideo(true);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to upload videos');
        setUploadingVideo(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(uploadError.message || 'Failed to upload video');
        setUploadingVideo(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      onVideoChange(publicUrl);
      setVideoPreview(null);
      setSelectedVideoFile(null);
      toast.success('Video uploaded successfully');
      
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setUploadingVideo(false);
    }
  };

  const cancelImagePreview = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const cancelVideoPreview = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setSelectedVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    onImageChange('');
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  const removeVideo = () => {
    onVideoChange('');
    setVideoPreview(null);
    setSelectedVideoFile(null);
  };

  return (
    <div className="space-y-4">
      <Label>Featured Media</Label>
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-4">
          <div className="border-2 border-dashed border-divider rounded-xl p-6 bg-muted/30">
            {/* Already uploaded image */}
            {imageUrl && !imagePreview ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Featured"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs text-muted-foreground">
                  Uploaded
                </div>
              </div>
            ) : imagePreview ? (
              /* Image preview before upload */
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-primary/50"
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    Preview
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelImagePreview}
                    disabled={uploadingImage}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Confirm Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Upload prompt */
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="text-muted-foreground font-medium">Click to select an image</span>
                <span className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <div className="border-2 border-dashed border-divider rounded-xl p-6 bg-muted/30">
            {/* Already uploaded video */}
            {videoUrl && !videoPreview ? (
              <div className="relative">
                <video
                  src={videoUrl}
                  className="w-full h-64 object-cover rounded-lg bg-black"
                  controls
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : videoPreview ? (
              /* Video preview before upload */
              <div className="space-y-4">
                <div className="relative">
                  <video
                    src={videoPreview}
                    className="w-full h-64 object-cover rounded-lg bg-black border-2 border-primary/50"
                    controls
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Preview
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelVideoPreview}
                    disabled={uploadingVideo}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadVideo}
                    disabled={uploadingVideo}
                  >
                    {uploadingVideo ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Confirm Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Upload prompt */
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg">
                <Video className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="text-muted-foreground font-medium">Click to select a video</span>
                <span className="text-sm text-muted-foreground mt-1">MP4, WebM, MOV up to 100MB</span>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Status indicators */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {imageUrl && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Image attached
          </span>
        )}
        {videoUrl && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Video attached
          </span>
        )}
      </div>
    </div>
  );
}
