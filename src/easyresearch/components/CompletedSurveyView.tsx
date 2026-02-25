import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CompletedSurveyViewProps {
  instanceId: string;
}

interface SurveyResponse {
  id: string;
  question_id: string;
  response_text: string | null;
  response_value: any;
  created_at: string;
  survey_question: {
    question_text: string;
    question_type: string;
    order_index: number;
    options?: any[];
  };
}

const CompletedSurveyView: React.FC<CompletedSurveyViewProps> = ({ instanceId }) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedResponses, setEditedResponses] = useState<Record<string, string>>({});
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (instanceId) {
      loadResponses();
    }
  }, [instanceId]);

  const loadResponses = async () => {
    setLoading(true);
    
    try {
      // Get instance details
      // survey_instance table may not exist; derive project_id from responses
      const instance: any = { enrollment_id: instanceId, project_id: null };

      // Try to get responses by enrollment_id to find project_id
      const { data: peek } = await supabase
        .from('survey_respons')
        .select('project_id')
        .eq('enrollment_id', instanceId)
        .limit(1)
        .maybeSingle();

      if (!peek?.project_id) {
        setLoading(false);
        return;
      }
      instance.project_id = peek.project_id;

      // Get all questions for this project
      const questionsResult = await supabase
        .from('survey_question')
        .select('id, question_text, question_type, question_config, order_index')
        .eq('project_id', instance.project_id)
        .order('order_index', { ascending: true });

      // Get responses for this enrollment
      const responsesResult = await supabase
        .from('survey_respons')
        .select('*')
        .eq('enrollment_id', instanceId);

      const projectQuestions = questionsResult.data || [];
      const allResponses = responsesResult.data || [];

      // Build response objects with questions
      if (projectQuestions.length > 0) {
        // Create response map
        const responseMap = new Map();
        if (allResponses) {
          allResponses.forEach(response => {
            if (!responseMap.has(response.question_id)) {
              responseMap.set(response.question_id, response);
            }
          });
        }
        
        // Build responses array with all questions (using correct schema columns)
        const responsesArray = projectQuestions.map(question => {
          const existingResponse = responseMap.get(question.id);
          return {
            id: existingResponse?.id || question.id,
            question_id: question.id,
            response_text: existingResponse?.response_text || '',
            response_value: existingResponse?.response_value ?? null,
            created_at: existingResponse?.created_at || new Date().toISOString(),
            survey_question: {
              question_text: question.question_text,
              question_type: question.question_type,
              order_index: question.order_index,
              options: question.question_config?.options || []
            }
          };
        });
        
        const extractSelected = (value: any): any => {
          if (!value) return value;
          if (Array.isArray(value)) return value;
          if (typeof value === 'object') {
            if ('selected' in value) return (value as any).selected;
            if ('option_id' in value) return (value as any).option_id;
          }
          return value;
        };

        // Convert response values to readable text for display
        responsesArray.forEach((r: SurveyResponse) => {
          const question = r.survey_question;
          if (!question?.options || question.options.length === 0) return;
          if (r.response_text && String(r.response_text).trim().length > 0) return;

          try {
            const selected = extractSelected(r.response_value);
            const values = Array.isArray(selected) ? selected : selected !== null && selected !== undefined ? [selected] : [];
            const labels = values.map((val: any) => {
              const option = question.options!.find((opt: any) =>
                opt.value === val || opt.value === String(val) || opt.id === val
              );
              return option ? (option.label || option.text) : val;
            }).filter(Boolean);

            if (labels.length > 0) {
              r.response_text = labels.join(', ');
            }
          } catch (error) {
            console.error('Error converting response value:', error);
          }
        });
        
        setResponses(responsesArray);
        
        // Initialize edited responses
        const initialEdits: Record<string, string> = {};
        const initialValues: Record<string, any> = {};
        responsesArray.forEach((r: SurveyResponse) => {
          initialEdits[r.question_id] = r.response_text || '';
          initialValues[r.question_id] = r.response_value ?? r.response_text;
        });
        setEditedResponses(initialEdits);
        setEditedValues(initialValues);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Update each response
      for (const response of responses) {
        const newText = editedResponses[response.question_id];
        const newValue = editedValues[response.question_id];
        
        const originalText = response.response_text || '';
        const originalValue = response.response_value;
        if (newText !== originalText || JSON.stringify(newValue) !== JSON.stringify(originalValue)) {
          const updateData: any = {
            response_text: newText,
            response_value: newValue
          };
          
          await supabase
            .from('survey_respons')
            .update(updateData)
            .eq('id', response.id);
        }
      }
      
      // Reload responses
      await loadResponses();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving responses:', error);
      toast.error('Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }} />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-secondary)' }}>No responses found for this survey.</p>
      </div>
    );
  }

  // Group responses by question
  const groupedResponses = responses.reduce((acc, response) => {
    const questionId = response.question_id;
    if (!acc[questionId]) {
      acc[questionId] = [];
    }
    acc[questionId].push(response);
    return acc;
  }, {} as Record<string, SurveyResponse[]>);

  // Sort questions by order_index
  const sortedQuestions = Object.entries(groupedResponses).sort((a, b) => {
    const orderA = a[1][0]?.survey_question?.order_index || 0;
    const orderB = b[1][0]?.survey_question?.order_index || 0;
    return orderA - orderB;
  });

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className="flex items-center justify-between gap-3 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
            <Check size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-green)' }}>Survey Completed</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {new Date(responses[0].created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        {editMode ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                // Reset to original values
                const initialEdits: Record<string, string> = {};
                const initialVals: Record<string, any> = {};
                responses.forEach((r: SurveyResponse) => {
                  initialEdits[r.question_id] = r.response_text || '';
                  initialVals[r.question_id] = r.response_value ?? r.response_text;
                });
                setEditedResponses(initialEdits);
                setEditedValues(initialVals);
              }}
              className="px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={{ backgroundColor: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1"
            style={{ backgroundColor: 'white', color: 'var(--color-green)', border: '1px solid var(--color-green)' }}
          >
            <Edit2 size={16} />
            Edit
          </button>
        )}
      </div>

      {/* Responses */}
      <div className="space-y-4">
        {sortedQuestions.map(([questionId, questionResponses], index) => {
          const response = questionResponses[0];
          const question = response.survey_question;
          const questionType = question.question_type;
          const options = question.options || [];
          
          return (
            <div key={questionId} className="border-b pb-6 last:border-b-0" style={{ borderColor: 'var(--border-light)' }}>
              <h4 className="font-semibold mb-3 text-base" style={{ color: 'var(--text-primary)' }}>
                {index + 1}. {question.question_text}
              </h4>
              
              {/* Render based on question type */}
              {questionType === 'text' ? (
                editMode ? (
                  <textarea
                    value={editedResponses[response.question_id] || ''}
                    onChange={(e) => setEditedResponses({
                      ...editedResponses,
                      [response.question_id]: e.target.value
                    })}
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', minHeight: '80px' }}
                    rows={3}
                  />
                ) : (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p style={{ color: 'var(--text-primary)' }}>{response.response_text}</p>
                  </div>
                )
              ) : questionType === 'multiple_choice' ? (
                <div className="space-y-3">
                  {options.map((option: any) => {
                    const optionValue = option.value || option.id || option.text;
                    const baseValue = editMode ? editedValues[response.question_id] : response.response_value;
                    const currentValues = Array.isArray(baseValue)
                      ? baseValue
                      : (baseValue && typeof baseValue === 'object' && 'selected' in baseValue)
                        ? (baseValue as any).selected
                        : [];
                    const isSelected = currentValues?.includes(optionValue);
                    
                    return (
                      <label
                        key={optionValue}
                        className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--color-green)' : 'var(--border-light)',
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'white',
                          cursor: editMode ? 'pointer' : 'default'
                        }}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!editMode}
                            onChange={(e) => {
                              if (!editMode) return;
                              const currentVals = Array.isArray(editedValues[response.question_id])
                                ? (editedValues[response.question_id] as any[])
                                : [];
                              const newValues = e.target.checked
                                ? [...currentVals, optionValue]
                                : currentVals.filter((v: string) => v !== optionValue);
                              
                              // Update edited values
                              setEditedValues({
                                ...editedValues,
                                [response.question_id]: newValues
                              });
                              
                              // Update edited responses text
                              const labels = options
                                .filter((opt: any) => newValues.includes(opt.value || opt.id || opt.text))
                                .map((opt: any) => opt.text);
                              setEditedResponses({
                                ...editedResponses,
                                [response.question_id]: labels.join(', ')
                              });
                            }}
                            className="w-5 h-5 rounded"
                            style={{
                              accentColor: 'var(--color-green)',
                              cursor: editMode ? 'pointer' : 'default'
                            }}
                          />
                        </div>
                        <span
                          className="flex-1 text-base"
                          style={{ 
                            color: isSelected ? 'var(--color-green)' : 'var(--text-primary)',
                            fontWeight: isSelected ? '600' : '500'
                          }}
                        >
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : questionType === 'single_choice' ? (
                <div className="space-y-3">
                  {options.map((option: any) => {
                    const optionValue = option.value || option.id || option.text;
                    const baseValue = editMode ? editedValues[response.question_id] : response.response_value;
                    const selectedValue = baseValue && typeof baseValue === 'object' && 'option_id' in baseValue
                      ? (baseValue as any).option_id
                      : baseValue;
                    const isSelected = selectedValue === optionValue || response.response_text === option.text || response.response_text === optionValue;
                    
                    return (
                      <label
                        key={optionValue}
                        className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--color-green)' : 'var(--border-light)',
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'white',
                          cursor: editMode ? 'pointer' : 'default'
                        }}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="radio"
                            checked={isSelected}
                            disabled={!editMode}
                            name={`question-${questionId}`}
                            onChange={() => {
                              if (!editMode) return;
                              setEditedValues({
                                ...editedValues,
                                [response.question_id]: optionValue
                              });
                              setEditedResponses({
                                ...editedResponses,
                                [response.question_id]: option.text
                              });
                            }}
                            className="w-5 h-5"
                            style={{
                              accentColor: 'var(--color-green)',
                              cursor: editMode ? 'pointer' : 'default'
                            }}
                          />
                        </div>
                        <span
                          className="flex-1 text-base"
                          style={{ 
                            color: isSelected ? 'var(--color-green)' : 'var(--text-primary)',
                            fontWeight: isSelected ? '600' : '500'
                          }}
                        >
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p style={{ color: 'var(--text-primary)' }}>{response.response_text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompletedSurveyView;
