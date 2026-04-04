'use client';

import { useRef } from 'react';

/**
 * PdfViewer — embeds via Google Docs viewer (no CORS, works on mobile & desktop).
 * Falls back to a direct "Open PDF" link if the viewer fails to load.
 */
export default function PdfViewer({ url }) {
  if (!url) return null;

  const iframeRef = useRef(null);

  const handleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
      <iframe
        ref={iframeRef}
        src={viewerUrl}
        className="w-full h-[70vh] md:h-[90vh] min-h-[500px]"
        title="PDF Viewer"
        allow="autoplay"
      />
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
        <span className="text-xs text-slate-400">If the preview doesn't load, use the link →</span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleFullscreen}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#1CA3FD] font-medium flex items-center gap-1 transition-colors"
            title="View fullscreen"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Fullscreen
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#1CA3FD] hover:underline font-medium flex items-center gap-1"
          >
            Open PDF ↗
          </a>
        </div>
      </div>
    </div>
  );
}
