import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Mail, FileText, Shield, HelpCircle } from 'lucide-react';

const ResearcherFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-auto" style={{ borderColor: 'var(--border-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <BarChart3 size={18} className="text-white" />
              </div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                EasierResearch
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              The most advanced ESM/EMA platform for experience sampling and momentary assessment research.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigate('/easyresearch/dashboard')}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/easyresearch/analytics')}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm hover:opacity-70 transition-opacity flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FileText size={14} />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:opacity-70 transition-opacity flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <HelpCircle size={14} />
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:opacity-70 transition-opacity flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Shield size={14} />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:opacity-70 transition-opacity flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Mail size={14} />
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                support@easyresearch.io
              </li>
              <li className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Available 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              &copy; 2025 EasierResearch. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ResearcherFooter;
