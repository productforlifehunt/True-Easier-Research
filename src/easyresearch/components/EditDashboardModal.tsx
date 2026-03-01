import React, { useState, useRef } from 'react';
import { X, GripVertical, RotateCcw, Eye, EyeOff, FlaskConical, Users, Plus } from 'lucide-react';
import IOSToggle from '../../components/ui/IOSToggle';
import type { DashboardConfig, DashboardTab, UserRoles } from '../hooks/useDashboardConfig';

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

const EditDashboardModal: React.FC<Props> = ({
  open, onClose, config, roles,
  onToggleTab, onReorder, onToggleNewStudy, onUpdateRoles, onReset,
}) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);
  const touchStart = useRef<{ idx: number; y: number } | null>(null);

  if (!open) return null;

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

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

  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    touchStart.current = { idx, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (idx: number) => {
    if (touchStart.current && touchStart.current.idx !== idx) {
      onReorder(touchStart.current.idx, idx);
    }
    touchStart.current = null;
  };

  const visibleCount = config.tabs.filter(t => t.visible).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.12)' }}>
        
        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="text-[16px] font-bold text-stone-800">Edit Dashboard</h2>
          <div className="flex items-center gap-2">
            <button onClick={onReset}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
              title="Reset to defaults">
              <RotateCcw size={16} />
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Role toggles */}
        <div className="px-5 pb-4">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">My Roles</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FlaskConical size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-stone-700">Researcher</p>
                  <p className="text-[11px] text-stone-400">Create & manage studies</p>
                </div>
              </div>
              <IOSToggle checked={roles.isResearcher} onChange={(v) => onUpdateRoles({ isResearcher: v })} />
            </div>
            <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users size={14} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-stone-700">Participant</p>
                  <p className="text-[11px] text-stone-400">Join & complete studies</p>
                </div>
              </div>
              <IOSToggle checked={roles.isParticipant} onChange={(v) => onUpdateRoles({ isParticipant: v })} />
            </div>
          </div>
        </div>

        {/* Tab ordering */}
        <div className="px-5 pb-4">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">Tabs &amp; Order</p>
          <p className="text-[11px] text-stone-400 mb-3">Drag to reorder · toggle to show/hide</p>
          <div className="space-y-1.5">
            {config.tabs.map((tab, idx) => (
              <div
                key={tab.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={() => setDragIdx(null)}
                onTouchStart={(e) => handleTouchStart(idx, e)}
                onTouchEnd={() => handleTouchEnd(idx)}
                className={`flex items-center gap-2.5 bg-white border rounded-xl px-3 py-2.5 transition-all ${
                  dragIdx === idx ? 'border-emerald-300 shadow-md scale-[1.02]' : 'border-stone-100'
                } ${!tab.visible ? 'opacity-50' : ''}`}
              >
                <GripVertical size={16} className="text-stone-300 cursor-grab active:cursor-grabbing shrink-0" />
                <span className="flex-1 text-[13px] font-medium text-stone-700">{tab.label}</span>
                <button
                  onClick={() => {
                    // Prevent hiding all tabs
                    if (tab.visible && visibleCount <= 1) return;
                    onToggleTab(tab.id);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    tab.visible ? 'text-emerald-500 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {tab.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Study button toggle */}
        <div className="px-5 pb-6">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">Quick Actions</p>
          <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Plus size={14} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-stone-700">+ New Study Button</p>
                <p className="text-[11px] text-stone-400">Show on dashboard header</p>
              </div>
            </div>
            <IOSToggle checked={config.showNewStudyButton} onChange={onToggleNewStudy} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDashboardModal;
