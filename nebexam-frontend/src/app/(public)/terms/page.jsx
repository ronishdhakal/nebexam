export const metadata = {
  title: 'Terms & Conditions — NEB Exam',
  description: 'Read the terms and conditions for using the NEB Exam platform — account rules, subscription policies, intellectual property and more.',
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Terms &amp; Conditions</h1>
          <p className="text-white/70 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 space-y-8">

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using NEB Exam (&quot;the Platform&quot;), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use the Platform.</p>
          </Section>

          <Section title="2. Use of the Platform">
            <p>NEB Exam is an educational resource for personal, non-commercial study purposes. You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Copy, redistribute, or republish any content without written permission</li>
              <li>Share your account credentials with others</li>
              <li>Use automated tools to scrape or extract content</li>
              <li>Attempt to bypass subscription restrictions</li>
              <li>Use the Platform for any unlawful purpose</li>
            </ul>
          </Section>

          <Section title="3. Accounts">
            <p>You are responsible for maintaining the confidentiality of your account. Each account is for a single user. Sharing accounts is not permitted and may result in account suspension.</p>
            <p>We reserve the right to terminate or suspend accounts that violate these Terms.</p>
          </Section>

          <Section title="4. Subscriptions &amp; Payments">
            <p>Paid subscriptions unlock full access to answers, PDF notes, and past papers. Subscription fees are listed on the pricing page and may be updated at any time — changes will not affect active subscriptions until renewal.</p>
            <p>Payments are processed via eSewa. Once a subscription is activated, <strong>no refunds</strong> will be issued except at our sole discretion in cases of verified technical failure.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>All content on NEB Exam — including notes, questions, solutions, and design — is owned by NEB Exam or its content contributors and is protected by copyright. Unauthorised reproduction or distribution is strictly prohibited.</p>
          </Section>

          <Section title="6. Disclaimer of Warranties">
            <p>The Platform is provided &quot;as is&quot; without warranties of any kind. While we strive for accuracy, we do not guarantee that all study materials, solutions, or answers are error-free. Students should cross-reference with official NEB textbooks.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>To the fullest extent permitted by law, NEB Exam shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform or reliance on its content.</p>
          </Section>

          <Section title="8. Changes to Terms">
            <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by the laws of Nepal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nepal.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:nebexamofficial@gmail.com" className="text-[#1CA3FD] hover:underline">nebexamofficial@gmail.com</a>.</p>
          </Section>

        </div>
      </div>
    </div>
  );
}
