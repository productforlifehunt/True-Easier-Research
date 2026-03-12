import React, { useState } from 'react';
import { X, Globe, Lock, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { saveProjectAsTemplate, saveQuestionnaireAsTemplate } from '../services/templateService';
import { bToast } from '../utils/bilingualToast';

interface Props {
  projectId: string;
  questionnaires: Array<{
    id: string;
    title: string;
    questionnaire_type: string;
    questions: any[];
  }>;
  projectTitle: string;
  onClose: () => void;
}

const SaveTemplateModal: React.FC<Props> = ({ projectId, questionnaires, projectTitle, onClose }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(projectTitle || '');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedQId, setSelectedQId] = useState<string>('all');
  const [category, setCategory] = useState('custom');
  const [saving, setSaving] = useState(false);

  const surveyQuestionnaires = questionnaires.filter(q => q.questionnaire_type === 'survey');

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    try {
      const opts = {
        title: title.trim(),
        description: description.trim(),
        isPublic,
        category,
      };

      let result: { templateId: string } | { error: string };

      if (selectedQId === 'all') {
        // Save entire project as template
        result = await saveProjectAsTemplate(projectId, user.id, opts);
      } else {
        // Save single questionnaire as template
        result = await saveQuestionnaireAsTemplate(selectedQId, projectId, user.id, opts);
      }

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Template saved!');
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-[15px] font-semibold text-stone-800">Save as Template</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-50"><X size={16} className="text-stone-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Template Name</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="My Template" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" placeholder="What this template is for..." />
          </div>

          {surveyQuestionnaires.length > 1 && (
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">What to Save</label>
              <select value={selectedQId} onChange={e => setSelectedQId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="all">Entire Project ({surveyQuestionnaires.length} questionnaires)</option>
                {surveyQuestionnaires.map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.questions.length} questions)</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="custom">Custom</option>
              <option value="academic">Academic</option>
              <option value="healthcare">Healthcare</option>
              <option value="ux">UX</option>
              <option value="customer">Customer</option>
              <option value="hr">HR</option>
              <option value="market">Market</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-stone-800">Make Public</p>
              <p className="text-[11px] text-stone-400">Allow other researchers to find and use this template</p>
            </div>
            <button onClick={() => setIsPublic(!isPublic)}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${isPublic ? 'bg-emerald-500' : 'bg-stone-200'}`}>
              <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: isPublic ? '22px' : '2px' }} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-400 bg-stone-50 rounded-xl p-3">
            {isPublic ? <Globe size={14} className="text-emerald-500 shrink-0" /> : <Lock size={14} className="text-stone-400 shrink-0" />}
            <span>{isPublic ? 'This template will be visible to all researchers' : 'Only you can see and use this template'}</span>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-stone-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-medium text-stone-500 hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg disabled:opacity-50 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
