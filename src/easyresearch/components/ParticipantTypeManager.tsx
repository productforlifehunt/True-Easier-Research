import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Users, Shield, ClipboardCheck, X, Hash } from 'lucide-react';

export interface ConsentForm {
  id: string;
  title: string;
  text: string;
  url?: string;
  required: boolean;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'text' | 'select';
  options?: string[];
  required: boolean;
  disqualify_value?: string;
}

export interface ParticipantType {
  id: string;
  project_id?: string;
  name: string;
  description: string;
  relations: string[]; // e.g. ['Primary Caregiver', 'Spouse', 'Child']
  consent_forms: ConsentForm[];
  screening_questions: ScreeningQuestion[];
  color: string;
  order_index: number;
  numbering_enabled: boolean;
  number_prefix: string; // e.g. 'CG' for Caregiver → CG001, CG002...
}

interface QuestionnaireRef {
  id: string;
  title: string;
  questionnaire_type: 'survey' | 'consent' | 'screening' | 'profile' | 'help' | 'custom';
  assigned_participant_types: string[];
}

interface ParticipantTypeManagerProps {
  participantTypes: ParticipantType[];
  onUpdate: (types: ParticipantType[]) => void;
  questionnaires?: QuestionnaireRef[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

const ParticipantTypeManager: React.FC<ParticipantTypeManagerProps> = ({ participantTypes, onUpdate, questionnaires = [] }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const addType = () => {
    const num = participantTypes.length + 1;
    const newType: ParticipantType = {
      id: crypto.randomUUID(),
      name: `Participant Type ${num}`,
      description: '',
      relations: [],
      consent_forms: [],
      screening_questions: [],
      color: COLORS[(num - 1) % COLORS.length],
      order_index: participantTypes.length,
      numbering_enabled: true,
      number_prefix: `P${num}`,
    };
    onUpdate([...participantTypes, newType]);
    setExpandedId(newType.id);
  };

  const updateType = (id: string, updates: Partial<ParticipantType>) => {
    onUpdate(participantTypes.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeType = (id: string) => {
    onUpdate(participantTypes.filter(t => t.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const Toggle = ({ enabled, onChange, label, desc }: { enabled: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between py-2">
      <div><p className="text-[12px] font-medium text-stone-700">{label}</p><p className="text-[11px] text-stone-400">{desc}</p></div>
      <button onClick={() => onChange(!enabled)} className={`relative w-9 h-[18px] rounded-full transition-colors shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
        <span className="absolute top-[1px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: enabled ? '20px' : '1px' }} />
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-semibold text-stone-800">Participant Types</h3>
          <p className="text-[12px] text-stone-400 font-light mt-0.5">
            Define different types of participants, each with their own consent, screening, and relations
          </p>
        </div>
        <button
          onClick={addType}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:shadow-lg hover:shadow-violet-200/50 transition-all"
        >
          <Plus size={14} /> Add Type
        </button>
      </div>

      {participantTypes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-stone-300" />
          </div>
          <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Participant Types</h2>
          <p className="text-[13px] text-stone-400 font-light">
            E.g., "Primary Caregiver" gets hourly + daily logs, "Family Member" gets daily only
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {participantTypes.map((pt, idx) => {
            const isExpanded = expandedId === pt.id;
            return (
              <div key={pt.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : pt.id)}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pt.color }} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-stone-800 truncate">{pt.name}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      {pt.relations.length > 0 && (
                        <span className="text-[11px] text-stone-400">{pt.relations.length} relations</span>
                      )}
                      {questionnaires.filter(q => q.questionnaire_type === 'consent' && q.assigned_participant_types.includes(pt.id)).length > 0 && (
                        <span className="text-[11px] text-amber-500 flex items-center gap-0.5">
                          <Shield size={10} /> {questionnaires.filter(q => q.questionnaire_type === 'consent' && q.assigned_participant_types.includes(pt.id)).length} consent
                        </span>
                      )}
                      {questionnaires.filter(q => q.questionnaire_type === 'screening' && q.assigned_participant_types.includes(pt.id)).length > 0 && (
                        <span className="text-[11px] text-orange-500 flex items-center gap-0.5">
                          <ClipboardCheck size={10} /> {questionnaires.filter(q => q.questionnaire_type === 'screening' && q.assigned_participant_types.includes(pt.id)).length} screening
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeType(pt.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                    {isExpanded ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-stone-100 px-4 py-4 space-y-4 bg-stone-50/30">
                    {/* Basic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-medium text-stone-400 mb-1">Type Name</label>
                        <input
                          type="text"
                          value={pt.name}
                          onChange={(e) => updateType(pt.id, { name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="E.g., Primary Caregiver"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-stone-400 mb-1">Color</label>
                        <div className="flex gap-1.5">
                          {COLORS.map(c => (
                            <button
                              key={c}
                              onClick={() => updateType(pt.id, { color: c })}
                              className={`w-7 h-7 rounded-full transition-transform ${pt.color === c ? 'ring-2 ring-offset-2 ring-stone-400 scale-110' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-stone-400 mb-1">Description</label>
                      <textarea
                        value={pt.description}
                        onChange={(e) => updateType(pt.id, { description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        rows={2}
                        placeholder="Description of this participant type..."
                      />
                    </div>

                    {/* Auto-Numbering */}
                    <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                      <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Hash size={12} /> Auto-Numbering
                      </h5>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-[12px] font-medium text-stone-700">Auto-Number Participants</p>
                          <p className="text-[11px] text-stone-400">Assign sequential IDs when participants enroll (e.g., {pt.number_prefix || 'P1'}001)</p>
                        </div>
                        <button
                          onClick={() => updateType(pt.id, { numbering_enabled: !pt.numbering_enabled })}
                          className={`relative w-9 h-[18px] rounded-full transition-colors shrink-0 ${pt.numbering_enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}
                        >
                          <span className="absolute top-[1px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: pt.numbering_enabled ? '20px' : '1px' }} />
                        </button>
                      </div>
                      {pt.numbering_enabled && (
                        <div className="pl-3 border-l-2 border-indigo-200">
                          <label className="block text-[11px] font-medium text-stone-400 mb-1">Number Prefix</label>
                          <input
                            type="text"
                            value={pt.number_prefix || ''}
                            onChange={(e) => updateType(pt.id, { number_prefix: e.target.value })}
                            className="w-32 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="e.g. CG"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">Preview: {pt.number_prefix || 'P1'}001, {pt.number_prefix || 'P1'}002, ...</p>
                        </div>
                      )}
                    </div>

                    {/* Relations */}
                    <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                      <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Relations</h5>
                      <p className="text-[11px] text-stone-400">Define relationship options participants can choose</p>
                      {pt.relations.map((rel, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={rel}
                            onChange={(e) => {
                              const newRels = [...pt.relations];
                              newRels[rIdx] = e.target.value;
                              updateType(pt.id, { relations: newRels });
                            }}
                            className="flex-1 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200"
                          />
                          <button onClick={() => updateType(pt.id, { relations: pt.relations.filter((_, i) => i !== rIdx) })} className="p-0.5 hover:bg-red-50 rounded">
                            <X size={10} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => updateType(pt.id, { relations: [...pt.relations, ''] })}
                        className="text-[11px] text-violet-500 hover:text-violet-600 font-medium"
                      >
                        + Add Relation
                      </button>
                    </div>

                    {/* Consent Forms — synced from questionnaire table */}
                    <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                      <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Shield size={12} /> Consent Forms
                      </h5>
                      {(() => {
                        const assigned = questionnaires.filter(q => q.questionnaire_type === 'consent' && q.assigned_participant_types.includes(pt.id));
                        const unassigned = questionnaires.filter(q => q.questionnaire_type === 'consent' && !q.assigned_participant_types.includes(pt.id));
                        return (
                          <>
                            {assigned.length === 0 && <p className="text-[11px] text-stone-400 italic">No consent forms assigned to this type.</p>}
                            {assigned.map(q => (
                              <div key={q.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                                <Shield size={11} className="text-emerald-500 shrink-0" />
                                <span className="text-[12px] text-stone-700 flex-1 truncate">{q.title}</span>
                                <span className="text-[10px] text-emerald-500 font-medium">Assigned</span>
                              </div>
                            ))}
                            {unassigned.length > 0 && (
                              <p className="text-[10px] text-stone-400 mt-1">{unassigned.length} other consent form{unassigned.length > 1 ? 's' : ''} exist but not assigned to this type</p>
                            )}
                            <p className="text-[10px] text-stone-400">Manage consent forms in the Questionnaires tab. Assign them via "Assigned Types" in questionnaire settings.</p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Screening — synced from questionnaire table */}
                    <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                      <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardCheck size={12} /> Screening Questionnaires
                      </h5>
                      {(() => {
                        const assigned = questionnaires.filter(q => q.questionnaire_type === 'screening' && q.assigned_participant_types.includes(pt.id));
                        const unassigned = questionnaires.filter(q => q.questionnaire_type === 'screening' && !q.assigned_participant_types.includes(pt.id));
                        return (
                          <>
                            {assigned.length === 0 && <p className="text-[11px] text-stone-400 italic">No screening questionnaires assigned to this type.</p>}
                            {assigned.map(q => (
                              <div key={q.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                                <ClipboardCheck size={11} className="text-amber-500 shrink-0" />
                                <span className="text-[12px] text-stone-700 flex-1 truncate">{q.title}</span>
                                <span className="text-[10px] text-amber-500 font-medium">Assigned</span>
                              </div>
                            ))}
                            {unassigned.length > 0 && (
                              <p className="text-[10px] text-stone-400 mt-1">{unassigned.length} other screening set{unassigned.length > 1 ? 's' : ''} exist but not assigned to this type</p>
                            )}
                            <p className="text-[10px] text-stone-400">Manage screening in the Questionnaires tab. Assign them via "Assigned Types" in questionnaire settings.</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipantTypeManager;
