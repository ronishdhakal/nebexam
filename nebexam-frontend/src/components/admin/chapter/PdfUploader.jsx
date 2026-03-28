'use client';

import { useState } from 'react';

export default function PdfUploader({ currentPdf, onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {currentPdf && (
        <div className="text-sm text-gray-600">
          Current PDF: <a href={currentPdf} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="text-sm text-gray-600"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>
    </div>
  );
}