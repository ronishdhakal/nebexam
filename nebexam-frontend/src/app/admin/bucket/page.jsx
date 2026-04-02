'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']);
const PDF_EXT = 'pdf';

function ext(key) {
  return key.split('.').pop().toLowerCase();
}

function isImage(key) {
  return IMAGE_EXTS.has(ext(key));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function BucketPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | image | pdf | other
  const [copied, setCopied] = useState('');
  const [deleting, setDeleting] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('uploads');
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/content/bucket/');
      setFiles(data.files || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load bucket files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleDelete = async (key) => {
    setDeleting(key);
    try {
      await api.delete('/content/bucket/delete/', { data: { key } });
      setFiles((prev) => prev.filter((f) => f.key !== key));
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed.');
    } finally {
      setDeleting('');
      setConfirmDelete(null);
    }
  };

  const handleUpload = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    setUploadError('');
    const uploaded = [];
    try {
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', uploadFolder);
        const { data } = await api.post('/content/bucket/upload/', form);
        uploaded.push({
          key: data.key,
          url: data.url,
          size: data.size,
          last_modified: new Date().toISOString(),
          content_type: data.content_type,
        });
      }
      setFiles((prev) => [...uploaded, ...prev]);
    } catch (e) {
      setUploadError(e.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filtered = files.filter((f) => {
    const matchSearch = !search || f.key.toLowerCase().includes(search.toLowerCase());
    const e = ext(f.key);
    const matchFilter =
      filter === 'all' ||
      (filter === 'image' && IMAGE_EXTS.has(e)) ||
      (filter === 'pdf' && e === PDF_EXT) ||
      (filter === 'other' && !IMAGE_EXTS.has(e) && e !== PDF_EXT);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">R2 Bucket</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${files.length} file${files.length !== 1 ? 's' : ''} in bucket`}
          </p>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
          dragOver ? 'border-[#1CA3FD] bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#1CA3FD]/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" fill="none" stroke="#1CA3FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {dragOver ? 'Drop files here' : 'Drag & drop files, or click to browse'}
              </p>
              <p className="text-xs text-gray-400">All file types supported</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 whitespace-nowrap">Folder:</label>
              <input
                type="text"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-28 text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1CA3FD]"
                placeholder="uploads"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1CA3FD] rounded-lg hover:bg-[#1CA3FD]/90 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Upload
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        </div>
        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CA3FD]"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'image', 'pdf', 'other'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === t
                  ? 'bg-[#1CA3FD] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* File grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-square" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto mb-3" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <p className="text-sm">No files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((file) => (
            <FileCard
              key={file.key}
              file={file}
              copied={copied === file.url}
              deleting={deleting === file.key}
              onCopy={() => copyLink(file.url)}
              onDelete={() => setConfirmDelete(file)}
            />
          ))}
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {filtered.length} of {files.length} files
        </p>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete file?</h3>
                <p className="text-xs text-gray-500 mt-0.5 break-all">{confirmDelete.key}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.key)}
                disabled={!!deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileCard({ file, copied, deleting, onCopy, onDelete }) {
  const e = ext(file.key);
  const image = IMAGE_EXTS.has(e);
  const pdf = e === PDF_EXT;
  const name = file.key.split('/').pop();

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all">
      {/* Preview */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`w-full h-full items-center justify-center ${image ? 'hidden' : 'flex'}`}>
          <FileIcon ext={e} pdf={pdf} />
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-medium text-gray-800 truncate" title={name}>{name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(file.size)} · {formatDate(file.last_modified)}</p>
      </div>

      {/* Actions overlay */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-black/0 group-hover:bg-black/5 transition-all pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          title="Copy link"
          className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-colors pointer-events-auto ${
            copied ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {copied ? (
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )}
        </button>
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          title="Open in new tab"
          className="w-7 h-7 rounded-lg bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center shadow-sm pointer-events-auto"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Delete"
          className="w-7 h-7 rounded-lg bg-white text-red-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center shadow-sm disabled:opacity-50 pointer-events-auto"
        >
          {deleting ? (
            <svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function FileIcon({ ext: e, pdf }) {
  if (pdf) {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="2" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5"/>
          <path d="M8 12h8M8 16h5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 2v5h5" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <span className="text-[10px] font-bold text-red-400 uppercase">PDF</span>
      </div>
    );
  }
  const color = {
    mp4: '#8b5cf6', mov: '#8b5cf6', avi: '#8b5cf6',
    mp3: '#f59e0b', wav: '#f59e0b',
    zip: '#6b7280', rar: '#6b7280',
    doc: '#3b82f6', docx: '#3b82f6',
    xls: '#10b981', xlsx: '#10b981',
  }[e] || '#9ca3af';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
        <path d="M14 2v5h5" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      <span className="text-[10px] font-bold uppercase" style={{ color }}>{e.slice(0, 4)}</span>
    </div>
  );
}
