'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import { useEffect } from 'react';

export default function RichTextRenderer({ content }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Youtube,
      Link,
      Underline,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Mathematics,
    ],
    content: content || '',
    editable: false,
  });

  useEffect(() => {
    if (editor) migrateMathStrings(editor);
  }, [editor]);

  if (!content) return null;

  return (
    <div className="prose-render">
      <EditorContent editor={editor} />
    </div>
  );
}
