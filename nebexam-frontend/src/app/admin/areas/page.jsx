'use client';

import { useState, useEffect, useCallback } from 'react';
import AreaList from '@/components/admin/area/AreaList';
import { areasService } from '@/services/areas.service';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';
import Pagination from '@/components/admin/shared/Pagination';

const PAGE_SIZE = 20;
const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]';

export default function AreasPage() {
  const [areas, setAreas]           = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [count, setCount]           = useState(0);
  const [page, setPage]             = useState(1);
  const [classFilter, setClassFilter]     = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Fetch subjects for dropdown once
  useEffect(() => {
    subjectsService.getAll().then((res) => {
      setAllSubjects(res.data.results || res.data);
    }).catch(() => {});
  }, []);

  const fetchAreas = useCallback(async (p, params = {}) => {
    try {
      setLoading(true);
      const res = await areasService.getAll({ ...params, page: p, page_size: PAGE_SIZE });
      setAreas(res.data.results || res.data);
      setCount(res.data.count ?? res.data.length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setPage(1); }, [subjectFilter]);

  // Re-fetch when subject filter or page changes
  useEffect(() => {
    const params = {};
    if (subjectFilter) params.subject = subjectFilter;
    fetchAreas(page, params);
  }, [page, subjectFilter, fetchAreas]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this area?')) return;
    try {
      await areasService.delete(id);
      const params = {};
      if (subjectFilter) params.subject = subjectFilter;
      fetchAreas(page, params);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Subjects shown in dropdown — filtered by class selection
  const subjectsInDropdown = classFilter
    ? allSubjects.filter((s) => String(s.class_level) === classFilter)
    : allSubjects;

  const handleClassChange = (val) => {
    setClassFilter(val);
    if (val && subjectFilter) {
      const still = allSubjects.find((s) => s.slug === subjectFilter && String(s.class_level) === val);
      if (!still) setSubjectFilter('');
    }
  };

  const hasFilter = classFilter || subjectFilter;

  return (
    <div>
      <PageHeader
        title="Areas"
        subtitle="Manage areas within subjects"
        action={{ href: '/admin/areas/new', label: 'New Area' }}
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={classFilter} onChange={(e) => handleClassChange(e.target.value)} className={selectCls}>
          <option value="">All Classes</option>
          <option value="8">Class 8</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </select>

        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={selectCls}>
          <option value="">All Subjects</option>
          {subjectsInDropdown.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name} {classFilter ? '' : `(Class ${s.class_level})`}</option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={() => { setClassFilter(''); setSubjectFilter(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear filters
          </button>
        )}

        {!loading && (
          <span className="ml-auto text-xs text-slate-400">{count} areas</span>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && (
        <>
          <AreaList areas={areas} onDelete={handleDelete} />
          <Pagination page={page} count={count} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      )}
    </div>
  );
}
