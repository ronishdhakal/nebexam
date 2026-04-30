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
import { migrateCustomLatexDelimiters } from '@/lib/latexMigration';

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
    if (editor) { migrateCustomLatexDelimiters(editor); migrateMathStrings(editor); }
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

  // Wrap images in a zoomable container with a visible expand badge
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const imgs = wrapper.querySelectorAll('img');
    imgs.forEach((img) => {
      if (img.closest('.img-zoom-wrap')) return; // already wrapped
      const wrap = document.createElement('span');
      wrap.className = 'img-zoom-wrap';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);

      const badge = document.createElement('span');
      badge.className = 'img-zoom-badge';
      badge.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
      wrap.appendChild(badge);
    });

    const style = document.createElement('style');
    style.textContent = `
      .img-zoom-wrap {
        display: inline-block;
        position: relative;
        cursor: zoom-in;
        line-height: 0;
      }
      .img-zoom-wrap img {
        cursor: zoom-in;
        border-radius: 6px;
        transition: opacity 0.15s;
      }
      .img-zoom-wrap:hover img,
      .img-zoom-wrap:active img {
        opacity: 0.92;
      }
      .img-zoom-badge {
        position: absolute;
        bottom: 6px;
        right: 6px;
        background: rgba(0,0,0,0.55);
        color: #fff;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
      }
      .img-zoom-wrap:hover .img-zoom-badge {
        opacity: 1;
      }
      @media (hover: none) {
        /* Always show badge on touch devices */
        .img-zoom-badge {
          opacity: 1;
        }
      }
    `;
    wrapper.appendChild(style);
    return () => style.remove();
  }, [editor]);

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
