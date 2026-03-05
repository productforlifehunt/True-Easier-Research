import React, { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Copy, GripVertical, Edit2, Shield, ClipboardCheck, User, HelpCircle, X, Layers } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { QUESTION_TYPE_DEFINITIONS } from '../constants/questionTypes';
import QuestionEditor from './QuestionEditor';
import TemplateMarketplaceEmbed from './TemplateMarketplaceEmbed';
import type { QuestionnaireConfig } from './QuestionnaireList';

type ComponentType = 'consent' | 'screening' | 'profile' | 'help' | 'custom';

interface ComponentBuilderProps {
  questionnaires: QuestionnaireConfig[];
  participantTypes: { id: string; name: string }[];
  onUpdate: (questionnaires: QuestionnaireConfig[]) => void;
  project: any;
  projectId: string;
}

const COMPONENT_TYPES: { type: ComponentType; label: string; icon: React.ReactNode; desc: string; defaultTitle: string }[] = [
  { type: 'consent', label: 'Consent Form', icon: <Shield size={16} className="text-amber-500" />, desc: 'Informed consent agreements participants must accept', defaultTitle: 'Consent Form' },
  { type: 'screening', label: 'Screening', icon: <ClipboardCheck size={16} className="text-orange-500" />, desc: 'Eligibility screening questions with disqualification logic', defaultTitle: 'Screening Questions' },
  { type: 'profile', label: 'Profile', icon: <User size={16} className="text-blue-500" />, desc: 'Participant demographics, contact info, and baseline data', defaultTitle: 'Participant Profile' },
  { type: 'help', label: 'Help / FAQ', icon: <HelpCircle size={16} className="text-violet-500" />, desc: 'Help sections, FAQ, and support contact for participants', defaultTitle: 'Help & FAQ' },
  { type: 'custom', label: 'Custom', icon: <Plus size={16} className="text-emerald-500" />, desc: 'Create any custom component with your own name and fields', defaultTitle: 'Custom Component' },
];

const ComponentBuilder: React.FC<ComponentBuilderProps> = ({ questionnaires, participantTypes, onUpdate, project, projectId }) => {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<ComponentType>>(new Set());
  const [openComponentId, setOpenComponentId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const components = questionnaires.filter(q => ['consent', 'screening', 'profile', 'help', 'custom'].includes(q.questionnaire_type));

  const toggleSection = (type: ComponentType) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const addComponent = (type: ComponentType) => {
    const def = COMPONENT_TYPES.find(c => c.type === type)!;
    const existing = components.filter(c => c.questionnaire_type === type);
    const newQ: QuestionnaireConfig = {
      id: crypto.randomUUID(),
      questionnaire_type: type,
      title: existing.length > 0 ? `${def.defaultTitle} ${existing.length + 1}` : def.defaultTitle,
      description: '',
      questions: [],
      estimated_duration: 5,
      frequency: 'once',
      time_windows: [{ start: '09:00', end: '21:00' }],
      assigned_participant_types: participantTypes.map(pt => pt.id),
      order_index: questionnaires.length,
      notifications: [],
    };
    onUpdate([...questionnaires, newQ]);
    // Auto-expand section and open the new component
    setExpandedSections(prev => new Set(prev).add(type));
    setOpenComponentId(newQ.id);
  };

  const updateComponent = useCallback((id: string, updates: Partial<QuestionnaireConfig>) => {
    onUpdate(questionnaires.map(q => q.id === id ? { ...q, ...updates } : q));
  }, [questionnaires, onUpdate]);

  const removeComponent = (id: string) => {
    onUpdate(questionnaires.filter(q => q.id !== id));
    if (openComponentId === id) setOpenComponentId(null);
  };

  const duplicateComponent = (c: QuestionnaireConfig) => {
    const dup: QuestionnaireConfig = {
      ...c,
      id: crypto.randomUUID(),
      title: `${c.title} (Copy)`,
      questions: c.questions.map(q => ({ ...q, id: crypto.randomUUID(), options: q.options?.map((o: any) => ({ ...o, id: crypto.randomUUID() })) || [] })),
      order_index: questionnaires.length,
    };
    onUpdate([...questionnaires, dup]);
    setExpandedSections(prev => new Set(prev).add(c.questionnaire_type as ComponentType));
  };

  const addQuestion = (componentId: string, type: string) => {
    const def = QUESTION_TYPE_DEFINITIONS.find(d => d.type === type);
    if (!def) return;
    const comp = questionnaires.find(q => q.id === componentId);
    if (!comp) return;
    const newQ: any = {
      id: crypto.randomUUID(),
      question_type: type,
      question_text: 'Enter your question',
      question_description: '',
      question_config: { ...def.defaultConfig },
      validation_rule: {},
      ai_config: {},
      order_index: comp.questions.length,
      required: false,
      allow_voice: false,
      allow_ai_assist: false,
      options: def.requiresOptions ? [
        { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
        { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false },
      ] : [],
    };
    updateComponent(componentId, { questions: [...comp.questions, newQ] });
    setEditingQuestionId(newQ.id);
  };

  const updateQuestion = useCallback((componentId: string, questionId: string, updates: any) => {
    const comp = questionnaires.find(q => q.id === componentId);
    if (!comp) return;
    updateComponent(componentId, {
      questions: comp.questions.map(q => q.id === questionId ? { ...q, ...updates } : q),
    });
  }, [questionnaires, updateComponent]);

  const deleteQuestion = (componentId: string, questionId: string) => {
    const comp = questionnaires.find(q => q.id === componentId);
    if (!comp) return;
    updateComponent(componentId, {
      questions: comp.questions.filter(q => q.id !== questionId).map((q, i) => ({ ...q, order_index: i })),
    });
    if (editingQuestionId === questionId) setEditingQuestionId(null);
  };

  const handleQuestionDragEnd = (componentId: string, result: DropResult) => {
    if (!result.destination) return;
    const comp = questionnaires.find(q => q.id === componentId);
    if (!comp) return;
    const items = Array.from(comp.questions);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    items.forEach((q, i) => q.order_index = i);
    updateComponent(componentId, { questions: items });
  };

  const renderComponentEditor = (comp: QuestionnaireConfig) => {
    const isOpen = openComponentId === comp.id;
    return (
      <div key={comp.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Component header */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="flex-1 min-w-0">
            <input type="text" value={comp.title} onChange={(e) => updateComponent(comp.id, { title: e.target.value })}
              className="text-[13px] font-semibold text-stone-800 bg-transparent border border-transparent hover:border-stone-200 focus:border-emerald-400 focus:bg-white rounded-lg px-1.5 py-0.5 -ml-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-0 w-full transition-colors"
            />
            <span className="text-[11px] text-stone-400 ml-1">{comp.questions.length} field{comp.questions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => duplicateComponent(comp)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors" title="Duplicate">
              <Copy size={12} className="text-stone-400" />
            </button>
            <button onClick={() => removeComponent(comp.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
              <Trash2 size={12} className="text-red-400" />
            </button>
            <button onClick={() => setOpenComponentId(isOpen ? null : comp.id)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors" title={isOpen ? 'Collapse' : 'Expand'}>
              {isOpen ? <ChevronDown size={13} className="text-emerald-500" /> : <ChevronRight size={13} className="text-stone-400" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-stone-100">
            {/* Settings */}
            <div className="px-3 py-2.5 bg-stone-50/50 space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Description</label>
                <textarea value={comp.description || ''} onChange={(e) => updateComponent(comp.id, { description: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={2} placeholder="Optional description..." />
              </div>

              {/* Consent questionnaires use the unified logic builder — no special consent fields */}

              {participantTypes.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Assigned to</label>
                  <div className="flex flex-wrap gap-1">
                    {participantTypes.map(pt => {
                      const assigned = comp.assigned_participant_types.includes(pt.id);
                      return (
                        <button key={pt.id} onClick={() => {
                          const next = assigned
                            ? comp.assigned_participant_types.filter(id => id !== pt.id)
                            : [...comp.assigned_participant_types, pt.id];
                          updateComponent(comp.id, { assigned_participant_types: next });
                        }} className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors ${
                          assigned ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                        }`}>{pt.name}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="px-3 py-2.5 space-y-2">
              <h5 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Fields / Questions</h5>

              <DragDropContext onDragEnd={(result) => handleQuestionDragEnd(comp.id, result)}>
                <Droppable droppableId={`comp-questions-${comp.id}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-0 divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                      {comp.questions.length === 0 ? (
                        <p className="text-[12px] text-stone-400 italic py-4 text-center">No fields yet. Add below.</p>
                      ) : comp.questions.map((question, idx) => {
                        const isEditing = editingQuestionId === question.id;
                        return (
                          <Draggable key={question.id} draggableId={question.id} index={idx}>
                            {(dragProvided, dragSnapshot) => (
                              <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                                className={`transition-all ${dragSnapshot.isDragging ? 'shadow-lg bg-white ring-2 ring-emerald-200 rounded-lg' : ''}`}
                                style={dragProvided.draggableProps.style}>
                                <div className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-stone-50/50 transition-colors ${isEditing ? 'bg-emerald-50/30' : ''}`}
                                  onClick={() => setEditingQuestionId(isEditing ? null : question.id)}>
                                  <GripVertical size={11} className="text-stone-300 shrink-0 cursor-grab active:cursor-grabbing" />
                                  <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full shrink-0">F{idx + 1}</span>
                                  {(question.response_required === 'force' || (!question.response_required && question.required)) && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 shrink-0">Req</span>}
                                  <span className="text-[9px] uppercase font-bold text-stone-300 shrink-0">{question.question_type?.replace(/_/g, ' ')}</span>
                                  <span className="text-[12px] text-stone-700 truncate flex-1 min-w-0">{question.question_text}</span>
                                  <button onClick={(e) => { e.stopPropagation(); deleteQuestion(comp.id, question.id); }}
                                    className="p-1 rounded-lg hover:bg-red-50 transition-colors text-red-400 shrink-0" title="Delete">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                {isEditing && (
                                  <div className="px-3 pb-3 pt-1 bg-stone-50/50 border-t border-stone-100">
                                    <QuestionEditor
                                      question={question}
                                      project={project}
                                      questionnaireType={comp.questionnaire_type}
                                      onUpdateQuestion={(questionId, updates) => updateQuestion(comp.id, questionId, updates)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <select onChange={(e) => { if (e.target.value) addQuestion(comp.id, e.target.value); e.target.value = ''; }}
                defaultValue=""
                className="w-full py-1.5 px-2.5 border border-dashed border-stone-300 rounded-xl text-[12px] text-stone-500 hover:border-emerald-400 transition-colors bg-white appearance-none cursor-pointer">
                <option value="" disabled>+ Add Field...</option>
                {(['text', 'choice', 'scale', 'data', 'layout'] as const).map(cat => (
                  <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                    {QUESTION_TYPE_DEFINITIONS.filter(d => d.category === cat).map(def => (
                      <option key={def.type} value={def.type}>{def.icon} {def.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showTemplates) {
    return (
      <TemplateMarketplaceEmbed
        mode="browse"
        projectId={projectId}
        onAddTemplate={(questions, title) => {
          // Create a new custom component with these questions
          const newQ: QuestionnaireConfig = {
            id: crypto.randomUUID(),
            questionnaire_type: 'custom',
            title: title || 'Imported Template',
            description: '',
            questions,
            estimated_duration: 5,
            frequency: 'once',
            time_windows: [{ start: '09:00', end: '21:00' }],
            assigned_participant_types: participantTypes.map(pt => pt.id),
            order_index: questionnaires.length,
            notifications: [],
          };
          onUpdate([...questionnaires, newQ]);
          setShowTemplates(false);
        }}
        onClose={() => setShowTemplates(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-stone-800">Components</h3>
          <p className="text-[12px] text-stone-400 mt-0.5">Build consent forms, screening, profiles, and help — all using the unified questionnaire system</p>
        </div>
        <button onClick={() => setShowTemplates(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-violet-600 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors">
          <Layers size={13} /> From Templates
        </button>
      </div>

      {/* Each type is a section with its instances inline */}
      <div className="space-y-3">
        {COMPONENT_TYPES.map(ct => {
          const instances = components.filter(c => c.questionnaire_type === ct.type);
          const isExpanded = expandedSections.has(ct.type);

          return (
            <div key={ct.type} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Section header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors"
                onClick={() => instances.length > 0 ? toggleSection(ct.type) : addComponent(ct.type)}
              >
                <div className="w-9 h-9 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                  {ct.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-stone-800">{ct.label}</span>
                    {instances.length > 0 && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">{instances.length}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">{ct.desc}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); addComponent(ct.type); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    title={`Add ${ct.label}`}
                  >
                    <Plus size={12} /> Add
                  </button>
                  {instances.length > 0 && (
                    isExpanded ? <ChevronDown size={14} className="text-stone-400 ml-1" /> : <ChevronRight size={14} className="text-stone-400 ml-1" />
                  )}
                </div>
              </div>

              {/* Instances — shown inline when section expanded */}
              {isExpanded && instances.length > 0 && (
                <div className="border-t border-stone-100 px-3 py-2.5 space-y-2 bg-stone-50/30">
                  {instances.map(comp => renderComponentEditor(comp))}
                </div>
              )}

              {/* Empty hint when expanded but no instances */}
              {isExpanded && instances.length === 0 && (
                <div className="border-t border-stone-100 px-4 py-4 text-center">
                  <p className="text-[12px] text-stone-400">No {ct.label.toLowerCase()} components yet. Click "Add" to create one.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComponentBuilder;
