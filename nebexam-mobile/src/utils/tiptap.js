export function tiptapToHtml(node) {
  if (!node) return '';
  if (node.type === 'text') {
    let text = (node.text ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    if (node.marks) {
      node.marks.forEach((m) => {
        if (m.type === 'bold')        text = `<strong>${text}</strong>`;
        if (m.type === 'italic')      text = `<em>${text}</em>`;
        if (m.type === 'underline')   text = `<u>${text}</u>`;
        if (m.type === 'code')        text = `<code>${text}</code>`;
        if (m.type === 'subscript')   text = `<sub>${text}</sub>`;
        if (m.type === 'superscript') text = `<sup>${text}</sup>`;
        if (m.type === 'highlight')   text = `<mark>${text}</mark>`;
      });
    }
    return text;
  }
  const children = (node.content ?? []).map(tiptapToHtml).join('');
  switch (node.type) {
    case 'doc':         return children;
    case 'paragraph':   return `<p>${children || '&nbsp;'}</p>`;
    case 'heading': {
      const lvl = node.attrs?.level ?? 2;
      return `<h${lvl}>${children}</h${lvl}>`;
    }
    case 'bulletList':  return `<ul>${children}</ul>`;
    case 'orderedList': return `<ol>${children}</ol>`;
    case 'listItem':    return `<li>${children}</li>`;
    case 'blockquote':  return `<blockquote>${children}</blockquote>`;
    case 'codeBlock':   return `<pre><code>${children}</code></pre>`;
    case 'horizontalRule': return '<hr/>';
    case 'hardBreak':   return '<br/>';
    case 'image':
      return `<img src="${node.attrs?.src ?? ''}" alt="${node.attrs?.alt ?? ''}" style="max-width:100%;border-radius:6px;margin:6px 0"/>`;
    case 'table':       return `<table>${children}</table>`;
    case 'tableRow':    return `<tr>${children}</tr>`;
    case 'tableCell':   return `<td>${children}</td>`;
    case 'tableHeader': return `<th>${children}</th>`;
    default:            return children;
  }
}

// Extracts plain text from Tiptap JSON (for previews/question lists)
export function tiptapToText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(tiptapToText).join(' ').replace(/\s+/g, ' ').trim();
}

export const NOTES_HTML_WRAPPER = (body) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,sans-serif;font-size:15px;line-height:1.75;color:#0F172A;padding:16px 16px 24px;background:#fff}
  h1{font-size:20px;font-weight:800;margin:20px 0 10px;color:#0F172A}
  h2{font-size:17px;font-weight:700;margin:16px 0 8px;color:#0F172A}
  h3{font-size:15px;font-weight:600;margin:13px 0 6px;color:#1e293b}
  p{margin:0 0 10px;color:#334155}
  ul,ol{padding-left:22px;margin:0 0 10px}
  li{margin-bottom:4px;color:#334155}
  blockquote{border-left:3px solid #1CA3FD;padding-left:14px;color:#64748b;margin:12px 0;font-style:italic}
  code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:13px;font-family:monospace}
  pre{background:#f1f5f9;padding:12px;border-radius:8px;overflow-x:auto;margin:10px 0}
  pre code{background:none;padding:0}
  hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0}
  strong{font-weight:700;color:#0f172a}
  mark{background:#fef9c3;padding:0 2px;border-radius:2px}
  table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
  td,th{border:1px solid #e2e8f0;padding:6px 10px;text-align:left}
  th{background:#f8fafc;font-weight:700;color:#374151}
  img{max-width:100%}
  sub,sup{font-size:0.75em}
</style>
</head><body>${body}</body></html>`;
