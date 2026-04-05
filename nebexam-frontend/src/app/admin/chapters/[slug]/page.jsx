'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ChapterForm from '@/components/admin/chapter/ChapterForm';
import ImportantQuestionsEditor from '@/components/admin/chapter/ImportantQuestionsEditor';
import { chaptersService } from '@/services/chapters.service';
import { getErrorMessage } from '@/lib/utils';

export default function EditChapterPage({ params: rawParams }) {
  const params = use(rawParams);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    chaptersService.getOne(params.slug)
      .then((res) => setChapter(res.data))
      .catch((err) => alert(getErrorMessage(err)));
  }, [params.slug]);

  const handleSubmit = async (data, pdfFile) => {
    setLoading(true);
    try {
      const { pdf_notes, ...jsonData } = data;
      await chaptersService.update(params.slug, jsonData);
      if (pdfFile) {
        const formData = new FormData();
        formData.append('pdf_notes', pdfFile);
        await chaptersService.update(params.slug, formData);
      }
      router.push('/admin/chapters');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePdf = async () => {
    if (!confirm('Remove the PDF notes from this chapter?')) return;
    setLoading(true);
    try {
      const res = await chaptersService.removePdf(params.slug);
      setChapter(res.data);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!chapter) return <p className="text-sm text-gray-500 p-6">Loading...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <button
          onClick={() => router.push('/admin/chapters')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Chapters
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{chapter.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{chapter.area_name}</p>
      </div>
      <ChapterForm initial={chapter} onSubmit={handleSubmit} onRemovePdf={handleRemovePdf} loading={loading} />
      <ImportantQuestionsEditor chapter={chapter} />
    </div>
  );
}
