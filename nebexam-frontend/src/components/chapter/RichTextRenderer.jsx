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
import { useEffect, useRef, useState } from 'react';
import ImageLightbox from '@/components/ui/ImageLightbox';

export default function RichTextRenderer({ content }) {
  const wrapperRef = useRef(null);
  const [lightbox, setLightbox] = useState(null); // { src, alt }

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

  // Attach click listener to all images inside the rendered content
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handler = (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      setLightbox({ src: img.src, alt: img.alt });
    };

    wrapper.addEventListener('click', handler);
    return () => wrapper.removeEventListener('click', handler);
  }, [editor]); // re-run when editor (and thus DOM) is ready

  // Make images show a zoom cursor via injected style
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const style = document.createElement('style');
    style.textContent = `.prose-render img { cursor: zoom-in; }`;
    wrapper.appendChild(style);
    return () => style.remove();
  }, []);

  if (!content) return null;

  return (
    <div ref={wrapperRef} className="prose-render">
      <EditorContent editor={editor} />
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
