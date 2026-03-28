'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChapterForm from '@/components/admin/chapter/ChapterForm';
import { chaptersService } from '@/services/chapters.service';

export default function NewChapterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data, pdfFile) => {
    setLoading(true);
    try {
      const { pdf_notes, ...jsonData } = data;
      const { data: created } = await chaptersService.create(jsonData);
      if (pdfFile) {
        const formData = new FormData();
        formData.append('pdf_notes', pdfFile);
        await chaptersService.update(created.slug, formData);
      }
      router.push('/admin/chapters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/chapters')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Chapters
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Chapter</h1>
      </div>
      <ChapterForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
