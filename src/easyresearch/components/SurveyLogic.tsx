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

  useEffect(() => {
    if (existingRules) {
      setRules(existingRules);
    }
  }, [existingRules]);

  const addRule = () => {
    const newRule: LogicRule = {
      id: `rule_${Date.now()}`,
      questionId: questions[0]?.id || '',
      condition: 'equals',
      value: '',
      action: 'skip',
      targetQuestionId: questions[1]?.id || ''
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, field: keyof LogicRule, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
    setSaved(false);
  };

  const deleteRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    setSaved(false);
  };

  const saveRules = async () => {
    setSaving(true);
    try {
      // Pass rules to parent which handles the actual Supabase save
      await onUpdateLogic(rules);
      setSaved(true);
      toast.success('Logic rules saved!');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error('Failed to save logic rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Survey Logic
          </h2>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Configure skip logic, branching, and conditional questions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addRule}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            <Plus size={16} />
            Add Rule
          </button>
          {rules.length > 0 && (
            <button
              onClick={saveRules}
              disabled={saving || saved}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 border"
              style={{ 
                borderColor: saved ? '#10b981' : 'var(--border-light)',
                backgroundColor: saved ? '#f0fdf4' : 'white',
                color: saved ? '#10b981' : 'var(--text-primary)'
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Rules'}
            </button>
          )}
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid var(--border-light)' }}>
          <GitBranch className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No logic rules yet
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Create conditional logic to show, hide, or skip questions based on responses
          </p>
          <button
            onClick={addRule}
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div 
              key={rule.id}
              className="bg-white rounded-2xl p-6" 
              style={{ border: '1px solid var(--border-light)' }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* IF Question */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      IF Question
                    </label>
                    <CustomDropdown
                      options={questions.map(q => ({
                        value: q.id,
                        label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 30)}...`
                      }))}
                      value={rule.questionId}
                      onChange={(value) => updateRule(index, 'questionId', value)}
                      placeholder="Select question"
                    />
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Condition
                    </label>
                    <CustomDropdown
                      options={[
                        { value: 'equals', label: 'Equals' },
                        { value: 'not_equals', label: 'Not Equals' },
                        { value: 'contains', label: 'Contains' },
                        { value: 'greater_than', label: 'Greater Than' },
                        { value: 'less_than', label: 'Less Than' },
                        { value: 'is_empty', label: 'Is Empty' },
                        { value: 'is_not_empty', label: 'Is Not Empty' }
                      ]}
                      value={rule.condition}
                      onChange={(value) => updateRule(index, 'condition', value)}
                      placeholder="Select condition"
                    />
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Value
                    </label>
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: 'var(--border-light)' }}
                      placeholder="Enter value..."
                    />
                  </div>

                  {/* THEN Action */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      THEN Action
                    </label>
                    <CustomDropdown
                      options={[
                        { value: 'skip', label: 'Skip to Question' },
                        { value: 'show', label: 'Show Question' },
                        { value: 'hide', label: 'Hide Question' }
                      ]}
                      value={rule.action}
                      onChange={(value) => updateRule(index, 'action', value as any)}
                      placeholder="Select action"
                    />
                  </div>
                </div>

                <button
                  onClick={() => deleteRule(index)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Target Question */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-center gap-3">
                  <ArrowRight style={{ color: 'var(--color-green)' }} size={20} />
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select target question' },
                      ...questions.map(q => ({
                        value: q.id,
                        label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 50)}...`
                      }))
                    ]}
                    value={rule.targetQuestionId}
                    onChange={(value) => updateRule(index, 'targetQuestionId', value)}
                    placeholder="Select target question"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logic Summary */}
      {rules.length > 0 && (
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Logic Flow Summary
          </h3>
          <div className="space-y-2">
            {rules.map((rule, index) => {
              const sourceQ = questions.find(q => q.id === rule.questionId);
              const targetQ = questions.find(q => q.id === rule.targetQuestionId);
              return (
                <div key={rule.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--color-green)' }}>
                    Rule {index + 1}:
                  </span>
                  <span>
                    IF "{sourceQ?.question_text?.substring(0, 30)}..." {rule.condition} "{rule.value}"
                  </span>
                  <ArrowRight size={14} />
                  <span>
                    {rule.action.toUpperCase()} "{targetQ?.question_text?.substring(0, 30)}..."
                  </span>
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
