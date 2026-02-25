import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Users, Calendar, Download, Filter } from 'lucide-react';

interface Response {
  id: string;
  enrollment_id: string;
  question_id: string;
  response_text: string | null;
  response_value: any;
  created_at: string;
  instance_id?: string;
  survey_question?: { question_text: string; question_type: string; order_index: number; };
  enrollment?: { participant_email?: string; };
}

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  survey_questions?: any[];
}

const SurveyResponses: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => { if (projectId) loadProjectAndResponses(); }, [projectId]);

  const loadProjectAndResponses = async () => {
    try {
      const { data: projectData } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
      if (projectData) setProject(projectData);

      const { data: responsesData } = await supabase.from('survey_respons').select('id, enrollment_id, question_id, response_text, response_value, created_at, instance_id').eq('project_id', projectId).order('created_at', { ascending: false });
      const rawResponses = (responsesData || []) as any[];
      const questionIds = Array.from(new Set(rawResponses.map(r => r.question_id).filter(Boolean)));
      const enrollmentIds = Array.from(new Set(rawResponses.map(r => r.enrollment_id).filter(Boolean)));

      const [{ data: questionsData }, { data: enrollmentsData }] = await Promise.all([
        questionIds.length ? supabase.from('survey_question').select('id, question_text, question_type, order_index').in('id', questionIds) : Promise.resolve({ data: [] as any[] } as any),
        enrollmentIds.length ? supabase.from('enrollment').select('id, participant_email').in('id', enrollmentIds) : Promise.resolve({ data: [] as any[] } as any)
      ]);

      const questionById = new Map((questionsData || []).map((q: any) => [q.id, q]));
      const enrollmentById = new Map((enrollmentsData || []).map((e: any) => [e.id, e]));
      setResponses(rawResponses.map(r => ({ ...r, survey_question: questionById.get(r.question_id), enrollment: enrollmentById.get(r.enrollment_id) })));
    } catch (error) { console.error('Error loading responses:', error); }
    finally { setLoading(false); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getParticipantName = (r: Response) => r.enrollment?.participant_email || `Participant ${r.enrollment_id?.substring(0, 8) || 'Unknown'}`;
  const getAnswerDisplay = (r: Response) => {
    if (r.response_text && r.response_text.trim().length > 0) return r.response_text;
    if (r.response_value !== null && r.response_value !== undefined) {
      if (typeof r.response_value === 'string') return r.response_value;
      if (Array.isArray(r.response_value)) return r.response_value.join(', ');
      return JSON.stringify(r.response_value);
    }
    return 'No response';
  };

  const groupedResponses = React.useMemo(() => {
    const groups: Record<string, Response[]> = {};
    responses.forEach(r => { const key = `${r.enrollment_id || 'unknown'}_${r.instance_id || 'default'}`; if (!groups[key]) groups[key] = []; groups[key].push(r); });
    return Object.entries(groups).map(([key, resps]) => ({ key, enrollmentId: resps[0]?.enrollment_id, instanceId: resps[0]?.instance_id, participantEmail: resps[0]?.enrollment?.participant_email, createdAt: resps[0]?.created_at, responses: resps }));
  }, [responses]);

  const exportToCSV = () => {
    if (groupedResponses.length === 0) return;
    const allQuestions = new Map<string, string>();
    responses.forEach(r => { if (r.question_id && r.survey_question?.question_text) allQuestions.set(r.question_id, r.survey_question.question_text); });
    const questionIds = Array.from(allQuestions.keys()); const questionTexts = Array.from(allQuestions.values());
    const headers = ['Participant', 'Instance', 'Submitted At', ...questionTexts];
    const csvData = groupedResponses.map(group => {
      const row = [group.participantEmail || `Participant ${group.enrollmentId?.substring(0, 8) || 'Unknown'}`, group.instanceId || 'N/A', formatDate(group.createdAt)];
      questionIds.forEach(qId => { const resp = group.responses.find(r => r.question_id === qId); row.push(resp ? getAnswerDisplay(resp) : ''); });
      return row;
    });
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${project?.title || 'survey'}-responses.csv`; a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[13px] text-stone-400">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <h2 className="text-[17px] font-semibold text-stone-800 mb-3">Project Not Found</h2>
          <button onClick={() => navigate('/easyresearch/responses')} className="px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200">
            Back to Responses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/easyresearch/responses')} className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 hover:text-emerald-700 mb-3">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-800">{project.title}</h1>
            <p className="text-[13px] text-stone-400 mt-1 font-light">{project.description}</p>
          </div>
          <button onClick={exportToCSV} disabled={responses.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200 disabled:opacity-50">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Submissions', value: groupedResponses.length, icon: Users, gradient: 'from-emerald-50 to-teal-50', iconColor: 'text-emerald-600' },
          { label: 'Latest', value: groupedResponses.length > 0 ? formatDate(groupedResponses[0].createdAt) : 'None', icon: Calendar, gradient: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600', isText: true },
          { label: 'Total Answers', value: responses.length, icon: Filter, gradient: 'from-violet-50 to-purple-50', iconColor: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 border border-white/60`}>
            <s.icon size={16} className={`${s.iconColor} mb-3`} strokeWidth={1.5} />
            <p className={`${(s as any).isText ? 'text-[13px]' : 'text-2xl'} font-semibold tracking-tight text-stone-800`}>{s.value}</p>
            <p className="text-[12px] text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Responses */}
      <div className="space-y-2">
        <h2 className="text-[15px] font-semibold text-stone-800 mb-3">All Responses</h2>
        {groupedResponses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
              <Users className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">No Responses Yet</h3>
            <p className="text-[13px] text-stone-400 font-light">Responses appear here once participants complete the survey.</p>
          </div>
        ) : (
          groupedResponses.map(group => (
            <div key={group.key} className="bg-white rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all cursor-pointer p-5" onClick={() => setSelectedResponse(group.responses[0])}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-semibold text-stone-800">{group.participantEmail || `Participant ${group.enrollmentId?.substring(0, 8)}`}</h3>
                  <p className="text-[12px] text-stone-400 mt-0.5">{formatDate(group.createdAt)}{group.instanceId && <span className="ml-2">· Instance: {group.instanceId.substring(0, 8)}</span>}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">{group.responses.length} answers</span>
              </div>
              <div className="space-y-1.5">
                {group.responses.slice(0, 3).map(r => (
                  <div key={r.id} className="text-[12px] p-2 rounded-lg bg-stone-50">
                    <span className="font-medium text-stone-700">{r.survey_question?.question_text?.substring(0, 40) || 'Question'}:</span>{' '}
                    <span className="text-stone-500">{getAnswerDisplay(r).substring(0, 80)}</span>
                  </div>
                ))}
                {group.responses.length > 3 && <p className="text-[11px] text-stone-400">+{group.responses.length - 3} more</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setSelectedResponse(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-800">Response Details</h2>
                <p className="text-[12px] text-stone-400 mt-0.5">{getParticipantName(selectedResponse)}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="p-1 rounded-lg hover:bg-stone-50 text-stone-400 text-lg font-bold">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div><p className="text-[12px] text-stone-400 mb-1">Submitted</p><p className="text-[13px] font-medium text-stone-800">{formatDate(selectedResponse.created_at)}</p></div>
              {selectedResponse.survey_question && (<div><p className="text-[12px] text-stone-400 mb-1">Question</p><p className="text-[13px] font-medium text-stone-800">{selectedResponse.survey_question.question_text}</p></div>)}
              <div><p className="text-[12px] text-stone-400 mb-1">Answer</p><div className="p-3 rounded-xl bg-stone-50"><p className="text-[13px] text-stone-700">{getAnswerDisplay(selectedResponse)}</p></div></div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setSelectedResponse(null)} className="w-full py-2.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyResponses;
