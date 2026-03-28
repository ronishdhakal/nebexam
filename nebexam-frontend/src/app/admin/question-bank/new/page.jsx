'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EntryForm from '@/components/admin/question-bank/EntryForm';
import { entriesService } from '@/services/questionbank.service';

export default function NewEntryPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await entriesService.create(data);
      router.push(`/admin/question-bank/${res.data.slug}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/question-bank')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Question Bank
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Question Bank Entry</h1>
      </div>
      <EntryForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
