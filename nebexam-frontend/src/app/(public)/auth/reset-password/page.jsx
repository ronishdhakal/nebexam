import { redirect } from 'next/navigation';

// Reset flow is now handled entirely in /auth/forgot-password (2-step OTP flow)
export default function ResetPasswordPage() {
  redirect('/auth/forgot-password');
}
