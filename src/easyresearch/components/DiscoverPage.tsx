import React, { useState } from 'react';
import { Search, Users, BookTemplate } from 'lucide-react';
import ParticipantJoin from './ParticipantJoin';
import ParticipantLibrary from './ParticipantLibrary';
import ResearchTemplatesLibrary from './ResearchTemplatesLibrary';
import { useI18n } from '../hooks/useI18n';

type DiscoverTab = 'studies' | 'participants' | 'templates';

const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiscoverTab>('studies');
  const { t } = useI18n();

  const tabs: { id: DiscoverTab; label: string; icon: React.ElementType }[] = [
    { id: 'studies', label: t('discover.studies'), icon: Search },
    { id: 'participants', label: t('discover.participants'), icon: Users },
    { id: 'templates', label: t('discover.templates'), icon: BookTemplate },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-stone-100 p-1 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'studies' && <ParticipantJoin />}
      {activeTab === 'participants' && <ParticipantLibrary />}
      {activeTab === 'templates' && <ResearchTemplatesLibrary projectId="" />}
    </div>
  );
};

export default DiscoverPage;
