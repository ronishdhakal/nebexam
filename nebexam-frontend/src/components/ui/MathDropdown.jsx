'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { migrateMathStrings } from '@tiptap/extension-mathematics';

/* ── Data ────────────────────────────────────────────────────────────────── */

const TEMPLATE_SECTIONS = [
  {
    section: 'Arithmetic',
    items: [
      {
        id: 'fraction', label: 'Fraction', icon: 'ᵃ/ᵦ',
        fields: [{ key: 'a', label: 'Numerator', default: 'a' }, { key: 'b', label: 'Denominator', default: 'b' }],
        build: (v) => `\\frac{${v.a}}{${v.b}}`,
      },
      {
        id: 'power', label: 'Power', icon: 'xⁿ',
        fields: [{ key: 'base', label: 'Base', default: 'x' }, { key: 'exp', label: 'Exponent', default: 'n' }],
        build: (v) => `${v.base}^{${v.exp}}`,
      },
      {
        id: 'subscript', label: 'Subscript', icon: 'xₙ',
        fields: [{ key: 'base', label: 'Base', default: 'x' }, { key: 'sub', label: 'Subscript', default: 'n' }],
        build: (v) => `${v.base}_{${v.sub}}`,
      },
      {
        id: 'subpower', label: 'Sub+Power', icon: 'xₙᵐ',
        fields: [
          { key: 'base', label: 'Base', default: 'x' },
          { key: 'sub', label: 'Subscript (below)', default: 'n' },
          { key: 'exp', label: 'Exponent (above)', default: 'm' },
        ],
        build: (v) => `${v.base}_{${v.sub}}^{${v.exp}}`,
      },
    ],
  },
  {
    section: 'Roots',
    items: [
      {
        id: 'sqrt', label: 'Square Root', icon: '√x',
        fields: [{ key: 'x', label: 'Value', default: 'x' }],
        build: (v) => `\\sqrt{${v.x}}`,
      },
      {
        id: 'nthroot', label: 'Nth Root', icon: 'ⁿ√x',
        fields: [{ key: 'n', label: 'Root (n)', default: 'n' }, { key: 'x', label: 'Value', default: 'x' }],
        build: (v) => `\\sqrt[${v.n}]{${v.x}}`,
      },
    ],
  },
  {
    section: 'Calculus',
    items: [
      {
        id: 'sum', label: 'Sum', icon: '∑',
        fields: [
          { key: 'i', label: 'Variable', default: 'i' },
          { key: 'from', label: 'From', default: '1' },
          { key: 'to', label: 'To', default: 'n' },
          { key: 'expr', label: 'Expression', default: 'i' },
        ],
        build: (v) => `\\sum_{${v.i}=${v.from}}^{${v.to}} ${v.expr}`,
      },
      {
        id: 'product', label: 'Product', icon: '∏',
        fields: [
          { key: 'i', label: 'Variable', default: 'i' },
          { key: 'from', label: 'From', default: '1' },
          { key: 'to', label: 'To', default: 'n' },
          { key: 'expr', label: 'Expression', default: 'i' },
        ],
        build: (v) => `\\prod_{${v.i}=${v.from}}^{${v.to}} ${v.expr}`,
      },
      {
        id: 'integral', label: 'Integral', icon: '∫',
        fields: [
          { key: 'a', label: 'Lower bound', default: 'a' },
          { key: 'b', label: 'Upper bound', default: 'b' },
          { key: 'f', label: 'Function', default: 'f(x)' },
          { key: 'dx', label: 'Variable', default: 'x' },
        ],
        build: (v) => `\\int_{${v.a}}^{${v.b}} ${v.f}\\,d${v.dx}`,
      },
      {
        id: 'limit', label: 'Limit', icon: 'lim',
        fields: [
          { key: 'var', label: 'Variable', default: 'x' },
          { key: 'to', label: 'Approaches', default: '0' },
          { key: 'f', label: 'Function', default: 'f(x)' },
        ],
        build: (v) => `\\lim_{${v.var} \\to ${v.to}} ${v.f}`,
      },
      {
        id: 'derivative', label: 'Derivative', icon: 'dy/dx',
        fields: [
          { key: 'y', label: 'Function', default: 'y' },
          { key: 'x', label: 'Variable', default: 'x' },
        ],
        build: (v) => `\\frac{d${v.y}}{d${v.x}}`,
      },
      {
        id: 'partial', label: 'Partial', icon: '∂f/∂x',
        fields: [
          { key: 'f', label: 'Function', default: 'f' },
          { key: 'x', label: 'Variable', default: 'x' },
        ],
        build: (v) => `\\frac{\\partial ${v.f}}{\\partial ${v.x}}`,
      },
    ],
  },
  {
    section: 'Algebra',
    items: [
      {
        id: 'absolute', label: 'Absolute', icon: '|x|',
        fields: [{ key: 'x', label: 'Value', default: 'x' }],
        build: (v) => `|${v.x}|`,
      },
      {
        id: 'binomial', label: 'Binomial', icon: 'C(n,r)',
        fields: [{ key: 'n', label: 'n', default: 'n' }, { key: 'r', label: 'r', default: 'r' }],
        build: (v) => `\\binom{${v.n}}{${v.r}}`,
      },
      {
        id: 'log', label: 'Log base', icon: 'logₐx',
        fields: [{ key: 'a', label: 'Base', default: 'a' }, { key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\log_{${v.a}}(${v.x})`,
      },
      {
        id: 'ln', label: 'Natural log', icon: 'ln(x)',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\ln(${v.x})`,
      },
      {
        id: 'sin', label: 'Sine', icon: 'sin(x)',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\sin(${v.x})`,
      },
      {
        id: 'cos', label: 'Cosine', icon: 'cos(x)',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\cos(${v.x})`,
      },
      {
        id: 'tan', label: 'Tangent', icon: 'tan(x)',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\tan(${v.x})`,
      },
      {
        id: 'invsin', label: 'Inverse sin', icon: 'sin⁻¹',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\sin^{-1}(${v.x})`,
      },
      {
        id: 'invcos', label: 'Inverse cos', icon: 'cos⁻¹',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\cos^{-1}(${v.x})`,
      },
      {
        id: 'invtan', label: 'Inverse tan', icon: 'tan⁻¹',
        fields: [{ key: 'x', label: 'Argument', default: 'x' }],
        build: (v) => `\\tan^{-1}(${v.x})`,
      },
      {
        id: 'mean', label: 'Mean', icon: 'x̄',
        fields: [{ key: 'x', label: 'Variable', default: 'x' }],
        build: (v) => `\\bar{${v.x}}`,
      },
      {
        id: 'vector', label: 'Vector', icon: '→v',
        fields: [{ key: 'v', label: 'Variable', default: 'v' }],
        build: (v) => `\\vec{${v.v}}`,
      },
    ],
  },
];

// Flat lookup by id
const ALL_TEMPLATES = TEMPLATE_SECTIONS.flatMap((s) => s.items);

const SYMBOLS = [
  { display: '±',  latex: '\\pm' },
  { display: '∓',  latex: '\\mp' },
  { display: '×',  latex: '\\times' },
  { display: '÷',  latex: '\\div' },
  { display: '·',  latex: '\\cdot' },
  { display: '≤',  latex: '\\leq' },
  { display: '≥',  latex: '\\geq' },
  { display: '≠',  latex: '\\neq' },
  { display: '≈',  latex: '\\approx' },
  { display: '≡',  latex: '\\equiv' },
  { display: '∞',  latex: '\\infty' },
  { display: '∂',  latex: '\\partial' },
  { display: '∇',  latex: '\\nabla' },
  { display: '∅',  latex: '\\emptyset' },
  { display: '∈',  latex: '\\in' },
  { display: '∉',  latex: '\\notin' },
  { display: '⊂',  latex: '\\subset' },
  { display: '⊆',  latex: '\\subseteq' },
  { display: '∪',  latex: '\\cup' },
  { display: '∩',  latex: '\\cap' },
  { display: '→',  latex: '\\rightarrow' },
  { display: '←',  latex: '\\leftarrow' },
  { display: '↔',  latex: '\\leftrightarrow' },
  { display: '⇒',  latex: '\\Rightarrow' },
  { display: '⇔',  latex: '\\Leftrightarrow' },
  { display: '∀',  latex: '\\forall' },
  { display: '∃',  latex: '\\exists' },
  { display: '∴',  latex: '\\therefore' },
  { display: '∵',  latex: '\\because' },
  { display: '∑',  latex: '\\sum' },
  { display: '∏',  latex: '\\prod' },
  { display: '∫',  latex: '\\int' },
  { display: '√',  latex: '\\sqrt{}' },
];

const GREEK_LOWER = [
  { display: 'α', latex: '\\alpha' },   { display: 'β', latex: '\\beta' },
  { display: 'γ', latex: '\\gamma' },   { display: 'δ', latex: '\\delta' },
  { display: 'ε', latex: '\\epsilon' }, { display: 'ζ', latex: '\\zeta' },
  { display: 'η', latex: '\\eta' },     { display: 'θ', latex: '\\theta' },
  { display: 'ι', latex: '\\iota' },    { display: 'κ', latex: '\\kappa' },
  { display: 'λ', latex: '\\lambda' },  { display: 'μ', latex: '\\mu' },
  { display: 'ν', latex: '\\nu' },      { display: 'ξ', latex: '\\xi' },
  { display: 'π', latex: '\\pi' },      { display: 'ρ', latex: '\\rho' },
  { display: 'σ', latex: '\\sigma' },   { display: 'τ', latex: '\\tau' },
  { display: 'υ', latex: '\\upsilon' }, { display: 'φ', latex: '\\phi' },
  { display: 'χ', latex: '\\chi' },     { display: 'ψ', latex: '\\psi' },
  { display: 'ω', latex: '\\omega' },
];

const GREEK_UPPER = [
  { display: 'Γ', latex: '\\Gamma' },   { display: 'Δ', latex: '\\Delta' },
  { display: 'Θ', latex: '\\Theta' },   { display: 'Λ', latex: '\\Lambda' },
  { display: 'Ξ', latex: '\\Xi' },      { display: 'Π', latex: '\\Pi' },
  { display: 'Σ', latex: '\\Sigma' },   { display: 'Υ', latex: '\\Upsilon' },
  { display: 'Φ', latex: '\\Phi' },     { display: 'Ψ', latex: '\\Psi' },
  { display: 'Ω', latex: '\\Omega' },
];

/* ── KaTeX live preview ──────────────────────────────────────────────────── */
function KaTeXPreview({ latex }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!latex?.trim()) { el.innerHTML = ''; return; }
    import('katex').then((mod) => {
      const katex = mod.default ?? mod;
      if (!ref.current) return;
      try {
        katex.render(latex, ref.current, { throwOnError: false, displayMode: true });
      } catch {
        if (ref.current) ref.current.innerHTML = '';
      }
    });
  }, [latex]);

  return (
    <div className="min-h-12 flex items-center justify-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto my-2">
      {latex?.trim()
        ? <div ref={ref} />
        : <span className="text-slate-400 text-xs">Preview</span>
      }
    </div>
  );
}

/* ── Back button ─────────────────────────────────────────────────────────── */
function BackBtn({ onClick, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <button
        type="button" onClick={onClick}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

/* ── Template form (fill in values, see live preview) ────────────────────── */
function TemplateForm({ template, onInsert, onBack }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(template.fields.map((f) => [f.key, f.default]))
  );

  const latex = useMemo(() => {
    try { return template.build(values); } catch { return ''; }
  }, [values, template]);

  const set = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  return (
    <div>
      <BackBtn onClick={onBack} label={template.label} />
      <div className="space-y-2">
        {template.fields.map((f, i) => (
          <div key={f.key}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</label>
            <input
              type="text"
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.label}
              autoFocus={i === 0}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 font-mono bg-white"
            />
          </div>
        ))}
      </div>
      <KaTeXPreview latex={latex} />
      <button
        type="button"
        onClick={() => onInsert(latex)}
        disabled={!latex}
        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
      >
        Insert
      </button>
    </div>
  );
}

/* ── Templates tab (grid → form) ─────────────────────────────────────────── */
function TemplatesTab({ onInsert, initialTemplate }) {
  const [active, setActive] = useState(() =>
    initialTemplate ? ALL_TEMPLATES.find((t) => t.id === initialTemplate) ?? null : null
  );

  if (active) {
    return (
      <TemplateForm
        template={active}
        onInsert={onInsert}
        onBack={() => setActive(null)}
      />
    );
  }

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
      {TEMPLATE_SECTIONS.map(({ section, items }) => (
        <div key={section}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{section}</p>
          <div className="grid grid-cols-4 gap-1">
            {items.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActive(tpl)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm leading-none font-medium text-slate-800">{tpl.icon}</span>
                <span className="text-[9px] text-slate-400 leading-none text-center">{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Matrix tab ──────────────────────────────────────────────────────────── */
const MAX = 5;

function buildMatrixLatex(cells, type) {
  const body = cells.map((row) => row.join(' & ')).join(' \\\\ ');
  return `\\begin{${type}} ${body} \\end{${type}}`;
}

function MatrixTab({ onInsert }) {
  const [size, setSize] = useState(null); // { rows, cols } | null
  const [hover, setHover] = useState([0, 0]);
  const [cells, setCells] = useState([]);
  const [bracketType, setBracketType] = useState('pmatrix');

  const chooseSize = (rows, cols) => {
    setSize({ rows, cols });
    setCells(Array.from({ length: rows }, () => Array(cols).fill('0')));
  };

  const setCell = (r, c, val) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const latex = useMemo(() => {
    if (!size || cells.length === 0) return '';
    return buildMatrixLatex(cells, bracketType);
  }, [cells, bracketType, size]);

  if (!size) {
    return (
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hover then click to choose dimensions</p>
        <div
          className="inline-grid gap-1 mb-1"
          style={{ gridTemplateColumns: `repeat(${MAX}, 2rem)` }}
          onMouseLeave={() => setHover([0, 0])}
        >
          {Array.from({ length: MAX }, (_, r) =>
            Array.from({ length: MAX }, (_, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onMouseEnter={() => setHover([r + 1, c + 1])}
                onClick={() => chooseSize(r + 1, c + 1)}
                className={`w-8 h-8 rounded border transition-colors ${
                  r < hover[0] && c < hover[1]
                    ? 'bg-blue-500 border-blue-600'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                }`}
              />
            ))
          )}
        </div>
        <p className="text-xs font-semibold text-blue-600 h-5">
          {hover[0] > 0 ? `${hover[0]} × ${hover[1]} matrix` : ''}
        </p>
        <div className="grid grid-cols-3 gap-1 mt-2">
          {[
            { label: '2×2', r: 2, c: 2 }, { label: '3×3', r: 3, c: 3 },
            { label: '2×3', r: 2, c: 3 }, { label: '3×2', r: 3, c: 2 },
            { label: '2×1 col', r: 2, c: 1 }, { label: '1×2 row', r: 1, c: 2 },
          ].map(({ label, r, c }) => (
            <button
              key={label}
              type="button"
              onClick={() => chooseSize(r, c)}
              className="py-1.5 px-2 text-xs font-medium rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackBtn onClick={() => setSize(null)} label={`${size.rows} × ${size.cols} Matrix`} />

      {/* Bracket type */}
      <div className="flex gap-1 mb-3">
        {[
          { type: 'pmatrix', label: '( )' },
          { type: 'bmatrix', label: '[ ]' },
          { type: 'vmatrix', label: '| |' },
        ].map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => setBracketType(type)}
            className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors ${
              bracketType === type
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-200 text-slate-500 hover:border-blue-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cell grid */}
      <div className="overflow-x-auto flex justify-center">
        <table className="border-collapse">
          <tbody>
            {cells.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="p-0.5">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="w-12 h-8 text-center text-sm border border-slate-200 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none font-mono bg-white"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <KaTeXPreview latex={latex} />

      <button
        type="button"
        onClick={() => onInsert(latex)}
        disabled={!latex}
        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
      >
        Insert Matrix
      </button>
    </div>
  );
}

/* ── Symbols tab ─────────────────────────────────────────────────────────── */
function SymBtn({ display, latex, onClick }) {
  return (
    <button
      type="button"
      title={latex}
      onClick={() => onClick(latex)}
      className="w-8 h-8 flex items-center justify-center rounded border border-gray-100 hover:border-blue-300 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
    >
      {display}
    </button>
  );
}

function SymbolsTab({ insert }) {
  return (
    <div className="grid grid-cols-8 gap-1 max-h-56 overflow-y-auto">
      {SYMBOLS.map(({ display, latex }) => (
        <SymBtn key={latex} display={display} latex={latex} onClick={insert} />
      ))}
    </div>
  );
}

function GreekTab({ insert }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lowercase</p>
      <div className="grid grid-cols-8 gap-1 mb-3">
        {GREEK_LOWER.map(({ display, latex }) => (
          <SymBtn key={latex} display={display} latex={latex} onClick={insert} />
        ))}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Uppercase</p>
      <div className="grid grid-cols-8 gap-1">
        {GREEK_UPPER.map(({ display, latex }) => (
          <SymBtn key={latex} display={display} latex={latex} onClick={insert} />
        ))}
      </div>
    </div>
  );
}

/* ── Main dropdown ───────────────────────────────────────────────────────── */

const TABS = [
  { id: 'templates', label: 'Templates' },
  { id: 'matrix',    label: 'Matrix' },
  { id: 'symbols',   label: 'Symbols' },
  { id: 'greek',     label: 'Greek' },
];

/**
 * @param {{ editor: object, onClose: () => void, initialTemplate?: string }} props
 * initialTemplate — template id (e.g. 'power') to open that form directly
 */
const DROPDOWN_W = 320;
const MARGIN = 8;

export default function MathDropdown({ editor, onClose, initialTemplate, triggerRef }) {
  const [tab, setTab] = useState('templates');
  const [style, setStyle] = useState({ visibility: 'hidden', position: 'fixed', zIndex: 9999 });
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        (!triggerRef?.current || !triggerRef.current.contains(e.target))
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, triggerRef]);

  // Compute fixed position from trigger rect after mount
  useEffect(() => {
    const trigger = triggerRef?.current;
    if (!trigger) return;
    const tr = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const w = Math.min(DROPDOWN_W, vw - MARGIN * 2);

    // Vertical: prefer below, fall back to above
    const spaceBelow = vh - tr.bottom;
    const spaceAbove = tr.top;
    let top, bottom;
    if (spaceBelow >= 300 || spaceBelow >= spaceAbove) {
      top = tr.bottom + 4;
    } else {
      bottom = vh - tr.top + 4;
    }

    // Horizontal: align right edge of dropdown to right edge of trigger, clamp to viewport
    let left = tr.right - w;
    left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));

    setStyle({
      position: 'fixed',
      zIndex: 9999,
      width: w,
      left,
      ...(top != null ? { top } : { bottom }),
      visibility: 'visible',
    });
  }, [triggerRef]);

  const insert = (latex) => {
    editor.chain().focus().insertContent(`$${latex}$`).run();
    setTimeout(() => migrateMathStrings(editor), 0);
    onClose();
  };

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              tab === id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-[70vh] overflow-y-auto">
        {tab === 'templates' && (
          <TemplatesTab onInsert={insert} initialTemplate={initialTemplate} />
        )}
        {tab === 'matrix'    && <MatrixTab    onInsert={insert} />}
        {tab === 'symbols'   && <SymbolsTab   insert={insert}   />}
        {tab === 'greek'     && <GreekTab     insert={insert}   />}
      </div>
    </div>,
    document.body
  );
}
