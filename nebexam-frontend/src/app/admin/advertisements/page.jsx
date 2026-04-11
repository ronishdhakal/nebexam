'use client';

import { useState, useEffect, useRef } from 'react';
import { advertisementsService } from '@/services/advertisements.service';
import api from '@/lib/api';

const DESKTOP_W = 1280;
const DESKTOP_H = 715;
const MOBILE_W = 400;
const MOBILE_H = 500;

const PAGE_OPTIONS = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'class-8',  label: 'Class 8' },
  { value: 'class-9',  label: 'Class 9' },
  { value: 'class-10', label: 'Class 10' },
  { value: 'class-11', label: 'Class 11' },
  { value: 'class-12', label: 'Class 12' },
];

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#1CA3FD]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
      {toast.msg}
    </div>
  );
}

function EmptyState({ label, onCreate }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
      <p className="text-sm font-semibold text-slate-700">No {label} yet</p>
      <p className="text-xs text-slate-400 mt-1 mb-4">Create your first {label}.</p>
      <button onClick={onCreate} className="px-4 py-2 bg-[#1CA3FD] text-white text-sm font-semibold rounded-xl hover:bg-[#0e8de0] transition-colors">
        + New {label}
      </button>
    </div>
  );
}

/* ─── Popup Ads tab ──────────────────────────────────────────────────────── */

function ImagePreview({ src, label, w, h }) {
  if (!src) {
    return (
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 text-gray-400 text-xs gap-1"
        style={{ aspectRatio: `${w}/${h}`, maxHeight: 200 }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>{label}</span>
        <span className="text-[10px] text-gray-300">{w}×{h}px</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <img src={src} alt={label} className="w-full object-cover" style={{ maxHeight: 200 }} />
      <p className="text-[10px] text-gray-400 text-center py-1">{label} · {w}×{h}px</p>
    </div>
  );
}

function PopupAdsTab({ showToast }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editAd, setEditAd] = useState(null);
  const [form, setForm] = useState({ link: '', open_in_new_tab: true, is_active: false, is_skippable: true, skip_after_seconds: 5 });
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const desktopRef = useRef();
  const mobileRef = useRef();

  const fetch = async () => {
    try { setAds((await advertisementsService.listPopupAds()).data?.results ?? (await advertisementsService.listPopupAds()).data ?? []); }
    catch { setAds([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const reset = () => {
    setEditAd(null);
    setForm({ link: '', open_in_new_tab: true, is_active: false, is_skippable: true, skip_after_seconds: 5 });
    setDesktopFile(null); setMobileFile(null); setDesktopPreview(null); setMobilePreview(null);
  };

  const openCreate = () => { reset(); setShowForm(true); };
  const openEdit = (ad) => {
    setEditAd(ad);
    setForm({ link: ad.link || '', open_in_new_tab: ad.open_in_new_tab, is_active: ad.is_active, is_skippable: ad.is_skippable, skip_after_seconds: ad.skip_after_seconds });
    setDesktopFile(null); setMobileFile(null);
    setDesktopPreview(ad.desktop_image || null); setMobilePreview(ad.mobile_image || null);
    setShowForm(true);
  };

  const handleImg = (e, type) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'desktop') { setDesktopFile(file); setDesktopPreview(url); }
    else { setMobileFile(file); setMobilePreview(url); }
  };

  const handleSave = async () => {
    if (!editAd && (!desktopFile || !mobileFile)) { showToast('Both images required.', 'error'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      ['link', 'open_in_new_tab', 'is_active', 'is_skippable', 'skip_after_seconds'].forEach(k => fd.append(k, form[k]));
      if (desktopFile) fd.append('desktop_image', desktopFile);
      if (mobileFile) fd.append('mobile_image', mobileFile);
      const opts = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editAd) { await api.patch(`/advertisements/popup-ads/${editAd.id}/`, fd, opts); showToast('Ad updated.'); }
      else { await api.post('/advertisements/popup-ads/', fd, opts); showToast('Ad created.'); }
      setShowForm(false); fetch();
    } catch { showToast('Failed to save.', 'error'); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#1CA3FD] text-white text-sm font-semibold rounded-xl hover:bg-[#0e8de0] transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Popup Ad
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-slate-900">{editAd ? 'Edit Popup Ad' : 'New Popup Ad'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[['desktop', 'Desktop', DESKTOP_W, DESKTOP_H, desktopPreview, desktopRef], ['mobile', 'Mobile', MOBILE_W, MOBILE_H, mobilePreview, mobileRef]].map(([type, label, w, h, preview, ref]) => (
                  <div key={type}>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">{label} Image <span className="text-gray-400 font-normal">({w}×{h}px)</span></label>
                    <ImagePreview src={preview} label={label} w={w} h={h} />
                    <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleImg(e, type)} />
                    <button onClick={() => ref.current?.click()} className="mt-2 w-full text-xs text-[#1CA3FD] border border-[#1CA3FD]/30 rounded-lg py-1.5 hover:bg-[#1CA3FD]/5 transition-colors">
                      {preview ? 'Change image' : 'Upload image'}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link URL</label>
                <input type="url" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://example.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]" />
              </div>
              <div className="space-y-3">
                <Toggle checked={form.open_in_new_tab} onChange={v => setForm(f => ({ ...f, open_in_new_tab: v }))} label="Open link in new tab" />
                <Toggle checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active (deactivates any other active ad)" />
                <Toggle checked={form.is_skippable} onChange={v => setForm(f => ({ ...f, is_skippable: v }))} label="Skippable" />
              </div>
              {form.is_skippable && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Show skip button after (seconds)</label>
                  <input type="number" min={0} max={60} value={form.skip_after_seconds} onChange={e => setForm(f => ({ ...f, skip_after_seconds: Number(e.target.value) }))} className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]" />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold bg-[#1CA3FD] text-white rounded-xl hover:bg-[#0e8de0] disabled:opacity-60 transition-colors">
                  {saving ? 'Saving…' : editAd ? 'Update Ad' : 'Create Ad'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : ads.length === 0 ? (
        <EmptyState label="popup ad" onCreate={openCreate} />
      ) : (
        <div className="space-y-4">
          {ads.map(ad => (
            <div key={ad.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-5 items-start ${ad.is_active ? 'border-[#1CA3FD]/40 ring-1 ring-[#1CA3FD]/20' : 'border-gray-100'}`}>
              <div className="flex gap-3 shrink-0">
                <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {ad.desktop_image ? <img src={ad.desktop_image} alt="Desktop" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">Desktop</div>}
                </div>
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {ad.mobile_image ? <img src={ad.mobile_image} alt="Mobile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">Mob</div>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{ad.is_active ? 'Active' : 'Inactive'}</span>
                  {ad.is_skippable ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Skip after {ad.skip_after_seconds}s</span> : <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600">Non-skippable</span>}
                  {ad.open_in_new_tab && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">New tab</span>}
                </div>
                {ad.link ? <p className="text-xs text-slate-500 truncate max-w-sm">{ad.link}</p> : <p className="text-xs text-gray-300 italic">No link</p>}
                <p className="text-[10px] text-gray-400 mt-1">{new Date(ad.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={async () => { await api.patch(`/advertisements/popup-ads/${ad.id}/`, { is_active: !ad.is_active }); fetch(); }} className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${ad.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
                  {ad.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(ad)} className="p-2 text-slate-400 hover:text-[#1CA3FD] hover:bg-[#1CA3FD]/5 rounded-lg transition-colors">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={async () => { if (!confirm('Delete this ad?')) return; setDeleting(ad.id); try { await advertisementsService.deletePopupAd(ad.id); showToast('Deleted.'); fetch(); } catch { showToast('Failed.', 'error'); } finally { setDeleting(null); } }} disabled={deleting === ad.id} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Text Ads tab ───────────────────────────────────────────────────────── */

function PageCheckboxes({ selected, onChange }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(p => p !== val) : [...selected, val]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {PAGE_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => toggle(value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selected.includes(value) ? 'bg-[#1CA3FD] text-white border-[#1CA3FD]' : 'bg-white text-slate-600 border-gray-200 hover:border-[#1CA3FD]/40'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function TextAdsTab({ showToast }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editAd, setEditAd] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', link: '', link_text: 'Apply Now', pages: [], is_active: false });

  const fetch = async () => {
    try { setAds((await advertisementsService.listTextAds()).data?.results ?? (await advertisementsService.listTextAds()).data ?? []); }
    catch { setAds([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditAd(null);
    setForm({ title: '', description: '', link: '', link_text: 'Apply Now', pages: [], is_active: false });
    setShowForm(true);
  };
  const openEdit = (ad) => {
    setEditAd(ad);
    setForm({ title: ad.title, description: ad.description || '', link: ad.link || '', link_text: ad.link_text || 'Apply Now', pages: ad.pages || [], is_active: ad.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Title is required.', 'error'); return; }
    if (!form.pages.length) { showToast('Select at least one page.', 'error'); return; }
    setSaving(true);
    try {
      if (editAd) { await advertisementsService.updateTextAd(editAd.id, form); showToast('Text ad updated.'); }
      else { await advertisementsService.createTextAd(form); showToast('Text ad created.'); }
      setShowForm(false); fetch();
    } catch { showToast('Failed to save.', 'error'); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#1CA3FD] text-white text-sm font-semibold rounded-xl hover:bg-[#0e8de0] transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Text Ad
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-slate-900">{editAd ? 'Edit Text Ad' : 'New Text Ad'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Study Abroad with AECC" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Get 50% Off on IELTS/PTE Classes" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link URL</label>
                  <input type="url" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://example.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Button text</label>
                  <input value={form.link_text} onChange={e => setForm(f => ({ ...f, link_text: e.target.value }))} placeholder="Apply Now" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Show on pages <span className="text-red-400">*</span></label>
                <PageCheckboxes selected={form.pages} onChange={pages => setForm(f => ({ ...f, pages }))} />
              </div>
              <Toggle checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active" />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold bg-[#1CA3FD] text-white rounded-xl hover:bg-[#0e8de0] disabled:opacity-60 transition-colors">
                  {saving ? 'Saving…' : editAd ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : ads.length === 0 ? (
        <EmptyState label="text ad" onCreate={openCreate} />
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 items-center ${ad.is_active ? 'border-[#1CA3FD]/40 ring-1 ring-[#1CA3FD]/20' : 'border-gray-100'}`}>
              {/* Preview strip */}
              <div
                className="hidden sm:block shrink-0 w-40 h-12 rounded-lg overflow-hidden relative"
                style={{ backgroundImage: "url('/assets/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0 bg-black/55 flex flex-col justify-center px-2">
                  <p className="text-white text-[9px] font-bold leading-tight truncate">{ad.title}</p>
                  {ad.description && <p className="text-white/70 text-[8px] leading-tight truncate">{ad.description}</p>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{ad.is_active ? 'Active' : 'Inactive'}</span>
                  {(ad.pages || []).map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{PAGE_OPTIONS.find(o => o.value === p)?.label || p}</span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{ad.title}</p>
                {ad.description && <p className="text-xs text-slate-500 truncate">{ad.description}</p>}
                {ad.link && <p className="text-[10px] text-[#1CA3FD] truncate mt-0.5">{ad.link_text} → {ad.link}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={async () => { await advertisementsService.updateTextAd(ad.id, { is_active: !ad.is_active }); fetch(); }} className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${ad.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
                  {ad.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(ad)} className="p-2 text-slate-400 hover:text-[#1CA3FD] hover:bg-[#1CA3FD]/5 rounded-lg transition-colors">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={async () => { if (!confirm('Delete this ad?')) return; setDeleting(ad.id); try { await advertisementsService.deleteTextAd(ad.id); showToast('Deleted.'); fetch(); } catch { showToast('Failed.', 'error'); } finally { setDeleting(null); } }} disabled={deleting === ad.id} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Root page ──────────────────────────────────────────────────────────── */

export default function AdvertisementsPage() {
  const [tab, setTab] = useState('text');
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      <div>
        <h1 className="text-xl font-bold text-slate-900">Advertisements</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage text banners and popup ads shown to users.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[['text', 'Text Ads'], ['popup', 'Popup Ads']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'text' ? <TextAdsTab showToast={showToast} /> : <PopupAdsTab showToast={showToast} />}
    </div>
  );
}
