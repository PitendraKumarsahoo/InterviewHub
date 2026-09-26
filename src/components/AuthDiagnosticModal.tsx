import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Copy, Check, ExternalLink, X, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

export const AuthDiagnosticModal: React.FC = () => {
  const { authError, clearAuthError, signInWithGoogle } = useAuth();
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!authError) return null;

  const currentHost = authError.domain || (typeof window !== 'undefined' ? window.location.hostname : '');
  const isUnauthorizedDomain = authError.code === 'auth/unauthorized-domain';
  const isPopupBlocked = authError.code === 'auth/popup-blocked';

  const handleCopy = () => {
    if (navigator?.clipboard && currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await signInWithGoogle();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isUnauthorizedDomain
                  ? 'Google Sign-In: Domain Setup Needed'
                  : isPopupBlocked
                  ? 'Browser Popup Blocked'
                  : 'Google Sign-In Error'}
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                {isUnauthorizedDomain
                  ? 'One quick configuration step in Firebase Console'
                  : 'Action required to proceed with authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={clearAuthError}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700">
          {isUnauthorizedDomain ? (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                Firebase Authentication restricts Google Sign-In to authorized domains for security. Because your application is deployed on Vercel, this domain must be whitelisted in your Firebase project.
              </p>

              {/* Domain Copy Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Domain to add in Firebase Console:
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                  <code className="text-xs font-mono font-bold text-orange-600 flex-1 truncate select-all">
                    {currentHost}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Domain</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step by step instructions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Steps to fix on Firebase Console:
                </p>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Go to{' '}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5 hover:text-orange-700"
                    >
                      Firebase Console <ExternalLink className="w-3 h-3 inline" />
                    </a>{' '}
                    and select your project.
                  </li>
                  <li>
                    Click <span className="font-semibold text-slate-800">Authentication</span> in the left sidebar, then select the <span className="font-semibold text-slate-800">Settings</span> tab.
                  </li>
                  <li>
                    Scroll to <span className="font-semibold text-slate-800">Authorized domains</span> and click <span className="font-semibold text-slate-800">Add domain</span>.
                  </li>
                  <li>
                    Paste <code className="bg-orange-50 text-orange-700 px-1 py-0.5 rounded font-mono font-semibold">{currentHost}</code> and click <span className="font-semibold text-slate-800">Save</span>.
                  </li>
                </ol>
              </div>
            </>
          ) : isPopupBlocked ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                Your browser blocked the Google authentication popup window.
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Look for the blocked popup icon in your browser address bar (top right).</li>
                <li>Choose "Always allow popups and redirects from this site".</li>
                <li>Click the "Retry Sign In" button below.</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-mono">
                {authError.message}
              </div>
              <p className="text-xs text-slate-500">
                Error Code: <span className="font-mono font-bold text-slate-700">{authError.code}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={clearAuthError}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Dismiss
          </button>
          <div className="flex items-center gap-2">
            {isUnauthorizedDomain && (
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Retrying...' : 'Retry Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
