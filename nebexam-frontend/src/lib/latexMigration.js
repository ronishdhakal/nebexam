/**
 * Custom LaTeX delimiter migration.
 *
 * Supported syntax:
 *   $$$formula$$$          → inline math
 *   $$$$formula$$          → block/display math (single line)
 *   $$$$                   → block/display math (multi-line: opener on its own line,
 *   formula lines...          formula on following lines, $$ on its own closing line)
 *   $$
 *
 * After conversion, migrateMathStrings() from @tiptap/extension-mathematics
 * converts the standard $...$ and $$...$$ patterns to proper math nodes.
 */
export function migrateCustomLatexDelimiters(editor) {
  // Step 1: Merge multi-paragraph $$$$...\n...\n$$ blocks into a single paragraph
  _mergeMultiParagraphBlockMath(editor);
  // Step 2: Convert remaining single-line custom delimiters inside text nodes
  _convertSingleNodeDelimiters(editor);
}

/**
 * Finds sequences of paragraphs like:
 *   [paragraph: "$$$$"]
 *   [paragraph: formula line 1]
 *   [paragraph: formula line 2]
 *   [paragraph: "$$"]
 * and collapses them into a single paragraph containing "$$formula$$".
 * migrateMathStrings() then turns that into a proper mathDisplay node.
 */
function _mergeMultiParagraphBlockMath(editor) {
  const { state, view } = editor;
  const { doc } = state;

  // Collect all top-level block nodes with their document positions
  const blocks = [];
  doc.forEach((node, offset) => {
    blocks.push({ node, offset, end: offset + node.nodeSize });
  });

  const replacements = [];

  for (let i = 0; i < blocks.length; i++) {
    const { node, offset } = blocks[i];
    if (!node.isTextblock) continue;

    const text = node.textContent.trim();
    if (text !== '$$$$') continue; // Only handle standalone $$$$ opener

    // Scan forward for the closing $$
    const contentParts = [];
    let j = i + 1;
    let found = false;

    while (j < blocks.length) {
      const jNode = blocks[j].node;
      if (!jNode.isTextblock) { j++; continue; }
      const jText = jNode.textContent.trim();

      if (jText === '$$') {
        found = true;
        break;
      }
      contentParts.push(jNode.textContent);
      j++;
    }

    if (found && j > i) {
      replacements.push({
        from: offset,
        to: blocks[j].end,
        latex: contentParts.join('\n').trim(),
      });
      i = j; // skip over processed blocks
    }
  }

  if (!replacements.length) return;

  const tr = state.tr;
  // Apply in reverse order so later positions don't shift earlier ones
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { from, to, latex } = replacements[i];
    const textNode = state.schema.text(`$$${latex}$$`);
    const para = state.schema.nodes.paragraph.create(null, textNode);
    tr.replaceWith(from, to, para);
  }
  view.dispatch(tr);
}

/**
 * Within individual text nodes, converts:
 *   $$$$content$$  →  $$content$$   (single-line block math)
 *   $$$content$$$  →  $content$     (inline math)
 *
 * Block is processed first so a leading $$$$ is never misread as inline $$$.
 */
function _convertSingleNodeDelimiters(editor) {
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

  for (let i = replacements.length - 1; i >= 0; i--) {
    const { pos, end, newText, marks } = replacements[i];
    tr.replaceWith(pos, end, state.schema.text(newText, marks));
  }
  view.dispatch(tr);
}
