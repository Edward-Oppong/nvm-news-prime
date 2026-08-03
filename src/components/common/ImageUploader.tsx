import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Loader2, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { resizeAndConvertToWebP, isPortraitImage } from '@/lib/imageUtils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  aspect?: 'square' | 'cover';
}

export function ImageUploader({
  value,
  onChange,
  bucket = 'article-images',
  folder = 'uploads',
  label = 'Image',
  aspect = 'cover',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isPortrait, setIsPortrait] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file must be smaller than 10MB');
      return;
    }

    // Check portrait and warn
    const portrait = await isPortraitImage(file);
    setIsPortrait(portrait);
    if (portrait && aspect === 'cover') {
      toast.warning('Portrait image detected — it will be cropped to fit the landscape cover. A landscape photo works best.');
    }

    setUploading(true);

    try {
      // Resize + convert to WebP before uploading
      const resized = await resizeAndConvertToWebP(file, 2000, 1500, 0.87);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, resized, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        onChange(publicUrlData.publicUrl);
        toast.success(`${label} uploaded & optimised!`);
        setUploading(false);
        return;
      }

      // 2. Fallback: convert original to Data URL if bucket not configured
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange(dataUrl);
        toast.success(`${label} uploaded!`);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      // Fallback to Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange(dataUrl);
        toast.success(`${label} uploaded!`);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    toast.success(`${label} URL updated!`);
  };

  const removeImage = () => {
    onChange('');
    setIsPortrait(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Existing image preview */}
      {value ? (
        <div className="relative rounded-xl border border-divider overflow-hidden group bg-muted/30">
          <div
            className={
              aspect === 'square'
                ? 'w-24 h-24 rounded-full overflow-hidden mx-auto my-3 border-2 border-primary/30'
                : 'aspect-[21/9] w-full max-h-56 overflow-hidden relative'
            }
          >
            <img src={value} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: isPortrait && aspect === 'cover' ? 'center top' : 'center center' }} />
            {isPortrait && aspect === 'cover' && (
              <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1.5 bg-amber-500/80 text-white px-2 py-1 rounded text-[10px] font-medium">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                Portrait — cropped to landscape in hero
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="h-9 px-3"
            >
              <X className="h-4 w-4 mr-1.5" /> Remove Image
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="upload" className="text-xs font-semibold">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload File (Main)
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs font-semibold">
              <LinkIcon className="h-3.5 w-3.5 mr-1.5" /> Image URL (Secondary)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-divider hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-headline">Uploading image...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-headline">
                      Click to upload image file
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="text-sm"
              />
              <Button type="submit" size="sm">
                Apply URL
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
