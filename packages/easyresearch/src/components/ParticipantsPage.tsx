import React from 'react';
import EasierResearchLayout from './EasierResearchLayout';
import { Users, UserPlus, Search } from 'lucide-react';

const ParticipantsPage: React.FC = () => {
  return (
    <EasierResearchLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Participants
            </h1>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <UserPlus size={20} />
              Invite Participants
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid var(--border-light)' }}>
            <Users className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Participants Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Create a survey and invite participants to get started.
            </p>
          </div>
        </div>
      </div>
    </EasierResearchLayout>
  );
};

export default ParticipantsPage;
