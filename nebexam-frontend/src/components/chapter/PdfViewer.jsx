'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Image from 'next/image';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function proxyUrl(url) {
  if (!url) return null;
  return `/api/pdf?url=${encodeURIComponent(url)}`;
}

function PageSkeleton() {
  return (
    <div className="w-full max-w-2xl px-4 flex flex-col gap-3 py-2">
      <div className="w-full aspect-[3/4] rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </div>
  );
}

// A4-ish ratio (595:842pt) — close enough for a placeholder before a page has actually rendered.
const PAGE_ASPECT_RATIO = 595 / 842;

export default function PdfViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visiblePages, setVisiblePages] = useState(() => new Set([1]));
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const pageRefs = useRef(new Map());

  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  // Lazily mount pages as they scroll near the viewport instead of rendering
  // every page's canvas at once — large notes PDFs can have 30-40+ pages, and
  // rasterizing all of them on load is what makes big files hang/fail to render.
  useEffect(() => {
    if (!numPages || !scrollRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number(entry.target.dataset.pageNumber));
        if (newlyVisible.length === 0) return;
        setVisiblePages((prev) => {
          const next = new Set(prev);
          newlyVisible.forEach((page) => next.add(page));
          return next;
        });
      },
      { root: scrollRef.current, rootMargin: '1000px 0px', threshold: 0 }
    );
    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, retryKey]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement || document.webkitFullscreenElement || null;
      setIsFullscreen(fsElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!url) return null;

  const pdfSrc = proxyUrl(url);

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
    setVisiblePages(new Set([1]));
    pageRefs.current.clear();
    setRetryKey((k) => k + 1);
  };

  const handleFullscreen = () => {
    if (isFullscreen) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const baseWidth = containerWidth ? containerWidth - 32 : undefined;
  const pageWidth = baseWidth ? Math.floor(baseWidth * scale) : undefined;

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col bg-slate-100 dark:bg-slate-800 ${
        isFullscreen ? 'h-screen' : ''
      }`}
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
          <button
            onClick={handleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-[#1CA3FD] transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Scrollable pages ── */}
      <div
        ref={scrollRef}
        className={`overflow-y-auto overflow-x-auto flex flex-col items-center py-4 gap-3 ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[82vh]'
        }`}
      >
        {!containerWidth ? (
          <PageSkeleton />
        ) : (
          <Document
            key={retryKey}
            file={pdfSrc}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<PageSkeleton />}
            error={
              <div className="flex flex-col items-center justify-center gap-3 h-64 px-4 text-center">
                <p className="text-sm text-red-400">Failed to load PDF.</p>
                {loadError && (
                  <p className="text-xs text-slate-400 max-w-xs break-words">{loadError}</p>
                )}
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 text-xs rounded-lg bg-[#1CA3FD] text-white hover:bg-[#0e8fe0] transition-colors"
                >
                  Retry
                </button>
              </div>
            }
            className="flex flex-col items-center gap-3"
          >
            {Array.from({ length: numPages ?? 0 }, (_, i) => {
              const pageNumber = i + 1;
              const isVisible = visiblePages.has(pageNumber);
              return (
                <div
                  key={pageNumber}
                  ref={(el) => {
                    if (el) pageRefs.current.set(pageNumber, el);
                    else pageRefs.current.delete(pageNumber);
                  }}
                  data-page-number={pageNumber}
                  className="relative shadow-md"
                  style={
                    !isVisible && pageWidth
                      ? { width: pageWidth, height: Math.round(pageWidth / PAGE_ASPECT_RATIO) }
                      : undefined
                  }
                >
                  {isVisible ? (
                    <>
                      <Page
                        pageNumber={pageNumber}
                        width={pageWidth}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <Image
                          src="/assets/logo.svg"
                          alt=""
                          width={129}
                          height={65}
                          className="opacity-[0.07] -rotate-12"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  )}
                </div>
              );
            })}
          </Document>
        )}
      </div>
    </div>
  );
}
