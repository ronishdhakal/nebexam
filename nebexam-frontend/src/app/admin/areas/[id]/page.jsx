'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AreaForm from '@/components/admin/area/AreaForm';
import { areasService } from '@/services/areas.service';
import { getErrorMessage } from '@/lib/utils';

export default function EditAreaPage({ params: rawParams }) {
  const params = use(rawParams);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    areasService.getOne(params.id)
      .then((res) => setArea(res.data))
      .catch((err) => alert(getErrorMessage(err)));
  }, [params.id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await areasService.update(params.id, data);
      router.push('/admin/areas');
    } finally {
      setLoading(false);
    }
  };

  if (!area) return <p className="text-sm text-gray-500 p-6">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/areas')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Areas
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{area.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{area.subject_name} · Class {area.subject_class_level}</p>
      </div>
      <AreaForm initial={area} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
