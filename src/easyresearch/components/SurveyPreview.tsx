import React, { useState } from 'react';
import type { AppLayout } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import AppPhonePreview from './AppPhonePreview';
import { DEVICE_PRESETS, DEFAULT_DEVICE, type DevicePreset } from '../constants/devicePresets';
import BrandIcon from './BrandIcon';
import { useI18n } from '../hooks/useI18n';

// Survey Preview — uses the EXACT same shared components as the real participant app
// 调查预览 — 使用与真实参与者应用完全相同的共享组件
// NO mock rendering, NO fallback — if no layout exists, prompt the user to create one

interface SurveyPreviewProps {
  questions: any[];
  projectTitle: string;
  projectDescription: string;
  appLayout?: AppLayout;
  questionnaires?: QuestionnaireConfig[];
  participantTypes?: ParticipantType[];
  studyDuration?: number;
  onUpdateQuestionnaire?: (id: string, updates: Partial<QuestionnaireConfig>) => void;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  questions, projectTitle, projectDescription,
  appLayout, questionnaires, participantTypes, studyDuration = 7, onUpdateQuestionnaire,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEFAULT_DEVICE);
  const [filterParticipantTypeId, setFilterParticipantTypeId] = useState<string | null>(null);

  // Must have a layout with tabs to render the real preview
  // 必须有布局和标签页才能渲染真实预览
  if (!appLayout || appLayout.tabs.length === 0 || !questionnaires) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-700">No Layout Configured</h3>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Go to the <strong>Layout</strong> tab to design your participant app. 
          The preview uses the exact same components as the real participant experience.
        </p>
        <p className="text-xs text-stone-400">
          请先在"布局"标签页中设计参与者应用。预览使用与实际参与者体验完全相同的组件。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">App Preview</h2>
        <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 flex-wrap">
          {DEVICE_PRESETS.map(d => (
            <button key={d.id} onClick={() => setSelectedDevice(d)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${selectedDevice.id === d.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
              <BrandIcon brand={d.brand} size={12} />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Participant type filter / 参与者类型筛选 */}
      {participantTypes && participantTypes.length > 0 && (
        <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 justify-center flex-wrap">
          <button onClick={() => setFilterParticipantTypeId(null)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${!filterParticipantTypeId ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
            All Roles
          </button>
          {participantTypes.map(pt => (
            <button key={pt.id} onClick={() => setFilterParticipantTypeId(pt.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${filterParticipantTypeId === pt.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
              {pt.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-stone-400 text-center">{selectedDevice.label} — {selectedDevice.width}×{selectedDevice.height}</p>

      {/* Phone preview — uses the EXACT same shared components as ParticipantAppView */}
      {/* 手机预览 — 使用与 ParticipantAppView 完全相同的共享组件 */}
      <div className="bg-stone-100 rounded-2xl p-6 lg:p-10 flex justify-center">
        <AppPhonePreview
          layout={appLayout}
          questionnaires={questionnaires}
          participantTypes={participantTypes}
          studyDuration={studyDuration}
          frameWidth={selectedDevice.width}
          frameHeight={selectedDevice.height}
          filterParticipantTypeId={filterParticipantTypeId}
          projectTitle={projectTitle}
        />
      </div>

      {/* Display settings for questionnaire pagination */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-stone-800 mb-1">Display Settings</h3>
        {onUpdateQuestionnaire && questionnaires.filter(q => q.questionnaire_type === 'survey').length > 0 ? (
          <div className="space-y-3">
            {questionnaires.filter(q => q.questionnaire_type === 'survey').map(q => (
              <div key={q.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-stone-700">{q.title}</span>
                  <span className="text-[10px] text-stone-400">{q.questions?.length || 0} questions</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Questions/Page</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" min={1} max={50}
                        value={q.questions_per_page ?? ''}
                        placeholder="∞"
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          onUpdateQuestionnaire(q.id, { questions_per_page: val });
                        }}
                        className="w-16 px-2 py-1 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="text-[10px] text-stone-400">{q.questions_per_page ? 'paginated' : 'all at once'}</span>
                    </div>
                  </div>
                </div>
                {/* Per-tab overrides */}
                {q.tab_sections && q.tab_sections.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Tab Overrides</label>
                    {q.tab_sections.map(section => (
                      <div key={section.id} className="flex items-center gap-2 text-[11px]">
                        <span className="text-stone-600 flex-1 truncate">{section.label}</span>
                        <input
                          type="number" min={1} max={50}
                          value={section.questions_per_page ?? ''}
                          placeholder={q.questions_per_page ? String(q.questions_per_page) : '∞'}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value) : null;
                            const updatedSections = q.tab_sections!.map(s =>
                              s.id === section.id ? { ...s, questions_per_page: val } : s
                            );
                            onUpdateQuestionnaire(q.id, { tab_sections: updatedSections });
                          }}
                          className="w-14 px-2 py-1 rounded-lg text-[11px] border border-stone-200"
                        />
                        <span className="text-[9px] text-stone-400">/pg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-stone-400 font-light">
            This preview renders exactly what participants will see. Use the role filter to see what each participant type sees.
          </p>
        )}
      </div>
    </div>
  );
};

export default SurveyPreview;