import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Code,
  Minus,
  Loader2,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Video as VideoIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Custom TipTap Image Extension with alignment attribute & class mapping
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          let alignClass = 'mx-auto block max-w-full my-4 rounded-xl shadow-md';
          if (attributes.align === 'left') {
            alignClass = 'float-left mr-6 mb-4 max-w-[50%] rounded-xl shadow-md';
          } else if (attributes.align === 'right') {
            alignClass = 'float-right ml-6 mb-4 max-w-[50%] rounded-xl shadow-md';
          } else if (attributes.align === 'full') {
            alignClass = 'w-full my-6 rounded-xl shadow-md block';
          }

          return {
            'data-align': attributes.align,
            class: alignClass,
          };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing your story...' }: RichTextEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline font-medium',
        },
      }),
      CustomImage,
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-xl my-6 shadow-md',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[350px] px-4 py-4',
      },
    },
  });

  const initialContentRef = useRef(content);

  useEffect(() => {
    if (editor && content !== initialContentRef.current) {
      const currentHtml = editor.getHTML();
      if (content !== currentHtml) {
        editor.commands.setContent(content, { emitUpdate: false });
        initialContentRef.current = content;
      }
    }
  }, [content, editor]);

  // Handle uploading image to article-images bucket
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `inline/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      // Insert image with default center alignment
      editor.chain().focus().setImage({ src: publicUrl, align: 'center' } as any).run();
      toast.success('Image inserted into article!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Handle uploading video to article-videos bucket
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file (MP4, WebM)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }

    setUploadingVideo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `inline/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-videos')
        .getPublicUrl(filePath);

      // Insert video tag directly into editor content
      const videoHtml = `<video controls playsinline class="w-full aspect-video rounded-xl my-6 shadow-md" src="${publicUrl}"></video><p></p>`;
      editor.chain().focus().insertContent(videoHtml).run();
      toast.success('Video inserted into article!');
    } catch {
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const addImageFromUrl = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url, align: 'center' } as any).run();
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt('Enter YouTube URL (e.g. https://www.youtube.com/watch?v=...):');
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  const setImageAlignment = useCallback((align: 'left' | 'center' | 'right' | 'full') => {
    if (!editor) return;
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { align }).run();
    } else {
      toast.info('Click or select an image in the editor first to change its position');
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/40">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          aria-label="Code"
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Quote"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={setLink}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>

        {/* Hidden inputs for Image and Video upload */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFileSelect}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoFileSelect}
          className="hidden"
        />

        {/* Upload Inline Image */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage}
          className="h-8 px-2 gap-1 text-xs"
          title="Upload inline image into article body"
        >
          {uploadingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 text-primary" />
          )}
          <span className="hidden sm:inline">Image</span>
        </Button>

        {/* Upload Inline Video File */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploadingVideo}
          className="h-8 px-2 gap-1 text-xs"
          title="Upload inline video into article body"
        >
          {uploadingVideo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <VideoIcon className="h-4 w-4 text-purple-600" />
          )}
          <span className="hidden sm:inline">Video File</span>
        </Button>

        {/* YouTube Embed */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addYoutube}
          className="h-8 px-2 gap-1 text-xs"
          title="Embed YouTube video"
        >
          <YoutubeIcon className="h-4 w-4 text-red-600" />
          <span className="hidden sm:inline">YouTube</span>
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* IMAGE POSITIONING TOOLBAR BUTTONS */}
        <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageAlignment('left')}
            className="h-7 w-7 p-0"
            title="Align Image Left (Text wraps around right)"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageAlignment('center')}
            className="h-7 w-7 p-0"
            title="Align Image Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageAlignment('right')}
            className="h-7 w-7 p-0"
            title="Align Image Right (Text wraps around left)"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageAlignment('full')}
            className="h-7 w-7 p-0"
            title="Full Width Image"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Bubble Menu when selecting text or image */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-1 bg-background border border-input rounded-lg shadow-xl p-1">
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              onPressedChange={setLink}
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Toggle>
            <Separator orientation="vertical" className="h-4 mx-0.5" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setImageAlignment('left')}
              className="h-7 w-7 p-0"
              title="Float Left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setImageAlignment('center')}
              className="h-7 w-7 p-0"
              title="Center Image"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setImageAlignment('right')}
              className="h-7 w-7 p-0"
              title="Float Right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setImageAlignment('full')}
              className="h-7 w-7 p-0"
              title="Full Width"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content Container */}
      <EditorContent editor={editor} />
    </div>
  );
}
