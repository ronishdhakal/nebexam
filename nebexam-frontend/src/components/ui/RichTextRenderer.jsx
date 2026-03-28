'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useMemo } from 'react';

export default function RichTextRenderer({ value }) {
  const extensions = useMemo(() => [StarterKit, Image, Link], []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value || '',
    editable: false,
  });

  if (!editor) return null;

  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      <EditorContent editor={editor} />
    </div>
  );
}
