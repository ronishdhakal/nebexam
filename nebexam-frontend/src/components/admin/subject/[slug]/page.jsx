'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubjectForm from '@/components/admin/subject/SubjectForm';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage } from '@/lib/utils';

export default function EditSubjectPage({ params }) {
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    subjectsService.getOne(params.slug)
      .then((res) => setSubject(res.data))
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

  if (!subject) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Subject</h1>
      <SubjectForm initial={subject} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}