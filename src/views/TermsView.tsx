import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
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
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-slate-500">
          Effective date: September 2026 · PrepLoop Student Community
        </p>
      </div>

      {/* Terms Sections */}
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using PrepLoop, you agree to comply with and be bound by these Terms and Conditions. If you disagree with any part of these terms, please discontinue use of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Permitted Use &amp; Academic Integrity</h2>
          <p>
            PrepLoop is an educational resource created to help students understand interview structures, problem types, and recruitment formats. You agree:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
            <li>Not to violate non-disclosure agreements (NDAs) or post copyrighted assessment test banks.</li>
            <li>To submit only genuine, first-hand interview experiences and questions.</li>
            <li>Not to submit fabricated, offensive, defamatory, or misleading information.</li>
            <li>Not to scrape, crawl, or attempt automated exfiltration of platform data without written permission.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Content Moderation &amp; Approval</h2>
          <p>
            All submitted interview debriefs and questions are subject to review by community moderators before publication. We reserve the right to edit for clarity, redact personal identifiers of interviewers, or reject submissions that violate our guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Community Contributions License</h2>
          <p>
            By submitting content to PrepLoop, you grant the platform a non-exclusive, perpetual, royalty-free license to host, display, index, and organize the content for the benefit of fellow students.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Disclaimer of Placement Guarantees</h2>
          <p>
            PrepLoop is a peer-learning platform. We do not guarantee employment, selection, or interview success at any company. Company recruitment processes, criteria, and question sets vary across campuses and hiring cycles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Modifications to Terms</h2>
          <p>
            We may update these terms periodically to reflect community feedback or regulatory changes. Continued use of the platform indicates acceptance of any updated terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. Inquiries</h2>
          <p>
            For questions regarding these terms, contact us at:{' '}
            <a href="mailto:sahoopitendrakumar@gmail.com" className="text-orange-600 font-semibold hover:underline">
              sahoopitendrakumar@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
