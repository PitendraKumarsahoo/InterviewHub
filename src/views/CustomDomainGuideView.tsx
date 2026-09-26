import React, { useState } from 'react';
import { Globe, ArrowLeft, Check, Copy, ExternalLink, ShieldCheck, Server } from 'lucide-react';

interface CustomDomainGuideViewProps {
  onBack: () => void;
}

export const CustomDomainGuideView: React.FC<CustomDomainGuideViewProps> = ({ onBack }) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.com';

  const copyHost = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

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
          <Globe className="w-4 h-4" />
          <span>Deployment &amp; Infrastructure</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Custom Domain Configuration
        </h1>
        <p className="text-xs text-slate-500">
          Complete guide to connecting your custom apex or subdomain on Vercel and Firebase Auth
        </p>
      </div>

      {/* Current Host Box */}
      <div className="bg-white border border-[#EAE4DC] rounded-xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Current Hostname
          </span>
          <button
            onClick={copyHost}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-[#FAF8F5] border border-[#EAE4DC] rounded-md hover:bg-slate-100 transition-colors"
          >
            {copiedDomain ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Current Host</span>
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-sm font-bold text-orange-600 bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE4DC] select-all">
          {currentHost}
        </div>
      </div>

      {/* Step by step guide */}
      <div className="space-y-6 text-sm text-slate-700">
        {/* Step 1: Vercel */}
        <section className="bg-white border border-[#EAE4DC] rounded-xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Server className="w-5 h-5 text-indigo-600" />
            <h2>Step 1: Configure Custom Domain in Vercel</h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed pl-1">
            <li>Log into your <strong>Vercel Dashboard</strong> and navigate to your project.</li>
            <li>Click <strong>Settings</strong> $\rightarrow$ <strong>Domains</strong>.</li>
            <li>Enter your custom domain (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">preploop.org</code> or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">interview.yourcollege.edu</code>).</li>
            <li>Configure the DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
              <ul className="list-disc list-inside ml-4 mt-1.5 space-y-1 text-slate-500">
                <li>For apex domain (<code className="text-slate-700">yourdomain.com</code>): Add an <code className="text-slate-700">A</code> record pointing to <code className="text-slate-800 font-mono font-bold">76.76.21.21</code></li>
                <li>For subdomain (<code className="text-slate-700">www</code> or <code className="text-slate-700">app</code>): Add a <code className="text-slate-700">CNAME</code> record pointing to <code className="text-slate-800 font-mono font-bold">cname.vercel-dns.com</code></li>
              </ul>
            </li>
            <li>Wait for DNS verification and automatic SSL certificate generation by Vercel.</li>
          </ol>
        </section>

        {/* Step 2: Firebase Auth */}
        <section className="bg-white border border-[#EAE4DC] rounded-xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2>Step 2: Whitelist Custom Domain in Firebase Auth</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Google Sign-In will fail with <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono font-bold">auth/unauthorized-domain</code> until your new custom domain is authorized in Firebase.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed pl-1">
            <li>
              Open{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 font-semibold underline inline-flex items-center gap-1"
              >
                Firebase Console <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              and choose your project.
            </li>
            <li>Click <strong>Authentication</strong> in the left navigation menu.</li>
            <li>Click the <strong>Settings</strong> tab at the top.</li>
            <li>Scroll down to <strong>Authorized domains</strong> and click <strong>Add domain</strong>.</li>
            <li>Enter your custom domain without <code className="text-slate-600">https://</code> (e.g., <code className="bg-orange-50 text-orange-700 font-mono font-bold px-1 py-0.5 rounded">preploop.org</code>).</li>
            <li>Click <strong>Save</strong>. Google OAuth sign-in will now work seamlessly on your custom domain.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};
