import React, { useState } from 'react';
import { X, FileText, ExternalLink, Check } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  projectTitle: string;
  consentFormUrl?: string;
  consentFormText?: string;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onAccept, projectTitle, consentFormUrl, consentFormText }) => {
  const [agreed, setAgreed] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText size={16} className="text-emerald-500" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-800">Consent Form</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X size={16} className="text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <h3 className="text-[14px] font-semibold text-stone-800 mb-1">{projectTitle}</h3>
            <p className="text-[12px] text-stone-400 font-light">Please review before participating.</p>
          </div>

          {consentFormUrl && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-start gap-2.5">
                <ExternalLink size={16} className="text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-[13px] font-medium text-stone-700 mb-1">External Consent Form</p>
                  <a href={consentFormUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-emerald-500 underline hover:no-underline">View Full Document</a>
                </div>
              </div>
            </div>
          )}

          {consentFormText && (
            <div className="mb-5 p-5 rounded-xl bg-stone-50 border border-stone-100">
              <div className="prose prose-sm max-w-none text-[13px] text-stone-600 whitespace-pre-wrap font-light">{consentFormText}</div>
            </div>
          )}

          {!consentFormUrl && !consentFormText && (
            <div className="mb-5 p-5 rounded-xl bg-stone-50 border border-stone-100">
              <p className="text-[13px] text-stone-600 font-light">By participating, you agree to:</p>
              <ul className="mt-2 space-y-1.5 text-[12px] text-stone-500 font-light">
                <li className="flex items-start gap-2"><span className="text-stone-300">•</span> Provide accurate and honest responses</li>
                <li className="flex items-start gap-2"><span className="text-stone-300">•</span> Allow researchers to analyze your anonymized data</li>
                <li className="flex items-start gap-2"><span className="text-stone-300">•</span> Understand participation is voluntary</li>
                <li className="flex items-start gap-2"><span className="text-stone-300">•</span> You can withdraw at any time</li>
              </ul>
            </div>
          )}

          <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${agreed ? 'border-emerald-300 bg-emerald-50/50' : 'border-stone-100 hover:bg-stone-50/50'}`}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded accent-emerald-500" />
            <div>
              <p className="text-[13px] font-medium text-stone-700">I have read and agree to the terms</p>
              <p className="text-[11px] text-stone-400 font-light mt-0.5">By checking this box, you consent to participate</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={() => agreed && onAccept()} disabled={!agreed}
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-40 transition-all">
            <Check size={14} /> Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
