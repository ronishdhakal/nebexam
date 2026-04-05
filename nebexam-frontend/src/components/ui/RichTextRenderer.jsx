'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import { useEffect, useRef, useState, useMemo } from 'react';
import ImageLightbox from '@/components/ui/ImageLightbox';

export default function RichTextRenderer({ value }) {
  const extensions = useMemo(() => [StarterKit, Image, Link, Mathematics], []);
  const wrapperRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value || '',
    editable: false,
  });

  useEffect(() => {
    if (editor) migrateMathStrings(editor);
  }, [editor]);

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
  }, [editor]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const style = document.createElement('style');
    style.textContent = `.prose-render img { cursor: zoom-in; }`;
    wrapper.appendChild(style);
    return () => style.remove();
  }, []);

  if (!editor) return null;

  return (
    <div ref={wrapperRef} className="prose-render">
      <EditorContent editor={editor} />
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
