import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, GitBranch } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

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
  onUpdateLogic: (rules: LogicRule[]) => void;
}

const SurveyLogic: React.FC<SurveyLogicProps> = ({ questions, onUpdateLogic }) => {
  const [rules, setRules] = useState<LogicRule[]>([]);

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
    onUpdateLogic(updatedRules);
  };

  const deleteRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onUpdateLogic(updatedRules);
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
        <button
          onClick={addRule}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
          style={{ backgroundColor: 'var(--color-green)' }}
        >
          <Plus size={16} />
          Add Logic Rule
        </button>
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
