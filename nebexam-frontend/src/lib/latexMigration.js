/**
 * Converts custom LaTeX delimiters to standard ones before migrateMathStrings runs:
 *   $$$$...$$  →  $$...$$  (block / display math)
 *   $$$...$$$  →  $...$   (inline math)
 *
 * Processes block first so a leading $$$$ is never misread as the inline $$$
 * opener. After this runs, migrateMathStrings converts the standard delimiters
 * into proper Tiptap math nodes.
 */
export function migrateCustomLatexDelimiters(editor) {
  const { state, view } = editor;
  const { doc } = state;
  const tr = state.tr;
  const replacements = [];

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text;
    let newText = text;

    // Block: $$$$content$$  →  $$content$$
    newText = newText.replace(/\$\$\$\$([\s\S]*?)\$\$(?!\$)/g, (_, c) => `$$${c}$$`);
    // Inline: $$$content$$$  →  $content$
    newText = newText.replace(/\$\$\$([\s\S]*?)\$\$\$(?!\$)/g, (_, c) => `$${c}$`);

    if (newText !== text) {
      replacements.push({ pos, end: pos + node.nodeSize, newText, marks: node.marks });
    }
  });

  if (!replacements.length) return;

  // Apply in reverse order so later-position changes don't shift earlier positions
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { pos, end, newText, marks } = replacements[i];
    tr.replaceWith(pos, end, state.schema.text(newText, marks));
  }
  view.dispatch(tr);
}
