'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AreaForm from '@/components/admin/area/AreaForm';
import { areasService } from '@/services/areas.service';

export default function NewAreaPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await areasService.create(data);
      router.push('/admin/areas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/areas')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Areas
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Area</h1>
      </div>
      <AreaForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
