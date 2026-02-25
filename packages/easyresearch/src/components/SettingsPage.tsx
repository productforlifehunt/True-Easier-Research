import React from 'react';
import EasierResearchLayout from './EasierResearchLayout';
import { Settings, Bell, Lock, CreditCard, Users } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <EasierResearchLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>

          <div className="space-y-6">
            {/* Organization Settings */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Users style={{ color: 'var(--color-green)' }} size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Organization
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                Manage your organization settings and team members.
              </p>
              <button
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Manage Organization
              </button>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Bell style={{ color: 'var(--color-green)' }} size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                Configure notification preferences for surveys and responses.
              </p>
              <button
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Configure Notifications
              </button>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Lock style={{ color: 'var(--color-green)' }} size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Security & Privacy
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                Manage security settings and data privacy options.
              </p>
              <button
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Security Settings
              </button>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard style={{ color: 'var(--color-green)' }} size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Billing & Subscription
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                View and manage your subscription and billing information.
              </p>
              <button
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </EasierResearchLayout>
  );
};

export default SettingsPage;
