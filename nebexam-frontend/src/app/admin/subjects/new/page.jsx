'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SubjectForm from '@/components/admin/subject/SubjectForm';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { subjectsService } from '@/services/subjects.service';

const TABS = ['Details', 'Syllabus'];

export default function NewSubjectPage() {
  const [activeTab, setActiveTab] = useState('Details');
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await subjectsService.create({ ...data, syllabus });
      router.push('/admin/subjects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/subjects')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Subjects
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Subject</h1>
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
        <SubjectForm onSubmit={handleSubmit} loading={loading} />
      )}

      {activeTab === 'Syllabus' && (
        <div className="space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-slate-500">Syllabus will be saved when you submit the Details form.</p>
          <RichTextEditor
            value={syllabus}
            onChange={setSyllabus}
            placeholder="Write the syllabus here..."
          />
        </div>
      )}
    </div>
  );
}
