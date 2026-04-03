'use client';

import { useState, useEffect } from 'react';
import { configService, paymentService } from '@/services/users.service';
import useConfigStore from '@/store/configStore';

const inp = 'w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';

const PLAN_META = {
  '1month': { label: '1 Month',  badge: 'bg-blue-50 text-blue-700' },
  '3month': { label: '3 Months', badge: 'bg-[#1CA3FD]/10 text-[#1CA3FD]' },
  '1year':  { label: '1 Year',   badge: 'bg-violet-50 text-violet-700' },
};

export default function SettingsPage() {
  const { subscriptionRequired, esewaEnabled, setConfig,
          contactEmail, contactPhone, contactAddress, contactWa,
          socialFacebook, socialInstagram } = useConfigStore();
  const [toggleLoading, setToggleLoading] = useState(null);
  const [toggleSaved, setToggleSaved]     = useState(null);
  const [toggleError, setToggleError]     = useState(null);

  const [plans, setPlans]           = useState(null);
  const [planForm, setPlanForm]     = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [planSaved, setPlanSaved]   = useState(false);
  const [planError, setPlanError]   = useState(null);

  const [contactForm, setContactForm]     = useState(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved]   = useState(false);
  const [contactError, setContactError]   = useState(null);

  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheCleared, setCacheCleared]   = useState(false);
  const [cacheError, setCacheError]       = useState(null);

  const [backupRunning, setBackupRunning] = useState(false);
  const [backupDone, setBackupDone]       = useState(false);
  const [backupError, setBackupError]     = useState(null);

  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      configService.getSiteSettings(),
      paymentService.getPlans(),
    ]).then(([cfgResult, planResult]) => {
      if (cfgResult.status === 'fulfilled') {
        const d = cfgResult.value.data;
        setConfig(d);
        setContactForm({
          contact_email:    d.contact_email    ?? '',
          contact_phone:    d.contact_phone    ?? '',
          contact_address:  d.contact_address  ?? '',
          contact_wa:       d.contact_wa       ?? '',
          social_facebook:  d.social_facebook  ?? '',
          social_instagram: d.social_instagram ?? '',
        });
      }
      const p = planResult.status === 'fulfilled' ? planResult.value.data : {};
      setPlans(p);
      setPlanForm({
        '1month': { amount: p['1month']?.amount ?? 100 },
        '3month': { amount: p['3month']?.amount ?? 200 },
        '1year':  { amount: p['1year']?.amount  ?? 300 },
      });
    }).finally(() => setFetching(false));
  }, []);

  const handleTriggerBackup = async () => {
    setBackupRunning(true);
    setBackupDone(false);
    setBackupError(null);
    try {
      await configService.triggerBackup();
      setBackupDone(true);
      setTimeout(() => setBackupDone(false), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to start backup.';
      setBackupError(msg);
    } finally {
      setBackupRunning(false);
    }
  };

  const handleClearCache = async () => {
    setCacheClearing(true);
    setCacheCleared(false);
    setCacheError(null);
    try {
      await configService.clearCache();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch {
      setCacheError('Failed to clear cache.');
    } finally {
      setCacheClearing(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setContactSaving(true);
    setContactSaved(false);
    setContactError(null);
    try {
      const res = await configService.updateSiteSettings(contactForm);
      setConfig(res.data);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2500);
    } catch {
      setContactError('Failed to save contact info.');
    } finally {
      setContactSaving(false);
    }
  };

  const handleToggle = async (field, value) => {
    setToggleLoading(field);
    setToggleSaved(null);
    setToggleError(null);
    try {
      const res = await configService.updateSiteSettings({ [field]: value });
      setConfig(res.data);
      setToggleSaved(field);
      setTimeout(() => setToggleSaved(null), 2000);
    } catch {
      setToggleError('Failed to save.');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleSavePlans = async (e) => {
    e.preventDefault();
    setPlanSaving(true);
    setPlanSaved(false);
    setPlanError(null);
    try {
      const payload = {};
      for (const tier of ['1month', '3month', '1year']) {
        payload[tier] = { amount: Number(planForm[tier].amount) };
      }
      await paymentService.updatePlans(payload);
      setPlanSaved(true);
      setTimeout(() => setPlanSaved(false), 2500);
    } catch {
      setPlanError('Failed to save plan prices.');
    } finally {
      setPlanSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ToggleRow = ({ label, description, fieldKey, value }) => (
    <div className="px-6 py-5 flex items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        {toggleSaved === fieldKey && <p className="text-[11px] text-emerald-600 font-medium mt-1">Saved.</p>}
      </div>
      <button
        onClick={() => handleToggle(fieldKey, !value)}
        disabled={!!toggleLoading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-60 ${
          value ? 'bg-[#1CA3FD]' : 'bg-slate-200'
        }`}
        role="switch" aria-checked={value}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Site Settings</h1>
        <p className="text-sm text-slate-500">Global configuration for the platform.</p>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        <ToggleRow
          label="Require Subscription"
          description="When enabled, users must have a paid subscription to view answers. When disabled, all answers are freely accessible."
          fieldKey="subscription_required"
          value={subscriptionRequired}
        />
        <ToggleRow
          label="eSewa Payments"
          description="When enabled, users pay via eSewa directly. When disabled, upgrade buttons link to WhatsApp."
          fieldKey="esewa_enabled"
          value={esewaEnabled}
        />
      </div>

      {esewaEnabled && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <span className="font-semibold">eSewa test credentials:</span> ID: 9806800001–5 &nbsp;·&nbsp; Password: Nepal@123 &nbsp;·&nbsp; MPIN: 1122 &nbsp;·&nbsp; Token: 123456
        </div>
      )}

      {toggleError && <p className="text-xs text-red-500">{toggleError}</p>}

      {/* Contact Information */}
      {contactForm && (
        <form onSubmit={handleSaveContact} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Contact Information</h2>
          <p className="text-xs text-slate-500 mb-5">Shown on the public Contact page and footer.</p>

          <div className="space-y-4">
            {[
              { key: 'contact_email',    label: 'Email',            type: 'email',  placeholder: 'nebexamofficial@gmail.com' },
              { key: 'contact_phone',    label: 'Phone',            type: 'text',   placeholder: '9745450062' },
              { key: 'contact_address',  label: 'Address',          type: 'text',   placeholder: 'Kathmandu, Nepal' },
              { key: 'contact_wa',       label: 'WhatsApp Number',  type: 'text',   placeholder: '9779745450062 (international format)' },
              { key: 'social_facebook',  label: 'Facebook URL',     type: 'url',    placeholder: 'https://facebook.com/...' },
              { key: 'social_instagram', label: 'Instagram URL',    type: 'url',    placeholder: 'https://instagram.com/...' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="flex items-center gap-4">
                <label className="shrink-0 text-xs font-semibold text-slate-500 w-36">{label}</label>
                <input
                  type={type}
                  value={contactForm[key]}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={`${inp} flex-1`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              type="submit"
              disabled={contactSaving}
              className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {contactSaving ? 'Saving…' : contactSaved ? '✓ Saved' : 'Save Contact Info'}
            </button>
            {contactError && <span className="text-xs text-red-500">{contactError}</span>}
          </div>
        </form>
      )}

      {/* Cache */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-1">Server Cache</h2>
        <p className="text-xs text-slate-500 mb-5">
          Clear the file-based server cache. Use this if content changes are not reflecting for users.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCache}
            disabled={cacheClearing}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {cacheClearing ? 'Clearing…' : cacheCleared ? '✓ Cache Cleared' : 'Clear Cache'}
          </button>
          {cacheError && <span className="text-xs text-red-500">{cacheError}</span>}
        </div>
      </div>

      {/* Database Backup */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-1">Database Backup</h2>
        <p className="text-xs text-slate-500 mb-5">
          Backups run automatically every 12 hours and are stored in Cloudflare R2 under{' '}
          <span className="font-mono bg-slate-100 px-1 rounded">backup/</span>.
          Up to 14 backups are kept (7 days). Click below to take one immediately.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerBackup}
            disabled={backupRunning}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {backupRunning ? 'Starting…' : backupDone ? '✓ Backup Started' : 'Take Backup Now'}
          </button>
          {backupError && <span className="text-xs text-red-500">{backupError}</span>}
        </div>
        {backupDone && (
          <p className="text-xs text-emerald-600 mt-2">
            Backup is running in the background. Check R2 <span className="font-mono">backup/</span> folder in a minute.
          </p>
        )}
      </div>

      {/* Plan Pricing */}
      {planForm && (
        <form onSubmit={handleSavePlans} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Plan Pricing</h2>
          <p className="text-xs text-slate-500 mb-5">Change prices here — no code deployment needed.</p>

          <div className="space-y-4">
            {['1month', '3month', '1year'].map((tier) => {
              const meta = PLAN_META[tier];
              return (
                <div key={tier} className="flex items-center gap-4">
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold w-24 justify-center ${meta.badge}`}>
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-slate-500 shrink-0">Rs.</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={planForm[tier].amount}
                      onChange={(e) =>
                        setPlanForm((prev) => ({ ...prev, [tier]: { amount: e.target.value } }))
                      }
                      className={`${inp} max-w-[120px]`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              type="submit"
              disabled={planSaving}
              className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {planSaving ? 'Saving…' : planSaved ? '✓ Saved' : 'Save Prices'}
            </button>
            {planError && <span className="text-xs text-red-500">{planError}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
