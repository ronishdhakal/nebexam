'use client';

import { useState, useEffect, useCallback } from 'react';
import { leadsService } from '@/services/leads.service';
import PageHeader from '@/components/admin/shared/PageHeader';
import Pagination from '@/components/admin/shared/Pagination';

const PAGE_SIZE = 20;

const COUNTRY_LABEL = {
  australia:   'Australia',
  canada:      'Canada',
  new_zealand: 'New Zealand',
  uk:          'United Kingdom',
  usa:         'United States',
  other:       'Other',
};

const COUNTRY_COLORS = {
  australia:   'bg-sky-50 text-sky-700 ring-sky-200',
  canada:      'bg-red-50 text-red-700 ring-red-200',
  new_zealand: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  uk:          'bg-violet-50 text-violet-700 ring-violet-200',
  usa:         'bg-blue-50 text-blue-700 ring-blue-200',
  other:       'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function LeadsPage() {
  const [leads, setLeads]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [country, setCountry]     = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search)  params.search  = search;
      if (country) params.country = country;
      const res = await leadsService.list(params);
      const data = res.data;
      if (Array.isArray(data)) {
        setLeads(data);
        setTotal(data.length);
      } else {
        setLeads(data.results ?? []);
        setTotal(data.count   ?? 0);
      }
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, country]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Reset to page 1 on filter change
  const setFilter = (fn) => { fn(); setPage(1); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (search)  params.search  = search;
      if (country) params.country = country;
      const res  = await leadsService.export(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const href = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = href;
      a.download = `study-abroad-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch { /* silent */ } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Abroad Leads"
        description={`${total} lead${total !== 1 ? 's' : ''} collected`}
        action={
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50 shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setFilter(() => setSearch(e.target.value))}
          placeholder="Search name, email, phone…"
          className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] w-64"
        />
        <select
          value={country}
          onChange={(e) => setFilter(() => setCountry(e.target.value))}
          className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]"
        >
          <option value="">All Countries</option>
          {Object.entries(COUNTRY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {(search || country) && (
          <button
            onClick={() => { setSearch(''); setCountry(''); setPage(1); }}
            className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl border border-slate-200 bg-white transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-400">No leads found.</div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50">
                {['Name', 'Phone', 'Email', 'District', 'Country', 'Message', 'Linked User', 'Submitted'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => {
                const countryLabel = lead.interested_country === 'other'
                  ? `Other: ${lead.other_country || '—'}`
                  : (COUNTRY_LABEL[lead.interested_country] || lead.interested_country);
                const color = COUNTRY_COLORS[lead.interested_country] || COUNTRY_COLORS.other;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-slate-600">{lead.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{lead.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{lead.district || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${color}`}>
                        {countryLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px]">
                      <span className="line-clamp-2">{lead.message || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{lead.user || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {lead.submitted_at ? new Date(lead.submitted_at).toLocaleDateString('en-NP', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
