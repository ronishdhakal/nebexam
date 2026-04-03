export const metadata = {
  title: 'Disclaimer — NEB Exam',
  description: 'NEB Exam is an independent study platform and is not affiliated with the National Examination Board of Nepal. Read our full content disclaimer.',
};

const LAST_UPDATED = 'January 2025';

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Disclaimer</h1>
          <p className="text-white/70 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Prominent accuracy notice */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg width="22" height="22" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Content Accuracy Notice</p>
              <p className="text-sm text-amber-700 dark:text-amber-500 leading-relaxed">
                NEB Exam does <strong>not guarantee</strong> that all notes, questions, answers, or solutions on this platform are 100% accurate or error-free. Content is prepared for supplementary study purposes and should always be verified against official NEB textbooks and publications.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 space-y-8">

          <Section title="1. No Guarantee of Accuracy">
            <p>While every effort is made to ensure the accuracy and completeness of the study materials on NEB Exam, we cannot guarantee that all content — including notes, question solutions, past paper answers, and model questions — is free from errors or omissions.</p>
            <p>Students are strongly advised to cross-reference all information with their official NEB textbooks, prescribed reading materials, and guidance from qualified teachers.</p>
          </Section>

          <Section title="2. Report Errors">
            <p>We actively encourage users to report any errors, mistakes, or inaccuracies they find in our content. Your feedback helps us maintain quality for all students.</p>
            <p>To report an error, please contact us at <a href="mailto:nebexamofficial@gmail.com" className="text-[#1CA3FD] hover:underline">nebexamofficial@gmail.com</a> or via the <a href="/contact" className="text-[#1CA3FD] hover:underline">Contact page</a>. We review all reports and publish corrections promptly.</p>
          </Section>

          <Section title="3. Not Affiliated with NEB">
            <p>NEB Exam is an <strong>independent</strong> educational platform. We are not affiliated with, endorsed by, or connected to the National Examination Board (NEB) of Nepal or any government educational authority. The name &quot;NEB Exam&quot; refers to the board&apos;s examination system, not an official NEB product.</p>
          </Section>

          <Section title="4. Supplementary Use Only">
            <p>Content on this platform is intended for <strong>supplementary study purposes only</strong>. It should not be used as a replacement for attending school, reading official textbooks, or consulting qualified teachers. Exam preparation requires a comprehensive approach.</p>
          </Section>

          <Section title="5. No Guarantee of Exam Results">
            <p>Using NEB Exam does not guarantee any particular result in NEB examinations. Academic success depends on many factors including individual effort, teaching quality, and examination conditions which are outside our control.</p>
          </Section>

          <Section title="6. Third-Party Content">
            <p>Some questions and materials on the platform are sourced from or inspired by official NEB past papers and model questions, which are in the public domain. We do not claim copyright over these original official materials.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>NEB Exam and its operators shall not be held liable for any academic outcomes, decisions made based on content found on this platform, or any direct or indirect loss arising from reliance on our study materials.</p>
          </Section>

        </div>
      </div>
    </div>
  );
}
