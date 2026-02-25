import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, GitBranch, Save, Loader2, CheckCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import toast from 'react-hot-toast';

interface LogicRule {
  id: string;
  questionId: string;
  condition: string;
  value: string;
  action: 'skip' | 'show' | 'hide';
  targetQuestionId: string;
}

interface SurveyLogicProps {
  questions: any[];
  projectId?: string;
  existingRules?: LogicRule[];
  onUpdateLogic: (rules: LogicRule[]) => void | Promise<void>;
}

const SurveyLogic: React.FC<SurveyLogicProps> = ({ questions, projectId, existingRules, onUpdateLogic }) => {
  const [rules, setRules] = useState<LogicRule[]>(existingRules || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (existingRules) setRules(existingRules); }, [existingRules]);

  const addRule = () => {
    setRules([...rules, { id: `rule_${Date.now()}`, questionId: questions[0]?.id || '', condition: 'equals', value: '', action: 'skip', targetQuestionId: questions[1]?.id || '' }]);
  };

  const updateRule = (index: number, field: keyof LogicRule, value: any) => {
    const updated = [...rules]; updated[index] = { ...updated[index], [field]: value }; setRules(updated); setSaved(false);
  };

  const deleteRule = (index: number) => { setRules(rules.filter((_, i) => i !== index)); setSaved(false); };

  const saveRules = async () => {
    setSaving(true);
    try { await onUpdateLogic(rules); setSaved(true); toast.success('Logic rules saved!'); setTimeout(() => setSaved(false), 2000); }
    catch { toast.error('Failed to save logic rules'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">Logic</h2>
          <p className="text-[13px] text-stone-400 mt-0.5 font-light">Skip, show, or hide questions based on responses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRule} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200">
            <Plus size={14} /> Add Rule
          </button>
          {rules.length > 0 && (
            <button onClick={saveRules} disabled={saving || saved}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                saved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
              } disabled:opacity-50`}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <GitBranch className="text-emerald-500" size={24} />
          </div>
          <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">No logic rules</h3>
          <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">Create conditional logic to personalize the survey flow.</p>
          <button onClick={addRule} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200">
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={rule.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">IF Question</label>
                    <CustomDropdown options={questions.map(q => ({ value: q.id, label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 25)}...` }))} value={rule.questionId} onChange={(v) => updateRule(index, 'questionId', v)} placeholder="Select question" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Condition</label>
                    <CustomDropdown options={[{value:'equals',label:'Equals'},{value:'not_equals',label:'Not Equals'},{value:'contains',label:'Contains'},{value:'greater_than',label:'Greater Than'},{value:'less_than',label:'Less Than'},{value:'is_empty',label:'Is Empty'},{value:'is_not_empty',label:'Is Not Empty'}]} value={rule.condition} onChange={(v) => updateRule(index, 'condition', v)} placeholder="Condition" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Value</label>
                    <input type="text" value={rule.value} onChange={(e) => updateRule(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Value..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">THEN</label>
                    <CustomDropdown options={[{value:'skip',label:'Skip to'},{value:'show',label:'Show'},{value:'hide',label:'Hide'}]} value={rule.action} onChange={(v) => updateRule(index, 'action', v as any)} placeholder="Action" />
                  </div>
                </div>
                <button onClick={() => deleteRule(index)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors mt-5">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                <ArrowRight size={14} className="text-emerald-500 shrink-0" />
                <CustomDropdown
                  options={[{ value: '', label: 'Select target' }, ...questions.map(q => ({ value: q.id, label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 40)}...` }))]}
                  value={rule.targetQuestionId} onChange={(v) => updateRule(index, 'targetQuestionId', v)} placeholder="Target question" className="flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {rules.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-stone-800 mb-3">Flow Summary</h3>
          <div className="space-y-1.5">
            {rules.map((rule, index) => {
              const sourceQ = questions.find(q => q.id === rule.questionId);
              const targetQ = questions.find(q => q.id === rule.targetQuestionId);
              return (
                <div key={rule.id} className="flex items-center gap-2 text-[12px] text-stone-500">
                  <span className="font-medium text-emerald-600">Rule {index + 1}:</span>
                  <span>IF "{sourceQ?.question_text?.substring(0, 25)}..." {rule.condition} "{rule.value}"</span>
                  <ArrowRight size={12} className="text-stone-300" />
                  <span>{rule.action.toUpperCase()} "{targetQ?.question_text?.substring(0, 25)}..."</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyLogic;
