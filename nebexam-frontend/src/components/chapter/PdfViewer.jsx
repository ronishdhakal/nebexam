'use client';

/**
 * PdfViewer — embeds via Google Docs viewer (no CORS, works on mobile & desktop).
 * Falls back to a direct "Open PDF" link if the viewer fails to load.
 */
export default function PdfViewer({ url }) {
  if (!url) return null;

  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
      <iframe
        src={viewerUrl}
        className="w-full h-[70vh] md:h-[90vh] min-h-[500px]"
        title="PDF Viewer"
        allow="autoplay"
      />
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
        <span className="text-xs text-slate-400">If the preview doesn't load, use the link →</span>
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
  );
}
