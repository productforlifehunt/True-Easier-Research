import React from 'react';
import { ArrowLeft, Phone, Mail, MessageCircle, Book, ExternalLink } from 'lucide-react';

interface HelpProps {
  onBack: () => void;
}

const Help: React.FC<HelpProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              Back
            </button>
            <h1 className="text-2xl font-light text-gray-900">Help & Support</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick Help */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Quick Help</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', width: 'clamp(2.5rem, 6vw, 3rem)', height: 'clamp(2.5rem, 6vw, 3rem)' }}>
                <Book className="text-white" style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Getting Started</h3>
                <p className="text-gray-600 text-sm">Learn how to track your daily caregiving activities and experiences.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', width: 'clamp(2.5rem, 6vw, 3rem)', height: 'clamp(2.5rem, 6vw, 3rem)' }}>
                <MessageCircle className="text-white" style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Support Community</h3>
                <p className="text-gray-600 text-sm">Connect with other caregivers and share experiences.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How do I add a new care log entry?</h3>
              <p className="text-gray-600">Click the "Add Entry" button in the top right corner of your dashboard. Select the type of entry (activity, need, or struggle) and fill out the details.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I edit or delete my entries?</h3>
              <p className="text-gray-600">Yes, you can edit or delete any entry by clicking the edit or delete icons on each entry card.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How is my data used?</h3>
              <p className="text-gray-600">Your data is used anonymously for research purposes to help improve dementia care support. Your personal information is never shared.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I change my language preference?</h3>
              <p className="text-gray-600">Yes, use the language toggle button in the header to switch between English and Chinese.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Contact Support</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', width: 'clamp(3rem, 8vw, 4rem)', height: 'clamp(3rem, 8vw, 4rem)' }}>
                <Phone className="text-white" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm">Mon-Fri 9AM-5PM</p>
              <p className="text-sm mt-2" style={{ color: 'var(--primary)' }}>1-800-CARE-HELP</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', width: 'clamp(3rem, 8vw, 4rem)', height: 'clamp(3rem, 8vw, 4rem)' }}>
                <Mail className="text-white" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm">We respond within 24 hours</p>
              <p className="text-sm mt-2" style={{ color: 'var(--primary)' }}>support@careconnector.com</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', width: 'clamp(3rem, 8vw, 4rem)', height: 'clamp(3rem, 8vw, 4rem)' }}>
                <ExternalLink className="text-white" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Online Resources</h3>
              <p className="text-gray-600 text-sm">Additional guides and resources</p>
              <button className="text-sm mt-2 hover:underline" style={{ color: 'var(--primary)' }}>
                Visit Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
