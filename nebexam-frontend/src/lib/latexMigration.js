/**
 * Custom LaTeX delimiter migration.
 *
 * Supported input syntax (from ChatGPT prompt / manual entry):
 *   $$$formula$$$          → inline math  (inlineMath node)
 *   $$$$formula$$          → block math, single line  (blockMath node)
 *   $$$$                   → block math, multi-line opener
 *   formula lines...
 *   $$                     → block math, multi-line closer  (blockMath node)
 *
 * migrateMathStrings() from @tiptap/extension-mathematics only handles
 * $...$ → inlineMath, so we must create blockMath nodes ourselves.
 */
export function migrateCustomLatexDelimiters(editor) {
  // Order matters: longest patterns first to avoid partial matches.

  // 1. Multi-paragraph: $$$$\nformula lines\n$$  →  blockMath node
  _migrateMultiParaBlock(editor);

  // 2. Single-paragraph full line: $$$$formula$$  →  blockMath node
  _migrateSingleLineBlock(editor);

  // 3. Inline: $$$formula$$$  →  $formula$
  //    migrateMathStrings() (called by the component) then converts $...$ → inlineMath node
  _convertInlineDelimiters(editor);
}

// ─── Block math: multi-paragraph ────────────────────────────────────────────

/**
 * Finds sequences:
 *   paragraph("$$$$")
 *   paragraph(formula line 1)
 *   ...
 *   paragraph("$$")
 * and replaces the whole range with a single blockMath node.
 */
function _migrateMultiParaBlock(editor) {
  const { state, view } = editor;
  const blockMathType = state.schema.nodes.blockMath;
  if (!blockMathType) return;

  const blocks = [];
  state.doc.forEach((node, offset) => {
    blocks.push({ node, offset, end: offset + node.nodeSize });
  });

  const replacements = [];

  for (let i = 0; i < blocks.length; i++) {
    const { node, offset } = blocks[i];
    if (!node.isTextblock) continue;
    if (node.textContent.trim() !== '$$$$') continue;

    const contentParts = [];
    let j = i + 1;
    let found = false;

    while (j < blocks.length) {
      const jNode = blocks[j].node;
      if (!jNode.isTextblock) { j++; continue; }
      if (jNode.textContent.trim() === '$$') {
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
      i = j;
    }
  }

  if (!replacements.length) return;

  const tr = state.tr;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { from, to, latex } = replacements[i];
    tr.replaceWith(from, to, blockMathType.create({ latex }));
  }
  view.dispatch(tr);
}

// ─── Block math: single-line paragraph ──────────────────────────────────────

/**
 * Finds paragraphs whose entire text is $$$$formula$$
 * and replaces the paragraph with a blockMath node.
 */
function _migrateSingleLineBlock(editor) {
  const { state, view } = editor;
  const blockMathType = state.schema.nodes.blockMath;
  if (!blockMathType) return;

  const replacements = [];

  state.doc.forEach((node, offset) => {
    if (!node.isTextblock) return;
    const text = node.textContent;
    const match = text.match(/^\$\$\$\$([\s\S]+?)\$\$(?!\$)$/);
    if (match) {
      replacements.push({
        from: offset,
        to: offset + node.nodeSize,
        latex: match[1].trim(),
      });
    }
  });

  if (!replacements.length) return;

  const tr = state.tr;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { from, to, latex } = replacements[i];
    tr.replaceWith(from, to, blockMathType.create({ latex }));
  }
  view.dispatch(tr);
}

// ─── Inline math: text-node conversion ──────────────────────────────────────

/**
 * Within text nodes, converts $$$formula$$$ → $formula$.
 * migrateMathStrings() then converts $...$ → inlineMath nodes.
 */
function _convertInlineDelimiters(editor) {
  const { state, view } = editor;
  const tr = state.tr;
  const replacements = [];

  state.doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text;
    const newText = text.replace(/\$\$\$([\s\S]*?)\$\$\$(?!\$)/g, (_, c) => `$${c}$`);
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
