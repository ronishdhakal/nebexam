'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SubjectForm from '@/components/admin/subject/SubjectForm';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage, mediaUrl } from '@/lib/utils';

const TABS = ['Details', 'Syllabus', 'Book'];

export default function EditSubjectPage({ params: rawParams }) {
  const params = use(rawParams);
  const [subject, setSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('Details');
  const [syllabus, setSyllabus] = useState(null);
  const [bookText, setBookText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bookSaved, setBookSaved] = useState(false);
  const [bookFile, setBookFile] = useState(null);
  const [bookFileSaved, setBookFileSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    subjectsService.getOne(params.slug)
      .then((res) => {
        setSubject(res.data);
        setSyllabus(res.data.syllabus || '');
        setBookText(res.data.book_text || '');
      })
      .catch((err) => alert(getErrorMessage(err)));
  }, [params.slug]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await subjectsService.update(params.slug, data);
      router.push('/admin/subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSyllabus = async () => {
    setLoading(true);
    try {
      await subjectsService.update(params.slug, { syllabus });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBookText = async () => {
    setLoading(true);
    try {
      await subjectsService.update(params.slug, { book_text: bookText });
      setBookSaved(true);
      setTimeout(() => setBookSaved(false), 2000);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBookPdf = async () => {
    if (!bookFile) return;
    setLoading(true);
    try {
      const res = await subjectsService.uploadBook(params.slug, bookFile);
      setSubject(res.data);
      setBookFile(null);
      setBookFileSaved(true);
      setTimeout(() => setBookFileSaved(false), 2000);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBook = async () => {
    if (!confirm('Remove the textbook PDF?')) return;
    setLoading(true);
    try {
      const res = await subjectsService.removeBook(params.slug);
      setSubject(res.data);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!subject) return <p className="text-sm text-gray-500 p-6">Loading...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/subjects')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Subjects
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Class {subject.class_level} · {subject.subject_code}</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#1CA3FD] text-[#1CA3FD]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Details' && (
        <SubjectForm initial={subject} onSubmit={handleSubmit} loading={loading} />
      )}

      {activeTab === 'Syllabus' && (
        <div className="space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <RichTextEditor
            value={syllabus}
            onChange={setSyllabus}
            placeholder="Write the syllabus here..."
          />
          <button
            onClick={handleSaveSyllabus}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Saved' : loading ? 'Saving...' : 'Save Syllabus'}
          </button>
        </div>
      )}

      {activeTab === 'Book' && (
        <div className="space-y-6">

          {/* Rich text section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Textbook Content</p>
              <p className="text-xs text-slate-400">Add rich text notes for the textbook. This will be shown first on the Textbook tab.</p>
            </div>
            <RichTextEditor
              value={bookText}
              onChange={setBookText}
              placeholder="Write textbook content here..."
            />
            <button
              onClick={handleSaveBookText}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {bookSaved ? '✓ Saved' : loading ? 'Saving...' : 'Save Text'}
            </button>
          </div>

          {/* PDF section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Textbook PDF</p>
              <p className="text-xs text-slate-400">Upload the official textbook PDF. It will be shown below the text content on the Textbook tab.</p>
            </div>

            {subject.book_pdf && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-red-500 shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <a href={mediaUrl(subject.book_pdf)} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1CA3FD] hover:underline flex-1 truncate">
                  {subject.book_pdf.split('/').pop()}
                </a>
                <button onClick={handleRemoveBook} disabled={loading} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50">
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setBookFile(e.target.files[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1CA3FD]/10 file:text-[#1CA3FD] hover:file:bg-[#1CA3FD]/20 transition"
              />
              {bookFile && (
                <p className="text-xs text-slate-400">Selected: <span className="font-medium text-slate-600">{bookFile.name}</span></p>
              )}
              <button
                onClick={handleUploadBookPdf}
                disabled={!bookFile || loading}
                className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {bookFileSaved ? '✓ Uploaded' : loading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
