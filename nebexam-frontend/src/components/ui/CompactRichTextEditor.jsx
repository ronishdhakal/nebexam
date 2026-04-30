'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '@/lib/api';
import MathDropdown from '@/components/ui/MathDropdown';
import { migrateCustomLatexDelimiters } from '@/lib/latexMigration';

/** Lightweight inline editor — bold, italic, underline, code only. */
export default function CompactRichTextEditor({ value, onChange, placeholder = 'Write here...' }) {
  const initialContent = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      bulletList: false,
      orderedList: false,
      horizontalRule: false,
      codeBlock: false,
    }),
    Underline,
    Image.configure({ inline: true, allowBase64: false }),
    Placeholder.configure({ placeholder }),
    Mathematics,
  ], [placeholder]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent.current || '',
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) { migrateCustomLatexDelimiters(editor); migrateMathStrings(editor); }
  }, [editor]);

  // mathMenu: null | { initialTemplate?: string }
  const [mathMenu, setMathMenu] = useState(null);
  const mathBtnRef = useRef(null);
  const fileRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editor) return;
    e.target.value = '';
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/content/upload-image/', formData);
      editor.chain().focus().setImage({ src: res.data.url }).run();
    } catch {
      alert('Image upload failed.');
    }
  };

  if (!editor) return null;

  const btn = (active, onClick, title, children) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );

  const sz = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

  return (
    <div
      className="border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
      onPaste={() => setTimeout(() => { if (editor) { migrateCustomLatexDelimiters(editor); migrateMathStrings(editor); } }, 0)}
    >
      {/* Mini toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-50 border-b border-slate-200 rounded-t-lg">
        {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      'Bold',          <svg {...sz}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>)}
        {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    'Italic',        <svg {...sz}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline',     <svg {...sz}><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>)}
        {btn(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    'Strikethrough', <svg {...sz}><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.3 12c.3.5.5 1.1.5 1.7 0 2.2-2 4-5 4s-5-1.8-5-4c0-.6.2-1.2.5-1.7M6.7 12C6.3 11.5 6 10.9 6 10.3 6 8 8 6.3 11 6.3s5 1.7 5 4c0 .6-.2 1.2-.5 1.7"/></svg>)}
        <div className="w-px h-4 bg-slate-300 mx-0.5" />
        {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Inline code',
          <svg {...sz}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        )}
        <div className="w-px h-4 bg-slate-300 mx-0.5" />
        {/* Power */}
        {btn(false, () => setMathMenu({ initialTemplate: 'power' }), 'Power / superscript (xⁿ)',
          <span className="text-[10px] font-bold leading-none">x<sup>n</sup></span>
        )}
        {/* Subscript */}
        {btn(false, () => setMathMenu({ initialTemplate: 'subscript' }), 'Base / subscript (xₙ)',
          <span className="text-[10px] font-bold leading-none">x<sub>n</sub></span>
        )}
        {/* Math dropdown */}
        <div ref={mathBtnRef}>
          {btn(!!mathMenu, () => setMathMenu((v) => v ? null : {}), 'Math formulas & symbols',
            <svg {...sz} viewBox="0 0 24 24"><text x="2" y="16" fontSize="13" fontFamily="serif" fontStyle="italic" fill="currentColor" stroke="none">∑</text></svg>
          )}
          {mathMenu && (
            <MathDropdown editor={editor} onClose={() => setMathMenu(null)} initialTemplate={mathMenu.initialTemplate} triggerRef={mathBtnRef} />
          )}
        </div>
        <div className="w-px h-4 bg-slate-300 mx-0.5" />
        {btn(false, () => fileRef.current.click(), 'Insert image',
          <svg {...sz}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
      {/* Editor area */}
      <EditorContent editor={editor} className="[&_.ProseMirror]:px-3 [&_.ProseMirror]:py-1.5 [&_.ProseMirror]:text-sm [&_.ProseMirror]:min-h-[2rem] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none" />
    </div>
  );
}
