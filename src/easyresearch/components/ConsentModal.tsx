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

const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  projectTitle,
  consentFormUrl,
  consentFormText
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '2px solid var(--color-green)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-3">
            <FileText size={24} style={{ color: 'var(--color-green)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Consent Form
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {projectTitle}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Please review the consent form before participating in this research study.
            </p>
          </div>

          {/* External Consent Form Link */}
          {consentFormUrl && (
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#f0fdf4', border: '1px solid var(--color-green)' }}>
              <div className="flex items-start gap-3">
                <ExternalLink size={20} style={{ color: 'var(--color-green)' }} />
                <div className="flex-1">
                  <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    External Consent Form
                  </p>
                  <a
                    href={consentFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline hover:no-underline"
                    style={{ color: 'var(--color-green)' }}
                  >
                    View Full Consent Document
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Consent Form Text */}
          {consentFormText && (
            <div className="mb-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
              <div 
                className="prose prose-sm max-w-none whitespace-pre-wrap"
                style={{ color: 'var(--text-primary)' }}
              >
                {consentFormText}
              </div>
            </div>
          )}

          {/* Default Consent Text if nothing provided */}
          {!consentFormUrl && !consentFormText && (
            <div className="mb-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
              <p style={{ color: 'var(--text-primary)' }}>
                By participating in this research study, you agree to:
              </p>
              <ul className="mt-3 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li>• Provide accurate and honest responses to survey questions</li>
                <li>• Allow researchers to collect and analyze your anonymized data</li>
                <li>• Understand that your participation is voluntary</li>
                <li>• Acknowledge that you can withdraw from the study at any time</li>
                <li>• Accept that your data will be used for research purposes only</li>
              </ul>
            </div>
          )}

          {/* Agreement Checkbox */}
          <label
            className="flex items-start gap-3 p-4 rounded-xl cursor-pointer"
            style={{ border: agreed ? '2px solid var(--color-green)' : '1px solid var(--border-light)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded"
            />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                I have read and agree to the terms
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                By checking this box, you consent to participate in this research study
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg font-semibold"
            style={{ border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: agreed ? 'var(--color-green)' : 'var(--border-light)',
              cursor: agreed ? 'pointer' : 'not-allowed',
              opacity: agreed ? 1 : 0.5
            }}
          >
            <Check size={20} />
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
