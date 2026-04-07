export default function Pagination({ page, count, pageSize, onPage }) {
  const totalPages = Math.ceil(count / pageSize);
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase =
    'min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors';
  const btnActive = 'bg-[#1CA3FD] text-white';
  const btnInactive = 'text-slate-600 hover:bg-slate-100 border border-gray-200';
  const btnDisabled = 'text-slate-300 cursor-not-allowed border border-gray-100';

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-xs text-slate-400">
        {count} total &middot; page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className={`${btnBase} px-2 ${page === 1 ? btnDisabled : btnInactive}`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPage(1)} className={`${btnBase} px-2 ${btnInactive}`}>1</button>
            {start > 2 && <span className="text-slate-300 text-xs px-1">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`${btnBase} px-2 ${p === page ? btnActive : btnInactive}`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-slate-300 text-xs px-1">…</span>}
            <button onClick={() => onPage(totalPages)} className={`${btnBase} px-2 ${btnInactive}`}>
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} px-2 ${page === totalPages ? btnDisabled : btnInactive}`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
