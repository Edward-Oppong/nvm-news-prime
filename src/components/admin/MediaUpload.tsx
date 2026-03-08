import { useState, useRef } from 'react';
import { Loader2, X, Image as ImageIcon, Video, Play, Upload, Link as LinkIcon, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoItem {
  id?: string;
  video_url: string;
  video_type: 'upload' | 'embed';
  title: string;
  sort_order: number;
}

interface MediaUploadProps {
  imageUrl: string;
  videoUrl: string;
  videos: VideoItem[];
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  onVideosChange: (videos: VideoItem[]) => void;
}

function isEmbedUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

export function MediaUpload({ imageUrl, videoUrl, videos, onImageChange, onVideoChange, onVideosChange }: MediaUploadProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // --- Image handlers ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be less than 10MB'); return; }
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedImageFile) return;
    setUploadingImage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('You must be logged in to upload images'); return; }
      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `articles/${fileName}`;
      const { error } = await supabase.storage.from('article-images').upload(filePath, selectedImageFile, { cacheControl: '3600', upsert: false });
      if (error) { toast.error(error.message || 'Failed to upload image'); return; }
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(filePath);
      onImageChange(publicUrl);
      setImagePreview(null);
      setSelectedImageFile(null);
      toast.success('Image uploaded');
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch { toast.error('An unexpected error occurred'); } finally { setUploadingImage(false); }
  };

  const cancelImagePreview = () => { setImagePreview(null); setSelectedImageFile(null); if (imageInputRef.current) imageInputRef.current.value = ''; };
  const removeImage = () => { onImageChange(''); setImagePreview(null); setSelectedImageFile(null); };

  // --- Video file upload (adds to videos list) ---
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error('Video must be less than 100MB'); return; }
    setSelectedVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setNewVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const uploadVideo = async () => {
    if (!selectedVideoFile) return;
    setUploadingVideo(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('You must be logged in to upload videos'); return; }
      const fileExt = selectedVideoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;
      const { error } = await supabase.storage.from('article-videos').upload(filePath, selectedVideoFile, { cacheControl: '3600', upsert: false });
      if (error) { toast.error(error.message || 'Failed to upload video'); return; }
      const { data: { publicUrl } } = supabase.storage.from('article-videos').getPublicUrl(filePath);
      
      // Also set the legacy video_url to the first video
      if (!videoUrl && videos.length === 0) {
        onVideoChange(publicUrl);
      }

      const newVideo: VideoItem = {
        video_url: publicUrl,
        video_type: 'upload',
        title: newVideoTitle || 'Untitled Video',
        sort_order: videos.length,
      };
      onVideosChange([...videos, newVideo]);

      setVideoPreview(null);
      setSelectedVideoFile(null);
      setNewVideoTitle('');
      toast.success('Video uploaded');
      if (videoInputRef.current) videoInputRef.current.value = '';
    } catch { toast.error('An unexpected error occurred'); } finally { setUploadingVideo(false); }
  };

  const cancelVideoPreview = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setSelectedVideoFile(null);
    setNewVideoTitle('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // --- Embed handler (adds to videos list) ---
  const handleEmbedSubmit = () => {
    if (!embedUrl.trim()) { toast.error('Please enter a URL'); return; }
    if (!isEmbedUrl(embedUrl)) { toast.error('Please enter a valid YouTube or Vimeo URL'); return; }
    
    if (!videoUrl && videos.length === 0) {
      onVideoChange(embedUrl.trim());
    }

    const newVideo: VideoItem = {
      video_url: embedUrl.trim(),
      video_type: 'embed',
      title: embedTitle || 'Embedded Video',
      sort_order: videos.length,
    };
    onVideosChange([...videos, newVideo]);
    setEmbedUrl('');
    setEmbedTitle('');
    toast.success('Video embed added');
  };

  // --- Remove a video from list ---
  const removeVideoItem = (index: number) => {
    const updated = videos.filter((_, i) => i !== index);
    // Re-index sort_order
    const reordered = updated.map((v, i) => ({ ...v, sort_order: i }));
    onVideosChange(reordered);

    // Update legacy video_url
    if (reordered.length > 0) {
      onVideoChange(reordered[0].video_url);
    } else {
      onVideoChange('');
    }
  };

  return (
    <div className="space-y-4">
      <Label>Featured Media</Label>
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="video-upload" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Upload Video
          </TabsTrigger>
          <TabsTrigger value="video-embed" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Embed Video
          </TabsTrigger>
        </TabsList>

        {/* Image Tab */}
        <TabsContent value="image" className="mt-4">
          <div className="border-2 border-dashed border-divider rounded-xl p-6 bg-muted/30">
            {imageUrl && !imagePreview ? (
              <div className="relative">
                <img src={imageUrl} alt="Featured" className="w-full h-64 object-cover rounded-lg" />
                <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}><X className="h-4 w-4" /></Button>
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs text-muted-foreground">Uploaded</div>
              </div>
            ) : imagePreview ? (
              <div className="space-y-4">
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg border-2 border-primary/50" />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">Preview</div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button type="button" variant="outline" onClick={cancelImagePreview} disabled={uploadingImage}>Cancel</Button>
                  <Button type="button" onClick={uploadImage} disabled={uploadingImage}>
                    {uploadingImage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Confirm Upload</>}
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="text-muted-foreground font-medium">Click to select an image</span>
                <span className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</span>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>
        </TabsContent>

        {/* Video Upload Tab */}
        <TabsContent value="video-upload" className="mt-4">
          <div className="border-2 border-dashed border-divider rounded-xl p-6 bg-muted/30">
            {videoPreview ? (
              <div className="space-y-4">
                <div className="relative">
                  <video src={videoPreview} className="w-full h-64 object-cover rounded-lg bg-black border-2 border-primary/50" controls />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Play className="h-3 w-3" />Preview</div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="Video title (optional)"
                  />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button type="button" variant="outline" onClick={cancelVideoPreview} disabled={uploadingVideo}>Cancel</Button>
                  <Button type="button" onClick={uploadVideo} disabled={uploadingVideo}>
                    {uploadingVideo ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Confirm Upload</>}
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg">
                <Video className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="text-muted-foreground font-medium">Click to select a video</span>
                <span className="text-sm text-muted-foreground mt-1">MP4, WebM, MOV up to 100MB</span>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              </label>
            )}
          </div>
        </TabsContent>

        {/* Video Embed Tab */}
        <TabsContent value="video-embed" className="mt-4">
          <div className="border-2 border-dashed border-divider rounded-xl p-6 bg-muted/30">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <LinkIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="text-muted-foreground font-medium mb-4">Paste a YouTube or Vimeo URL</span>
                <div className="w-full max-w-lg space-y-2">
                  <Input
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    placeholder="Video title (optional)"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleEmbedSubmit}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Videos list */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <Label>Videos ({videos.length})</Label>
          <div className="space-y-2">
            {videos.map((video, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-2 flex-shrink-0">
                  {video.video_type === 'embed' ? (
                    <LinkIcon className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Video className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title || 'Untitled'}</p>
                  <p className="text-xs text-muted-foreground truncate">{video.video_url}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 capitalize">{video.video_type}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideoItem(index)}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {imageUrl && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Image attached
          </span>
        )}
        {videos.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {videos.length} video{videos.length !== 1 ? 's' : ''} attached
          </span>
        )}
      </div>
    </div>
  );
}

// Convert YouTube/Vimeo URLs to embeddable format
export function getEmbedSrc(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}
