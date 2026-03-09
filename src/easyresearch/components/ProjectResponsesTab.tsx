import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, User, Table2, Download, ChevronDown, ChevronRight, MessageSquare, ArrowLeftRight, Layers, TrendingDown, Brain, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { QuestionnaireConfig } from './QuestionnaireList';
import AdvancedQuestionAnalytics from './shared/AdvancedQuestionAnalytics';
import CrossTabAnalysis from './CrossTabAnalysis';
import FunnelAnalysis from './FunnelAnalysis';
import AITextAnalysis from './AITextAnalysis';
import AdvancedExport from './AdvancedExport';
import UXResearchVisualizer from './UXResearchVisualizer';
import StatisticalAnalysis from './StatisticalAnalysis';

interface Props {
  projectId: string;
  questionnaires: QuestionnaireConfig[];
}

type SubView = 'summary' | 'individual' | 'table' | 'cross_tab' | 'funnel' | 'ai_text' | 'export' | 'ux_results' | 'stats';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const ProjectResponsesTab: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [subView, setSubView] = useState<SubView>('summary');
  const [responses, setResponses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [individualIndex, setIndividualIndex] = useState(0);

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: responseData }, { data: enrollmentData }, { data: questionData }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('enrollment').select('id, participant_email, participant_id, status, created_at').eq('project_id', projectId),
        supabase.from('question').select('*').eq('project_id', projectId).order('order_index', { ascending: true }),
      ]);
      setResponses(responseData || []);
      setEnrollments(enrollmentData || []);
      setQuestions(questionData || []);
    } catch (e) {
      console.error('Error loading responses:', e);
    } finally {
      setLoading(false);
    }
  };

  // Map questions by questionnaire
  const questionsByQuestionnaire = useMemo(() => {
    const map = new Map<string, any[]>();
    // Use questionnaire configs to group questions
    questionnaires.forEach(qc => {
      map.set(qc.id, qc.questions || []);
    });
    // Also add DB questions that may not be in configs
    questions.forEach(q => {
      const qcId = q.questionnaire_id || 'ungrouped';
      if (!map.has(qcId)) map.set(qcId, []);
      const existing = map.get(qcId)!;
      if (!existing.find((eq: any) => eq.id === q.id)) {
        existing.push(q);
      }
    });
    return map;
  }, [questionnaires, questions]);

  // Get filtered questions based on selected questionnaire
  const filteredQuestions = useMemo(() => {
    if (selectedQuestionnaire === 'all') {
      return questionnaires.flatMap(qc => (qc.questions || []).map(q => ({ ...q, questionnaire_name: qc.title })));
    }
    const qc = questionnaires.find(q => q.id === selectedQuestionnaire);
    return (qc?.questions || []).map(q => ({ ...q, questionnaire_name: qc?.title }));
  }, [selectedQuestionnaire, questionnaires]);

  // Group responses by enrollment
  const responsesByEnrollment = useMemo(() => {
    const map = new Map<string, any[]>();
    responses.forEach(r => {
      const key = r.enrollment_id || 'anonymous';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [responses]);

  const enrollmentById = useMemo(() => {
    return new Map(enrollments.map(e => [e.id, e]));
  }, [enrollments]);

  // Build question stats for summary view
  const getQuestionStats = (question: any) => {
    const qResponses = responses.filter(r => r.question_id === question.id);
    const total = qResponses.length;

    if (['single_choice', 'multiple_choice', 'yes_no', 'likert'].includes(question.question_type)) {
      const counts: Record<string, number> = {};
      qResponses.forEach(r => {
        const val = r.response_text || (r.response_value != null ? String(r.response_value) : '');
        if (val) {
          if (Array.isArray(r.response_value)) {
            r.response_value.forEach((v: string) => { counts[v] = (counts[v] || 0) + 1; });
          } else {
            counts[val] = (counts[val] || 0) + 1;
          }
        }
      });
      return {
        type: 'chart',
        total,
        data: Object.entries(counts).map(([name, value]) => ({
          name: name.length > 25 ? name.substring(0, 22) + '...' : name,
          fullName: name,
          count: value,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        })),
      };
    }

    if (['number', 'slider', 'scale'].includes(question.question_type)) {
      const values = qResponses
        .map(r => parseFloat(r.response_value ?? r.response_text))
        .filter(v => !isNaN(v));
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      return { type: 'numeric', total, avg: avg.toFixed(1), min, max, values };
    }

    // Text responses
    const texts = qResponses
      .map(r => r.response_text || (r.response_value != null ? String(r.response_value) : ''))
      .filter(Boolean);
    return { type: 'text', total, texts };
  };

  const exportCSV = () => {
    const questionMap = new Map(
      questionnaires.flatMap(qc => (qc.questions || []).map(q => [q.id, q]))
    );
    const headers = ['Timestamp', 'Participant', 'Questionnaire', 'Question', 'Answer'];
    const rows = responses.map(r => {
      const q = questionMap.get(r.question_id);
      const e = enrollmentById.get(r.enrollment_id);
      const qc = questionnaires.find(qc => (qc.questions || []).some(qq => qq.id === r.question_id));
      const answer = r.response_text || (r.response_value != null
        ? (Array.isArray(r.response_value) ? r.response_value.join(', ') : String(r.response_value))
        : '');
      return [
        new Date(r.created_at).toLocaleString(),
        e?.participant_email || 'Anonymous',
        qc?.title || 'Unknown',
        q?.question_text || 'Unknown',
        answer,
      ];
    });
    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Individual submissions list
  const submissions = useMemo(() => {
    return Array.from(responsesByEnrollment.entries()).map(([enrollmentId, resps]) => {
      const enrollment = enrollmentById.get(enrollmentId);
      return {
        enrollmentId,
        email: enrollment?.participant_email || 'Anonymous',
        submittedAt: resps[0]?.created_at,
        responses: resps,
        count: resps.length,
      };
    });
  }, [responsesByEnrollment, enrollmentById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Responses', value: responses.length },
          { label: 'Participants', value: enrollments.length },
          { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length },
          { label: 'Completion Rate', value: enrollments.length > 0 ? `${Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)}%` : '0%' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-100 p-4">
            <p className="text-2xl font-semibold text-stone-800 tracking-tight">{s.value}</p>
            <p className="text-[11px] text-stone-400 mt-0.5 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sub-navigation + controls */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
          {[
            { id: 'summary' as SubView, label: 'Summary', icon: BarChart3 },
            { id: 'individual' as SubView, label: 'Individual', icon: User },
            { id: 'table' as SubView, label: 'Table', icon: Table2 },
            { id: 'cross_tab' as SubView, label: 'Cross-Tab', icon: ArrowLeftRight },
            { id: 'funnel' as SubView, label: 'Funnel', icon: TrendingDown },
            { id: 'ai_text' as SubView, label: 'AI Text', icon: Brain },
            { id: 'export' as SubView, label: 'Export', icon: FileSpreadsheet },
            { id: 'ux_results' as SubView, label: 'UX Results', icon: Layers },
            { id: 'stats' as SubView, label: 'Stats', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                subView === tab.id
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {questionnaires.length > 1 && (
            <select
              value={selectedQuestionnaire}
              onChange={e => setSelectedQuestionnaire(e.target.value)}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Questionnaires</option>
              {questionnaires.map(qc => (
                <option key={qc.id} value={qc.id}>{qc.title}</option>
              ))}
            </select>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-100 p-16 text-center">
          <MessageSquare size={32} className="text-stone-200 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-stone-600 mb-1">No responses yet</p>
          <p className="text-[12px] text-stone-400">Responses will appear here as participants complete your questionnaires.</p>
        </div>
      ) : (
        <>
          {/* SUMMARY VIEW */}
          {subView === 'summary' && (
            <div className="space-y-4">
              {filteredQuestions.map((q: any) => {
                const stats = getQuestionStats(q);
                const isExpanded = expandedQuestion === q.id;
                return (
                  <div key={q.id} className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {q.questionnaire_name && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                              {q.questionnaire_name}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-300 uppercase">{q.question_type}</span>
                        </div>
                        <p className="text-[13px] font-medium text-stone-800 truncate">{q.question_text}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-[12px] text-stone-400">{stats.total} responses</span>
                        {isExpanded ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-stone-50">
                        {stats.type === 'chart' && (stats as any).data.length > 0 && (
                          <div className="pt-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div style={{ height: Math.max(200, (stats as any).data.length * 36) }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={(stats as any).data} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#57534e' }} />
                                    <Tooltip
                                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
                                      formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentage}%)`, 'Count']}
                                      labelFormatter={(label: string) => {
                                        const item = (stats as any).data.find((d: any) => d.name === label);
                                        return item?.fullName || label;
                                      }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                      {(stats as any).data.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={(stats as any).data}
                                      dataKey="count"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={80}
                                      label={({ name, percentage }: any) => `${name} (${percentage}%)`}
                                      labelLine={false}
                                      style={{ fontSize: 10 }}
                                    >
                                      {(stats as any).data.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            {/* Legend table */}
                            <div className="mt-4 space-y-1">
                              {(stats as any).data.map((d: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-[12px] py-1 px-2 rounded hover:bg-stone-50">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-stone-600">{d.fullName}</span>
                                  </div>
                                  <span className="text-stone-400">{d.count} ({d.percentage}%)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {stats.type === 'numeric' && (
                          <div className="pt-4 grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-stone-50 rounded-lg">
                              <p className="text-xl font-semibold text-stone-800">{(stats as any).avg}</p>
                              <p className="text-[10px] text-stone-400 uppercase mt-0.5">Average</p>
                            </div>
                            <div className="text-center p-3 bg-stone-50 rounded-lg">
                              <p className="text-xl font-semibold text-stone-800">{(stats as any).min}</p>
                              <p className="text-[10px] text-stone-400 uppercase mt-0.5">Minimum</p>
                            </div>
                            <div className="text-center p-3 bg-stone-50 rounded-lg">
                              <p className="text-xl font-semibold text-stone-800">{(stats as any).max}</p>
                              <p className="text-[10px] text-stone-400 uppercase mt-0.5">Maximum</p>
                            </div>
                          </div>
                        )}

                        {stats.type === 'text' && (
                          <div className="pt-4 space-y-2 max-h-60 overflow-y-auto">
                            {(stats as any).texts.length === 0 ? (
                              <p className="text-[12px] text-stone-400 italic">No text responses</p>
                            ) : (
                              (stats as any).texts.slice(0, 20).map((t: string, i: number) => (
                                <div key={i} className="text-[12px] text-stone-600 bg-stone-50 rounded-lg p-3">
                                  "{t}"
                                </div>
                              ))
                            )}
                            {(stats as any).texts.length > 20 && (
                              <p className="text-[11px] text-stone-400">+{(stats as any).texts.length - 20} more responses</p>
                            )}
                          </div>
                        )}

                        {/* Advanced per-type analytics / 高级题型分析 */}
                        {['nps', 'sus', 'csat', 'ces', 'likert_scale', 'rating', 'slider', 'bipolar_scale', 'max_diff', 'kano'].includes(q.question_type) && (
                          <div className="mt-4 pt-4 border-t border-stone-100">
                            <AdvancedQuestionAnalytics
                              questionType={q.question_type}
                              responses={responses.filter(r => r.question_id === q.id)}
                              questionConfig={q.question_config}
                              options={q.options?.map((o: any) => o.option_text)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* INDIVIDUAL VIEW */}
          {subView === 'individual' && (
            <div className="bg-white rounded-xl border border-stone-100">
              <div className="flex border-b border-stone-100">
                {/* Participant list sidebar */}
                <div className="w-64 border-r border-stone-100 max-h-[600px] overflow-y-auto">
                  {submissions.map((sub, i) => (
                    <button
                      key={sub.enrollmentId}
                      onClick={() => setIndividualIndex(i)}
                      className={`w-full text-left px-4 py-3 border-b border-stone-50 transition-colors ${
                        i === individualIndex ? 'bg-emerald-50/50' : 'hover:bg-stone-50/50'
                      }`}
                    >
                      <p className="text-[12px] font-medium text-stone-800 truncate">{sub.email}</p>
                      <p className="text-[10px] text-stone-400">{sub.count} answers · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                  {submissions.length === 0 && (
                    <p className="text-[12px] text-stone-400 p-4">No submissions</p>
                  )}
                </div>

                {/* Response detail */}
                <div className="flex-1 max-h-[600px] overflow-y-auto">
                  {submissions[individualIndex] ? (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-[14px] font-semibold text-stone-800">{submissions[individualIndex].email}</p>
                          <p className="text-[11px] text-stone-400">{new Date(submissions[individualIndex].submittedAt).toLocaleString()}</p>
                        </div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          {submissions[individualIndex].count} answers
                        </span>
                      </div>
                      {submissions[individualIndex].responses.map((r: any) => {
                        const q = questionnaires.flatMap(qc => qc.questions || []).find(q => q.id === r.question_id) ||
                          questions.find(q => q.id === r.question_id);
                        const answer = r.response_text || (r.response_value != null
                          ? (Array.isArray(r.response_value) ? r.response_value.join(', ') : String(r.response_value))
                          : '—');
                        return (
                          <div key={r.id} className="border-b border-stone-50 pb-3">
                            <p className="text-[11px] text-stone-400 mb-0.5">{q?.question_text || 'Unknown question'}</p>
                            <p className="text-[13px] font-medium text-stone-700">{answer}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[12px] text-stone-400">Select a participant</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          {subView === 'table' && (
            <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-[12px]">
                  <thead className="sticky top-0 bg-stone-50 z-10">
                    <tr>
                      <th className="text-left px-3 py-2.5 text-stone-400 font-medium uppercase tracking-wider border-b border-stone-100">Time</th>
                      <th className="text-left px-3 py-2.5 text-stone-400 font-medium uppercase tracking-wider border-b border-stone-100">Participant</th>
                      <th className="text-left px-3 py-2.5 text-stone-400 font-medium uppercase tracking-wider border-b border-stone-100">Questionnaire</th>
                      <th className="text-left px-3 py-2.5 text-stone-400 font-medium uppercase tracking-wider border-b border-stone-100">Question</th>
                      <th className="text-left px-3 py-2.5 text-stone-400 font-medium uppercase tracking-wider border-b border-stone-100">Answer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {responses
                      .filter(r => selectedQuestionnaire === 'all' || questionnaires.find(qc => qc.id === selectedQuestionnaire)?.questions?.some(q => q.id === r.question_id))
                      .map(r => {
                        const q = questionnaires.flatMap(qc => qc.questions || []).find(q => q.id === r.question_id) ||
                          questions.find(q => q.id === r.question_id);
                        const qc = questionnaires.find(qc => (qc.questions || []).some(qq => qq.id === r.question_id));
                        const e = enrollmentById.get(r.enrollment_id);
                        const answer = r.response_text || (r.response_value != null
                          ? (Array.isArray(r.response_value) ? r.response_value.join(', ') : String(r.response_value))
                          : '—');
                        return (
                          <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-3 py-2 text-stone-400 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                            <td className="px-3 py-2 text-stone-600">{e?.participant_email || 'Anonymous'}</td>
                            <td className="px-3 py-2 text-stone-500">{qc?.title || '—'}</td>
                            <td className="px-3 py-2 text-stone-600 max-w-xs truncate">{q?.question_text || 'Unknown'}</td>
                            <td className="px-3 py-2 text-stone-800 font-medium max-w-xs truncate">{answer}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CROSS-TAB VIEW / 交叉分析 */}
          {subView === 'cross_tab' && (
            <div className="bg-white rounded-xl border border-stone-100 p-5">
              <CrossTabAnalysis
                questions={filteredQuestions}
                responses={responses}
              />
            </div>
          )}

          {/* FUNNEL VIEW / 漏斗分析 */}
          {subView === 'funnel' && (
            <div className="bg-white rounded-xl border border-stone-100 p-5">
              <FunnelAnalysis
                projectId={projectId}
                questionnaires={questionnaires}
              />
            </div>
          )}

          {/* AI TEXT VIEW / AI 文本分析 */}
          {subView === 'ai_text' && (
            <div className="bg-white rounded-xl border border-stone-100 p-5">
              <AITextAnalysis
                projectId={projectId}
                responses={responses}
                questions={filteredQuestions}
              />
            </div>
          )}

          {/* EXPORT VIEW / 高级导出 */}
          {subView === 'export' && (
            <div className="bg-white rounded-xl border border-stone-100 p-5">
              <AdvancedExport
                projectId={projectId}
                projectTitle={questionnaires[0]?.title || 'Export'}
                responses={responses}
                questions={filteredQuestions}
                enrollments={enrollments}
                questionnaires={questionnaires}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectResponsesTab;
