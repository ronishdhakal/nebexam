'use client';

import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/services/users.service';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';

const TIER_DISPLAY = { free: 'Free', '1month': '1 Month', '3month': '3 Months', '1year': '1 Year' };
const TIER_STYLES  = {
  '1month': 'bg-blue-50 text-blue-700 ring-blue-200',
  '3month': 'bg-[#1CA3FD]/10 text-[#1CA3FD] ring-[#1CA3FD]/20',
  '1year':  'bg-violet-50 text-violet-700 ring-violet-200',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function fmtDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtAmount(n) {
  return `Rs. ${Number(n).toLocaleString('en-NP')}`;
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BreakdownChart({ breakdown, onDayClick }) {
  const max = Math.max(...breakdown.map((d) => d.amount), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Daily Earnings</p>
      <div className="flex items-end gap-1.5 h-36">
        {breakdown.map((d) => {
          const pct   = (d.amount / max) * 100;
          const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-NP', { day: 'numeric', month: 'short' });
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
              onClick={() => onDayClick && onDayClick(d.date)}
              title={`${label}: ${fmtAmount(d.amount)} (${d.count} sale${d.count !== 1 ? 's' : ''})`}
            >
              <div className="w-full flex flex-col justify-end" style={{ height: '112px' }}>
                <div
                  className={`w-full rounded-t-md transition-all ${d.amount > 0 ? 'bg-[#1CA3FD] group-hover:bg-[#0e8fe0]' : 'bg-gray-100'}`}
                  style={{ height: `${Math.max(pct, d.amount > 0 ? 4 : 2)}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-medium">{label.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
      {breakdown.length <= 7 && (
        <div className="flex gap-1.5 mt-1">
          {breakdown.map((d, i) => (
            <div key={d.date} className="flex-1 text-center">
              <span className="text-[9px] text-slate-300 font-medium">{DAY_NAMES[i % 7]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Day Payment Table ─────────────────────────────────────────────────────────
function PaymentTable({ payments }) {
  if (!payments?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-10 text-center text-slate-400 text-sm">
        No subscription purchases on this day.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <p className="text-sm font-bold text-slate-900">Payment History</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Coupon</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <p className="font-medium text-slate-900">{p.user_name}</p>
                    <p className="text-xs text-slate-400">{p.user_email}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${TIER_STYLES[p.tier] || 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                    {TIER_DISPLAY[p.tier] || p.tier}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">{fmtAmount(p.amount)}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{p.coupon || '—'}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{fmtDate(p.verified_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function todayStr()     { return new Date().toISOString().slice(0, 10); }
function thisWeekStr()  { return todayStr(); }
function thisMonthStr() { return new Date().toISOString().slice(0, 7); }

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function addMonths(ymStr, n) {
  const [y, m] = ymStr.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function weekLabel(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end   + 'T00:00:00');
  const fmt = (d) => d.toLocaleDateString('en-NP', { day: 'numeric', month: 'short' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function monthLabel(ymStr) {
  const [y, m] = ymStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-NP', { month: 'long', year: 'numeric' });
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EarningsPage() {
  const [period, setPeriod]   = useState('day');

  // Day state
  const [dayDate, setDayDate]   = useState(todayStr());

  // Week state — store any day in target week; API derives Mon–Sun
  const [weekDate, setWeekDate] = useState(thisWeekStr());

  // Month state — YYYY-MM
  const [monthDate, setMonthDate] = useState(thisMonthStr());

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let dateParam;
      if (period === 'day')   dateParam = dayDate;
      if (period === 'week')  dateParam = weekDate;
      if (period === 'month') dateParam = monthDate;
      const res = await paymentService.getEarnings(period, dateParam);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period, dayDate, weekDate, monthDate]);

  useEffect(() => { fetch(); }, [fetch]);

  // Clicking a bar in week/month chart switches to day view for that date
  const handleDayClick = (dateStr) => {
    setDayDate(dateStr);
    setPeriod('day');
  };

  const avg = data?.total_count > 0 ? Math.round(data.total_amount / data.total_count) : 0;

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Subscription revenue by day, week, or month" />

      {/* Period Tabs */}
      <div className="flex gap-2 mb-6">
        {['day', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === p
                ? 'bg-[#1CA3FD] text-white shadow-sm shadow-[#1CA3FD]/30'
                : 'bg-white border border-gray-200 text-slate-600 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD]'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-3 mb-6">
        {period === 'day' && (
          <>
            <button
              onClick={() => setDayDate((d) => addDays(d, -1))}
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <input
              type="date"
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              className="border border-gray-200 bg-white rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent"
            />
            <button
              onClick={() => setDayDate((d) => addDays(d, 1))}
              disabled={dayDate >= todayStr()}
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button
              onClick={() => setDayDate(todayStr())}
              className="text-xs font-semibold text-[#1CA3FD] hover:underline"
            >
              Today
            </button>
          </>
        )}

        {period === 'week' && (
          <>
            <button
              onClick={() => setWeekDate((d) => addDays(d, -7))}
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[200px] text-center">
              {data?.week_start && data?.week_end ? weekLabel(data.week_start, data.week_end) : '…'}
            </span>
            <button
              onClick={() => setWeekDate((d) => addDays(d, 7))}
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button
              onClick={() => setWeekDate(thisWeekStr())}
              className="text-xs font-semibold text-[#1CA3FD] hover:underline"
            >
              This week
            </button>
          </>
        )}

        {period === 'month' && (
          <>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, -1))}
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[160px] text-center">
              {monthLabel(monthDate)}
            </span>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, 1))}
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-[#1CA3FD]/40 hover:text-[#1CA3FD] transition"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button
              onClick={() => setMonthDate(thisMonthStr())}
              className="text-xs font-semibold text-[#1CA3FD] hover:underline"
            >
              This month
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading && (
        <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>
      )}

      {!loading && data && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total Earnings"
              value={fmtAmount(data.total_amount)}
              sub={period === 'day' ? data.date : period === 'week' ? weekLabel(data.week_start, data.week_end) : monthLabel(`${data.year}-${String(data.month).padStart(2, '0')}`)}
            />
            <StatCard
              label="Subscriptions Sold"
              value={data.total_count}
              sub="successful payments"
            />
            <StatCard
              label="Avg. per Sale"
              value={data.total_count > 0 ? fmtAmount(avg) : '—'}
              sub={data.total_count > 0 ? `across ${data.total_count} sale${data.total_count !== 1 ? 's' : ''}` : 'no sales yet'}
            />
          </div>

          {/* Bar chart for week/month */}
          {(period === 'week' || period === 'month') && data.breakdown && (
            <BreakdownChart
              breakdown={data.breakdown}
              onDayClick={handleDayClick}
            />
          )}

          {/* Payment list for day view */}
          {period === 'day' && (
            <PaymentTable payments={data.payments} />
          )}

          {/* Week/Month breakdown table */}
          {(period === 'week' || period === 'month') && data.breakdown && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <p className="text-sm font-bold text-slate-900">Daily Breakdown</p>
                <p className="text-xs text-slate-400 mt-0.5">Click a row to view that day's payments</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Earnings</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sales</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.breakdown.map((d) => {
                      const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-NP', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                      });
                      return (
                        <tr
                          key={d.date}
                          className={`transition-colors ${d.amount > 0 ? 'hover:bg-blue-50/40 cursor-pointer' : 'opacity-50'}`}
                          onClick={() => d.amount > 0 && handleDayClick(d.date)}
                        >
                          <td className="px-5 py-3 text-slate-700 font-medium">{label}</td>
                          <td className="px-5 py-3 font-semibold text-slate-900">{d.amount > 0 ? fmtAmount(d.amount) : '—'}</td>
                          <td className="px-5 py-3 text-slate-500">{d.count > 0 ? d.count : '—'}</td>
                          <td className="px-5 py-3">
                            {d.amount > 0 && (
                              <span className="text-xs text-[#1CA3FD] font-semibold">View →</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
