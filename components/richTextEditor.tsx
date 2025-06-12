import { useEditor, EditorContent } from '@tiptap/react';
import { Markdown } from 'tiptap-markdown';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading,
  WrapText,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  variant?: 'single-line' | 'multi-line';
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, variant = 'multi-line', placeholder }: RichTextEditorProps) => {
  // Add client-side only rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
        Markdown,
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: variant === 'multi-line' ? 'mb-2' : '',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-5',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'my-1',
          },
        },
        heading: variant === 'multi-line' ? {} : false,
        horizontalRule: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
    },
    enableInputRules: variant === 'multi-line',
    // Add SSR configuration
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none prose-ul:pl-5 prose-ol:pl-5 prose-li:my-1 max-w-none',
        placeholder: placeholder || '',
      },
    },
    onCreate: ({ editor }) => {
      // Force an immediate render on client-side
      editor.view.updateState(editor.view.state);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && variant === 'single-line') {
      const handleEnter = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          editor.chain().focus().setHardBreak().run();
        }
      };
      
      editor.view.dom.addEventListener('keydown', handleEnter);
      
      return () => {
        editor.view.dom.removeEventListener('keydown', handleEnter);
      };
    }

    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false); // `false` prevents it from affecting history (undo/redo)
    }
    
  }, [editor, variant, content]);

  if (!isMounted) {
    // Return a placeholder while the component is being mounted
    return (
      <div className={`border rounded-md ${variant === 'single-line' ? 'min-h-[40px]' : 'min-h-[200px]'}`}>
        <div className="border-b p-2" />
        <div className={`p-4 prose max-w-none`} />
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-md ${variant === 'single-line' ? 'min-h-[40px]' : ''}`}>
      <div className="border-b p-2 flex gap-2 flex-wrap">
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          {variant === 'multi-line' && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-muted' : ''}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          {variant === 'multi-line' && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
              >
                <Heading className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHardBreak().run()}
                title="Add line break (Shift+Enter)"
              >
                <WrapText className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className={`p-4 prose max-w-none ${variant === 'single-line' ? 'min-h-[40px]' : 'min-h-[200px]'}`}
      />
    </div>
  );
};

export default RichTextEditor;