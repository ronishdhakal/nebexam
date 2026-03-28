export const metadata = {
  title: 'Privacy Policy — NEB Exam',
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-white/70 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 space-y-8">

          <Section title="1. Information We Collect">
            <p>When you register on NEB Exam, we collect your <strong>name, email address</strong>, and optionally your <strong>phone number</strong>. We also record your subscription tier and class level to personalise your experience.</p>
            <p>We automatically collect basic usage data such as the pages you visit and study sessions, used solely to improve the platform.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your information is used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and manage your account and subscription</li>
              <li>Process payments via eSewa (when enabled)</li>
              <li>Send important account notifications</li>
              <li>Improve and personalise the platform</li>
              <li>Respond to your support requests</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal data to third parties.</p>
          </Section>

          <Section title="3. Payment Data">
            <p>Payments are processed by <strong>eSewa</strong>, a third-party payment gateway. NEB Exam does not store your payment card details. Please review <a href="https://esewa.com.np" target="_blank" rel="noopener noreferrer" className="text-[#1CA3FD] hover:underline">eSewa&apos;s privacy policy</a> for information on how they handle payment data.</p>
          </Section>

          <Section title="4. Cookies">
            <p>We use minimal, essential cookies to maintain your login session. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="5. Data Security">
            <p>We take reasonable measures to protect your personal information. Passwords are hashed and never stored in plain text. All data is transmitted over HTTPS.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>Your account data is retained for as long as your account is active. You may request deletion of your account and associated data by contacting us at <a href="mailto:nebexamofficial@gmail.com" className="text-[#1CA3FD] hover:underline">nebexamofficial@gmail.com</a>.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>NEB Exam is intended for students aged 14 and above. We do not knowingly collect data from children under 14. If you believe a child has provided us with personal information, please contact us so we can delete it.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Significant changes will be communicated via the platform. Continued use after changes constitutes your acceptance of the new policy.</p>
          </Section>

          <Section title="9. Contact">
            <p>For any privacy-related queries, contact us at <a href="mailto:nebexamofficial@gmail.com" className="text-[#1CA3FD] hover:underline">nebexamofficial@gmail.com</a>.</p>
          </Section>

        </div>
      </div>
    </div>
  );
}
