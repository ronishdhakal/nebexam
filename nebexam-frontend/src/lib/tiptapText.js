// Extracts plain text from Tiptap JSON content — used to build meta
// descriptions / excerpts server-side without needing a separate field.
export function tiptapToText(node, maxLen = 160) {
  if (!node) return '';
  let text = '';

  const walk = (n) => {
    if (!n || text.length >= maxLen) return;
    if (n.type === 'text' && n.text) text += n.text;
    if (n.content) n.content.forEach(walk);
    if (n.type === 'paragraph' || n.type === 'heading') text += ' ';
  };
  walk(node);

  text = text.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}
