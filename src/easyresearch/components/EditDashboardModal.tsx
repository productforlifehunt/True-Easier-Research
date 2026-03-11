import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, GripVertical, RotateCcw, Eye, EyeOff, BarChart3, Users, Plus } from 'lucide-react';
import IOSToggle from '../../components/ui/IOSToggle';
import type { DashboardConfig, DashboardTab, UserRoles } from '../hooks/useDashboardConfig';
import { useI18n } from '../hooks/useI18n';

interface Props {
  open: boolean;
  onClose: () => void;
  config: DashboardConfig;
  roles: UserRoles;
  onToggleTab: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggleNewStudy: () => void;
  onUpdateRoles: (updates: Partial<UserRoles>) => void;
  onReset: () => void;
}

const TAB_LABEL_MAP: Record<string, string> = {
  all: 'dashboard.allStudies',
  drafts: 'dashboard.myDrafts',
  published: 'dashboard.myPublished',
  joined: 'dashboard.myJoined',
};

const EditDashboardModal: React.FC<Props> = ({
  open, onClose, config, roles,
  onToggleTab, onReorder, onToggleNewStudy, onUpdateRoles, onReset,
}) => {
  const { t } = useI18n();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  if (!open) return null;

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    dragOverIdx.current = idx;
  };
  const handleDrop = () => {
    if (dragIdx !== null && dragOverIdx.current !== null && dragIdx !== dragOverIdx.current) {
      onReorder(dragIdx, dragOverIdx.current);
    }
    setDragIdx(null);
    dragOverIdx.current = null;
  };

  const visibleCount = config.tabs.filter(t => t.visible).length;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl max-h-[80vh] overflow-y-auto"
        style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100">
          <h2 className="text-[15px] font-bold text-stone-800">{t('editDashboard.title')}</h2>
          <div className="flex items-center gap-1.5">
            <button onClick={onReset}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
              title={t('editDashboard.reset')}>
              <RotateCcw size={15} />
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Role toggles */}
        <div className="px-5 pt-4 pb-3">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">{t('editDashboard.myRoles')}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                  <BarChart3 size={12} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-stone-700">{t('role.researcher')}</p>
                  <p className="text-[10px] text-stone-400">{t('editDashboard.researcherDesc')}</p>
                </div>
              </div>
              <IOSToggle checked={roles.isResearcher} onChange={(v) => onUpdateRoles({ isResearcher: v })} />
            </div>
            <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                  <Users size={12} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-stone-700">{t('dashboard.participant')}</p>
                  <p className="text-[10px] text-stone-400">{t('editDashboard.participantDesc')}</p>
                </div>
              </div>
              <IOSToggle checked={roles.isParticipant} onChange={(v) => onUpdateRoles({ isParticipant: v })} />
            </div>
          </div>
        </div>

        {/* Tab ordering */}
        <div className="px-5 pb-3">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">{t('editDashboard.tabsOrder')}</p>
          <p className="text-[10px] text-stone-400 mb-2">{t('editDashboard.tabsOrderDesc')}</p>
          <div className="space-y-1">
            {config.tabs.map((tab, idx) => (
              <div
                key={tab.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={() => setDragIdx(null)}
                className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2 transition-all ${
                  dragIdx === idx ? 'border-emerald-300 shadow-md scale-[1.02]' : 'border-stone-100'
                } ${!tab.visible ? 'opacity-50' : ''}`}
              >
                <GripVertical size={14} className="text-stone-300 cursor-grab active:cursor-grabbing shrink-0" />
                <span className="flex-1 text-[12px] font-medium text-stone-700">{TAB_LABEL_MAP[tab.id] ? t(TAB_LABEL_MAP[tab.id]) : tab.label}</span>
                <button
                  onClick={() => {
                    if (tab.visible && visibleCount <= 1) return;
                    onToggleTab(tab.id);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    tab.visible ? 'text-emerald-500 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {tab.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Study button toggle */}
        <div className="px-5 pb-5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">{t('editDashboard.quickActions')}</p>
          <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                <Plus size={12} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-stone-700">{t('editDashboard.newStudyButton')}</p>
                <p className="text-[10px] text-stone-400">{t('editDashboard.showOnDashboard')}</p>
              </div>
            </div>
            <IOSToggle checked={config.showNewStudyButton} onChange={onToggleNewStudy} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditDashboardModal;
