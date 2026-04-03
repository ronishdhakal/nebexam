'use client';

import useConfigStore from '@/store/configStore';

function InfoRow({ icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#1CA3FD]/10 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition">{content}</a>;
  }
  return <div>{content}</div>;
}

export default function ContactPageClient() {
  const { contactEmail, contactPhone, contactAddress, contactWa, socialFacebook, socialInstagram } = useConfigStore();

  const waLink = contactWa ? `https://wa.me/${contactWa}` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Get in touch</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/70 text-sm max-w-xl">
            Have a question, found an error, or want to give feedback? We&apos;re always happy to hear from NEB students and educators.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Contact Details</h2>

            {contactEmail && (
              <InfoRow
                label="Email"
                value={contactEmail}
                href={`mailto:${contactEmail}`}
                icon={<svg width="18" height="18" fill="none" stroke="#1CA3FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
              />
            )}

            {contactPhone && (
              <InfoRow
                label="Phone"
                value={contactPhone}
                href={`tel:${contactPhone}`}
                icon={<svg width="18" height="18" fill="none" stroke="#1CA3FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.12 6.12l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
              />
            )}

            {contactWa && (
              <InfoRow
                label="WhatsApp"
                value={`+${contactWa}`}
                href={waLink}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#1CA3FD"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
              />
            )}

            {contactAddress && (
              <InfoRow
                label="Address"
                value={contactAddress}
                icon={<svg width="18" height="18" fill="none" stroke="#1CA3FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>}
              />
            )}
          </div>

          {/* Reach out card */}
          <div className="space-y-5">
            {/* Social */}
            {(socialFacebook || socialInstagram) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">Follow Us</h2>
                <div className="flex flex-col gap-3">
                  {socialFacebook && (
                    <a href={socialFacebook} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-[#1CA3FD] transition font-medium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </a>
                  )}
                  {socialInstagram && (
                    <a href={socialInstagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-[#1CA3FD] transition font-medium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Error reporting note */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Found an error in our content?</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                    While we strive for accuracy, mistakes can happen. Please email us or message via WhatsApp — we&apos;ll review and fix it promptly.
                  </p>
                </div>
              </div>
            </div>

            {/* Response time */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Response Time</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">We typically respond within <span className="font-semibold text-[#1CA3FD]">24 hours</span> on business days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
