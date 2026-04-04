'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import { useEffect, useMemo } from 'react';

export default function RichTextRenderer({ value }) {
  const extensions = useMemo(() => [StarterKit, Image, Link, Mathematics], []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value || '',
    editable: false,
  });

  useEffect(() => {
    if (editor) migrateMathStrings(editor);
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="prose-render">
      <EditorContent editor={editor} />
    </div>
  );
}
