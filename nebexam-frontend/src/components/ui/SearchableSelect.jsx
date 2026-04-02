'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * SearchableSelect — a filterable dropdown replacement for <select>.
 *
 * Props:
 *   options     : [{ value, label }]
 *   value       : currently selected value (string)
 *   onChange    : (value) => void
 *   placeholder : string shown when nothing is selected
 *   disabled    : bool
 *   required    : bool
 */
export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select…',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        className={[
          'w-full flex items-center justify-between gap-2',
          'border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-left transition',
          'focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-400 cursor-pointer',
        ].join(' ')}
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 cursor-pointer leading-none px-0.5"
              title="Clear"
            >
              ×
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent"
            />
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-slate-400">No matches</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={[
                    'px-3 py-2 text-sm cursor-pointer select-none',
                    String(opt.value) === String(value)
                      ? 'bg-[#1CA3FD]/10 text-[#1CA3FD] font-medium'
                      : 'text-slate-800 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
