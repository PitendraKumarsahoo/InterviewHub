import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-[#EAE4DC] px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="space-y-2 border-b border-[#EAE4DC] pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Legal & Transparency</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: September 2026 · PrepLoop Student Interview Intelligence
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Overview</h2>
          <p>
            PrepLoop is an open, student-first platform designed to share real campus and off-campus interview questions, round structures, and preparation insights. We value your privacy and only collect information essential for authenticating users, attributing shared experiences, and preventing platform abuse.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
            <li>
              <strong className="text-slate-800">Authentication Information:</strong> When you sign in using Google OAuth, we receive your name, email address, and avatar image. We do not receive or store your Google password.
            </li>
            <li>
              <strong className="text-slate-800">Academic Profile Data:</strong> College name, department/branch, degree program, and graduation year that you choose to provide in your profile.
            </li>
            <li>
              <strong className="text-slate-800">Submitted Contributions:</strong> Interview questions, rounds, company names, difficulty ratings, and preparation advice that you voluntarily submit to the platform.
            </li>
            <li>
              <strong className="text-slate-800">Usage Data:</strong> Bookmarked experiences and community upvotes associated with your verified account.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. How Information Is Used</h2>
          <p>We use your information strictly for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
            <li>Publishing approved interview debriefs and questions for peer learning.</li>
            <li>Displaying verified author badges (with option to submit anonymously).</li>
            <li>Preventing automated spam, duplicate submissions, and abusive content.</li>
            <li>Generating customized preparation guides when requested by the user.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Data Sharing & Security</h2>
          <p>
            We do not sell, rent, or monetize your personal information to third parties. All database communications are encrypted in transit via SSL/TLS and stored securely in Google Cloud / Firebase Firestore under strict access rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. User Control & Deletion</h2>
          <p>
            You may request deletion or updates of your account and submitted experiences at any time by contacting our administrators or updating your profile directly within the application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Contact</h2>
          <p>
            For privacy inquiries or data requests, contact us at:{' '}
            <a href="mailto:sahoopitendrakumar@gmail.com" className="text-orange-600 font-semibold hover:underline">
              sahoopitendrakumar@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
