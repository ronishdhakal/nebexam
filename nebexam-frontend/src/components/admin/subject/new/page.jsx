'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SubjectForm from '@/components/admin/subject/SubjectForm';
import { subjectsService } from '@/services/subjects.service';

export default function NewSubjectPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await subjectsService.create(data);
      router.push('/admin/subjects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Subject</h1>
      <SubjectForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}