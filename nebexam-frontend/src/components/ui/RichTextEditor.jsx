'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '@/lib/api';

export default function RichTextEditor({ value, onChange, placeholder = 'Write here...' }) {
  const initialContent = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [tableMenu, setTableMenu] = useState(false);
  const [imageMenu, setImageMenu] = useState(false);

  const extensions = useMemo(() => [
    StarterKit,
    Image.configure({ inline: false, allowBase64: false }),
    Youtube.configure({ controls: true, width: '100%', height: 360 }),
    Placeholder.configure({ placeholder }),
    Link.configure({ openOnClick: false }),
    Underline,
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
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
    if (editor) migrateMathStrings(editor);
  }, [editor]);

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

  const addImageFromUrl = () => {
    setImageMenu(false);
    const url = prompt('Enter image URL:');
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = prompt('Enter YouTube URL:');
    if (url && editor) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
      onPaste={() => setTimeout(() => { if (editor) migrateMathStrings(editor); }, 0)}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">

        {/* Text style group */}
        <ToolGroup>
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <BoldIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <ItalicIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <UnderlineIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <StrikeIcon />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Heading group */}
        <ToolGroup>
          <ToolBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Normal text">
            <span className="text-xs font-medium px-0.5">¶</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <span className="text-xs font-bold">H1</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <span className="text-xs font-bold">H2</span>
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
            <span className="text-xs font-bold">H3</span>
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* List group */}
        <ToolGroup>
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <BulletListIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
            <OrderedListIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
            <QuoteIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
            <CodeIcon />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Media group */}
        <ToolGroup>
          <div className="relative">
            <ToolBtn onClick={() => setImageMenu((v) => !v)} title="Insert image">
              <ImageIcon />
            </ToolBtn>
            {imageMenu && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                <button
                  type="button"
                  onClick={() => { setImageMenu(false); fileRef.current.click(); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={addImageFromUrl}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                >
                  From URL
                </button>
              </div>
            )}
          </div>
          <ToolBtn onClick={addYoutube} title="Embed YouTube video">
            <YoutubeIcon />
          </ToolBtn>
          <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Insert link">
            <LinkIcon />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Table group */}
        <div className="relative">
          <ToolBtn
            onClick={() => setTableMenu((v) => !v)}
            active={editor.isActive('table')}
            title="Table"
          >
            <TableIcon />
          </ToolBtn>
          {tableMenu && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[170px]">
              <TableMenuItem
                label="Insert Table"
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  setTableMenu(false);
                }}
              />
              <div className="my-1 h-px bg-gray-100" />
              <TableMenuItem label="Add Row Before"  onClick={() => { editor.chain().focus().addRowBefore().run();    setTableMenu(false); }} />
              <TableMenuItem label="Add Row After"   onClick={() => { editor.chain().focus().addRowAfter().run();     setTableMenu(false); }} />
              <TableMenuItem label="Delete Row"      onClick={() => { editor.chain().focus().deleteRow().run();       setTableMenu(false); }} />
              <div className="my-1 h-px bg-gray-100" />
              <TableMenuItem label="Add Col Before"  onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableMenu(false); }} />
              <TableMenuItem label="Add Col After"   onClick={() => { editor.chain().focus().addColumnAfter().run();  setTableMenu(false); }} />
              <TableMenuItem label="Delete Column"   onClick={() => { editor.chain().focus().deleteColumn().run();    setTableMenu(false); }} />
              <div className="my-1 h-px bg-gray-100" />
              <TableMenuItem label="Delete Table" danger onClick={() => { editor.chain().focus().deleteTable().run(); setTableMenu(false); }} />
            </div>
          )}
        </div>

        <Divider />

        {/* Math group */}
        <ToolGroup>
          <ToolBtn
            onClick={() => editor.chain().focus().insertContent('$  $').run()}
            active={editor.isActive('math')}
            title="Insert inline math ($...$)"
          >
            <MathIcon />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* History group */}
        <ToolGroup>
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
            <UndoIcon />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
            <RedoIcon />
          </ToolBtn>
        </ToolGroup>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolGroup({ children }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-1 shrink-0" />;
}

function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

/* ── SVG Icons ─────────────────────────────────────────────────────── */
const sz = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function BoldIcon()    { return <svg {...sz}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>; }
function ItalicIcon()  { return <svg {...sz}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>; }
function UnderlineIcon() { return <svg {...sz}><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>; }
function StrikeIcon()  { return <svg {...sz}><path d="M17.3 12H12m-3.5 0H6.7M12 7.5c-2.2 0-4 1.1-4 2.8 0 1 .6 1.9 1.7 2.4M12 16.5c2.2 0 4-1.1 4-2.8"/><line x1="4" y1="12" x2="20" y2="12"/></svg>; }
function BulletListIcon() { return <svg {...sz}><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>; }
function OrderedListIcon() { return <svg {...sz}><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M3 18h3M5 18v-2a1 1 0 0 0-1-1H3" strokeWidth="1.5"/></svg>; }
function QuoteIcon()   { return <svg {...sz}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>; }
function CodeIcon()    { return <svg {...sz}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function ImageIcon()   { return <svg {...sz}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function YoutubeIcon() { return <svg {...sz}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>; }
function LinkIcon()    { return <svg {...sz}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
function UndoIcon()    { return <svg {...sz}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>; }
function RedoIcon()    { return <svg {...sz}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.86"/></svg>; }
function TableIcon()   { return <svg {...sz}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>; }
function MathIcon()    { return <svg {...sz} viewBox="0 0 24 24"><text x="2" y="17" fontSize="14" fontFamily="serif" fontStyle="italic" fill="currentColor" stroke="none">∑</text></svg>; }

function TableMenuItem({ label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-slate-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
