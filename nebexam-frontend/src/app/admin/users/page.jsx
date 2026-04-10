'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { paymentService } from '@/services/users.service';
import { getErrorMessage, formatDate } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';
import Pagination from '@/components/admin/shared/Pagination';

const PAGE_SIZE = 20;

const TIER_STYLES = {
  free:     'bg-slate-100 text-slate-600 ring-slate-200',
  '1month': 'bg-blue-50 text-blue-700 ring-blue-200',
  '3month': 'bg-[#1CA3FD]/10 text-[#1CA3FD] ring-[#1CA3FD]/20',
  '1year':  'bg-violet-50 text-violet-700 ring-violet-200',
};
const TIER_DISPLAY = { free: 'Free', '1month': '1 Month', '3month': '3 Months', '1year': '1 Year' };
const LEVEL_LABEL  = { '8': 'Class 8', '9': 'Class 9', '10': 'Class 10', '11': 'Class 11', '12': 'Class 12', '': 'No Class' };
const STREAM_STYLES = {
  science:    'bg-blue-50 text-blue-700 ring-blue-200',
  management: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const CRM_CONFIG = {
  none:       { label: 'No Status',  bg: 'bg-slate-100 text-slate-500',        dot: 'bg-slate-400' },
  follow_up:  { label: 'Follow Up',  bg: 'bg-amber-50 text-amber-700',         dot: 'bg-amber-400' },
  contacted:  { label: 'Contacted',  bg: 'bg-blue-50 text-blue-700',           dot: 'bg-blue-500' },
  done:       { label: 'Done',       bg: 'bg-emerald-50 text-emerald-700',     dot: 'bg-emerald-500' },
};

const WHAT_AFTER_CONFIG = {
  study_nepal:  { label: 'Study in Nepal', bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  study_abroad: { label: 'Study Abroad',   bg: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

const PURCHASE_STATUS_CONFIG = {
  active:    { label: 'Subscribed',    bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  attempted: { label: 'Attempted',     bg: 'bg-amber-50 text-amber-700 ring-amber-200' },
  never:     { label: 'Never visited', bg: 'bg-slate-50 text-slate-500 ring-slate-200' },
};

function getPurchaseStatus(user) {
  if (user.subscription_tier !== 'free') return 'active';
  if (user.last_checkout_at)             return 'attempted';
  return 'never';
}

function exportCSV(users) {
  const cols = ['ID', 'Name', 'Email', 'Phone', 'District', 'Class', 'Stream', 'After +2', 'Plan', 'Expires', 'Status', 'Email Verified', 'Last Checkout', 'CRM', 'Joined'];
  const rows = users.map((u) => [
    u.id,
    `"${u.name || ''}"`,
    u.email,
    u.phone || '',
    u.district || '',
    u.level ? `Class ${u.level}` : '',
    u.stream || '',
    WHAT_AFTER_CONFIG[u.what_after_plus_two]?.label || '',
    TIER_DISPLAY[u.subscription_tier] || u.subscription_tier,
    u.subscription_expires_at ? new Date(u.subscription_expires_at).toLocaleDateString() : '',
    u.is_active ? 'Active' : 'Disabled',
    u.is_email_verified ? 'Verified' : 'Not Verified',
    u.last_checkout_at ? new Date(u.last_checkout_at).toLocaleDateString() : '',
    u.crm_status || '',
    u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '',
  ]);
  const csv  = [cols, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `neb-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CRM Status Dropdown ───────────────────────────────────────────────────────
function CrmDropdown({ userId, value, onChange }) {
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);

  const select = async (status) => {
    setOpen(false);
    if (status === value) return;
    setSaving(true);
    try {
      await paymentService.setCrmStatus(userId, status);
      onChange(userId, status);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const cfg = CRM_CONFIG[value] || CRM_CONFIG.none;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ring-1 ring-inset transition ${cfg.bg} ${saving ? 'opacity-50' : 'hover:opacity-80'}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {saving ? '…' : cfg.label}
        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="opacity-60">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[150px]">
            {Object.entries(CRM_CONFIG).map(([key, c]) => (
              <button
                key={key}
                onClick={() => select(key)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 transition ${value === key ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Bulk Promote Panel ────────────────────────────────────────────────────────
function BulkPromotePanel({ onDone }) {
  const [counts, setCounts]   = useState(null);
  const [modal, setModal]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const fetchCounts = useCallback(async () => {
    try { const res = await api.get('/users/bulk-promote/'); setCounts(res.data); } catch {}
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const run = async () => {
    setLoading(true);
    try {
      const payload = modal === 'session' ? { session: true } : { from_level: modal.from, to_level: modal.to };
      const res = await api.post('/users/bulk-promote/', payload);
      setResult(res.data);
      await fetchCounts();
      onDone?.();
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setLoading(false); setModal(null); }
  };

  const CountBadge = ({ level }) => (
    <div className="flex flex-col items-center px-5 py-3 bg-white rounded-xl border border-gray-100">
      <span className="text-2xl font-bold text-slate-900">{counts?.[level] ?? '—'}</span>
      <span className="text-xs text-slate-400 mt-0.5">{level === 'none' ? 'Unassigned' : `Class ${level}`}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Academic Year Promotion</h2>
          <p className="text-xs text-slate-400 mt-0.5">Bulk-move students to the next class at the start of a new academic session.</p>
        </div>
        <button
          onClick={() => { setResult(null); setModal('session'); }}
          className="shrink-0 inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          Promote All (New Session)
        </button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
        <CountBadge level="8" /><CountBadge level="9" /><CountBadge level="10" /><CountBadge level="11" /><CountBadge level="12" /><CountBadge level="none" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { from: '8',  to: '9',  label: 'Class 8 → 9' },
          { from: '9',  to: '10', label: 'Class 9 → 10' },
          { from: '10', to: '11', label: 'Class 10 → 11' },
          { from: '11', to: '12', label: 'Class 11 → 12' },
          { from: '12', to: '',   label: 'Class 12 → Graduate' },
        ].map((p) => (
          <button key={p.label} onClick={() => { setResult(null); setModal(p); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] hover:bg-[#f8fbff] transition-all">
            {p.label}
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
      </div>
      {result && (
        <div className="mt-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium">
          {result.session
            ? `Session promotion complete — 8→9: ${result.promoted.class_8}, 9→10: ${result.promoted.class_9}, 10→11: ${result.promoted.class_10}, 11→12: ${result.promoted.class_11}, Class 12 graduated: ${result.promoted.class_12_graduated}`
            : `${result.updated} user${result.updated !== 1 ? 's' : ''} moved from ${LEVEL_LABEL[result.from_level] || 'Unassigned'} to ${LEVEL_LABEL[result.to_level] || 'Unassigned'}.`}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {modal === 'session' ? 'Promote All Students?' : `Promote ${LEVEL_LABEL[modal.from] || 'Unassigned'}?`}
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              {modal === 'session'
                ? 'This will move all Class 8→9, 9→10, 10→11, 11→12, and graduate all Class 12 students. This action cannot be undone.'
                : `This will move ${counts?.[modal.from] ?? '?'} student${counts?.[modal.from] !== 1 ? 's' : ''} from ${LEVEL_LABEL[modal.from] || 'Unassigned'} to ${LEVEL_LABEL[modal.to] || 'Unassigned'}.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-slate-700 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={run} disabled={loading} className="flex-1 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white text-sm font-semibold py-2 rounded-xl transition disabled:opacity-50">
                {loading ? 'Promoting…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [count, setCount]     = useState(0);
  const [page, setPage]       = useState(1);
  const [query, setQuery]     = useState('');
  const [filters, setFilters] = useState({
    level: '', stream: '', tier: '', status: '', purchase_status: '', crm_status: '', email_verified: '',
  });

  const buildParams = (q, f) => {
    const params = {};
    if (q)                 params.search          = q;
    if (f.level)           params.level           = f.level;
    if (f.stream)          params.stream          = f.stream;
    if (f.tier)            params.tier            = f.tier;
    if (f.status)          params.status          = f.status;
    if (f.purchase_status) params.purchase_status = f.purchase_status;
    if (f.crm_status)      params.crm_status      = f.crm_status;
    if (f.email_verified)  params.email_verified  = f.email_verified;
    return params;
  };

  const fetchUsers = useCallback(async (p, q, f) => {
    try {
      setLoading(true);
      const params = { ...buildParams(q, f), page: p, page_size: PAGE_SIZE };
      const res = await api.get('/users/all/', { params });
      setUsers(res.data.results || res.data);
      setCount(res.data.count ?? res.data.length);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, []);

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all matching users by paginating through all pages
      const allUsers = [];
      let page = 1;
      while (true) {
        const params = { ...buildParams(query, filters), page, page_size: 100 };
        const res = await api.get('/users/all/', { params });
        const data = res.data.results || res.data;
        allUsers.push(...data);
        if (!res.data.next) break;
        page++;
      }
      exportCSV(allUsers);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  // Reset to page 1 when query or filters change
  useEffect(() => { setPage(1); }, [query, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(page, query, filters), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [page, query, filters, fetchUsers]);

  const setFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Optimistic CRM update — avoids full refetch
  const handleCrmChange = (userId, newStatus) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, crm_status: newStatus } : u));
  };

  const SelectFilter = ({ label, value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent"
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div>
      <PageHeader title="Users" subtitle="View and manage registered accounts" />
      <BulkPromotePanel onDone={() => fetchUsers(query, filters)} />

      {/* Search + Filters + Export */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent"
          />
        </div>

        <SelectFilter label="All Classes" value={filters.level} onChange={(v) => setFilter('level', v)} options={[
          { value: '8', label: 'Class 8' }, { value: '9', label: 'Class 9' },
          { value: '10', label: 'Class 10' }, { value: '11', label: 'Class 11' }, { value: '12', label: 'Class 12' },
        ]} />
        <SelectFilter label="All Streams" value={filters.stream} onChange={(v) => setFilter('stream', v)} options={[
          { value: 'science', label: 'Science' }, { value: 'management', label: 'Management' },
        ]} />
        <SelectFilter label="All Plans" value={filters.tier} onChange={(v) => setFilter('tier', v)} options={[
          { value: 'free', label: 'Free' }, { value: '1month', label: '1 Month' }, { value: '3month', label: '3 Months' }, { value: '1year', label: '1 Year' },
        ]} />
        <SelectFilter label="All Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={[
          { value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' },
        ]} />
        <SelectFilter label="Purchase Intent" value={filters.purchase_status} onChange={(v) => setFilter('purchase_status', v)} options={[
          { value: 'active',    label: 'Subscribed' },
          { value: 'attempted', label: 'Attempted (not paid)' },
          { value: 'never',     label: 'Never visited checkout' },
        ]} />
        <SelectFilter label="CRM Status" value={filters.crm_status} onChange={(v) => setFilter('crm_status', v)} options={[
          { value: 'follow_up', label: 'Follow Up' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'done',      label: 'Done' },
          { value: 'none',      label: 'No Status' },
        ]} />
        <SelectFilter label="Email Verified" value={filters.email_verified} onChange={(v) => setFilter('email_verified', v)} options={[
          { value: 'true',  label: 'Verified' },
          { value: 'false', label: 'Not Verified' },
        ]} />

        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({ level: '', stream: '', tier: '', status: '', purchase_status: '', crm_status: '', email_verified: '' })}
            className="text-xs text-slate-500 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{count} user{count !== 1 ? 's' : ''}</span>
          <button
            onClick={handleExport}
            disabled={count === 0 || exporting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-gray-200 text-slate-700 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (<>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">District</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Class</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">After +2</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Purchase</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Last Attempt</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">CRM</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const purchaseStatus = getPurchaseStatus(user);
                  const psCfg = PURCHASE_STATUS_CONFIG[purchaseStatus];
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-[#1CA3FD]">{user.name?.[0]?.toUpperCase() ?? '?'}</span>
                          </div>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
                      <td className="px-5 py-3.5 text-slate-400">{user.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-400">{user.district || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-500 font-medium">{user.level ? `Class ${user.level}` : '—'}</td>
                      <td className="px-5 py-3.5">
                        {user.what_after_plus_two ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${WHAT_AFTER_CONFIG[user.what_after_plus_two]?.bg}`}>
                            {WHAT_AFTER_CONFIG[user.what_after_plus_two]?.label}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${TIER_STYLES[user.subscription_tier] || TIER_STYLES.free}`}>
                          {TIER_DISPLAY[user.subscription_tier] || user.subscription_tier}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.is_email_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-amber-50 text-amber-700 ring-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            Not Verified
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${psCfg.bg}`}>
                          {psCfg.label}
                        </span>
                        {purchaseStatus === 'attempted' && user.last_checkout_tier && (
                          <span className="ml-1.5 text-[10px] text-slate-400 font-medium">
                            ({TIER_DISPLAY[user.last_checkout_tier] || user.last_checkout_tier})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {user.last_checkout_at ? (
                          <span title={new Date(user.last_checkout_at).toLocaleString()}>
                            {formatDate(user.last_checkout_at)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <CrmDropdown
                          userId={user.id}
                          value={user.crm_status || 'none'}
                          onChange={handleCrmChange}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(user.date_joined)}</td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/users/${user.id}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">No users found.</div>
          )}
        </div>
        <Pagination page={page} count={count} pageSize={PAGE_SIZE} onPage={setPage} />
      </>)}
    </div>
  );
}
