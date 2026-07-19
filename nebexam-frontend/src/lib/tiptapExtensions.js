import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Mathematics from '@tiptap/extension-mathematics';

// Shared extension set for both the interactive editor (useEditor) and the
// isomorphic static renderer (renderToHTMLString) — must stay in sync so
// server-rendered HTML matches what the client would produce.
export const tiptapExtensions = [
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
];
