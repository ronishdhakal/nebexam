'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Image from 'next/image';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PageSkeleton() {
  return (
    <div className="w-full max-w-2xl px-4 flex flex-col gap-3 py-2">
      {/* Mimic a PDF page shape */}
      <div className="w-full aspect-[3/4] rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </div>
  );
}

export default function PdfViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  if (!url) return null;

  const onLoadSuccess = ({ numPages }) => {
    setLoadError(null);
    setNumPages(numPages);
  };

  const onLoadError = (err) => {
    console.error('[PdfViewer] load error:', err);
    setLoadError(err?.message || 'Unknown error');
  };

  const handleRetry = () => {
    setNumPages(null);
    setLoadError(null);
    setRetryKey((k) => k + 1);
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // Base width fills the container; scale zooms from there
  const baseWidth = containerWidth ? containerWidth - 32 : undefined;
  const pageWidth = baseWidth ? Math.floor(baseWidth * scale) : undefined;

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col bg-slate-100 dark:bg-slate-800"
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 shrink-0">
        <span className="text-xs text-slate-400">
          {numPages ? `${numPages} page${numPages !== 1 ? 's' : ''}` : '—'}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 font-bold transition-colors text-base"
            title="Zoom out"
          >−</button>
          <span className="text-xs text-slate-500 tabular-nums w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 font-bold transition-colors text-base"
            title="Zoom in"
          >+</button>
          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-[#1CA3FD] transition-colors"
            title="Open in new tab"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
          <button
            onClick={handleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-[#1CA3FD] transition-colors"
            title="Fullscreen"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Scrollable pages ── */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overflow-x-auto h-[82vh] flex flex-col items-center py-4 gap-3"
      >
        {/* Wait until we know the width before mounting Document */}
        {!containerWidth ? (
          <PageSkeleton />
        ) : (
          <Document
            key={retryKey}
            file={url}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<PageSkeleton />}
            error={
              <div className="flex flex-col items-center justify-center gap-3 h-64 px-4 text-center">
                <p className="text-sm text-red-400">Failed to load PDF.</p>
                {loadError && (
                  <p className="text-xs text-slate-400 max-w-xs break-words">{loadError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#1CA3FD] text-white hover:bg-[#0e8fe0] transition-colors"
                  >
                    Retry
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            }
            className="flex flex-col items-center gap-3"
          >
            {Array.from({ length: numPages ?? 0 }, (_, i) => (
              <div key={i} className="relative shadow-md">
                <Page
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
                {/* Per-page watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <Image
                    src="/assets/logo.svg"
                    alt=""
                    width={180}
                    height={65}
                    className="opacity-[0.07] -rotate-12"
                  />
                </div>
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  );
}
