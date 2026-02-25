import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Download, Filter, Calendar, User } from 'lucide-react';

interface Response {
  id: string;
  enrollment_id: string;
  question_id: string;
  response_text: string | null;
  response_value: any;
  created_at: string;
  project_id?: string;
  enrollment?: { participant_email?: string };
  project?: { id: string; title: string };
  question?: { question_text?: string; question_type?: string };
}

const ResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/easyresearch/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadResponses();
  }, [selectedProject, user]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const { data: researcherData } = await supabase.from('researcher').select('organization_id').eq('user_id', user?.id).maybeSingle();
      if (!researcherData) throw new Error('Researcher not found');
      const { data: projectData } = await supabase.from('research_project').select('*').eq('organization_id', researcherData.organization_id).order('created_at', { ascending: false });
      if (projectData) setProjects(projectData);
      const organizationProjectIds = projectData ? projectData.map(p => p.id) : [];
      if (organizationProjectIds.length === 0) { setResponses([]); return; }

      let query = supabase.from('survey_respons').select('id, project_id, enrollment_id, question_id, response_text, response_value, created_at')
        .in('project_id', organizationProjectIds).order('created_at', { ascending: false }).limit(100);
      if (selectedProject !== 'all') query = query.eq('project_id', selectedProject);

      const { data: responseData } = await query;
      if (responseData) {
        const rawResponses = responseData as any[];
        const enrollmentIds = Array.from(new Set(rawResponses.map(r => r.enrollment_id).filter(Boolean)));
        const questionIds = Array.from(new Set(rawResponses.map(r => r.question_id).filter(Boolean)));

        const [{ data: enrollmentsData }, { data: questionsData }] = await Promise.all([
          enrollmentIds.length ? supabase.from('enrollment').select('id, participant_email').in('id', enrollmentIds) : Promise.resolve({ data: [] as any[] } as any),
          questionIds.length ? supabase.from('survey_question').select('id, question_text, question_type').in('id', questionIds) : Promise.resolve({ data: [] as any[] } as any)
        ]);

        const enrollmentById = new Map((enrollmentsData || []).map((e: any) => [e.id, e]));
        const questionById = new Map((questionsData || []).map((q: any) => [q.id, q]));
        const projectById = new Map((projectData || []).map((p: any) => [p.id, p]));

        setResponses(rawResponses.map(r => ({
          ...r, enrollment: enrollmentById.get(r.enrollment_id), question: questionById.get(r.question_id), project: projectById.get(r.project_id)
        })) as any);
      }
    } catch (error) { console.error('Error loading responses:', error); }
    finally { setLoading(false); }
  };

  const exportResponses = () => {
    const headers = ['Timestamp', 'Project', 'Participant', 'Question', 'Answer'];
    const csvData = responses.map(r => [
      new Date(r.created_at).toLocaleString(), r.project?.title || 'Unknown',
      r.enrollment?.participant_email || 'Anonymous', r.question?.question_text || 'Unknown',
      (r.response_text && r.response_text.trim().length > 0) ? r.response_text
        : (r.response_value !== null && r.response_value !== undefined)
          ? (typeof r.response_value === 'string' ? r.response_value : JSON.stringify(r.response_value))
          : ''
    ]);
    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Responses</h1>
          <p className="text-[13px] text-slate-400 mt-1 font-light">View and export participant responses</p>
        </div>
        <button
          onClick={exportResponses}
          className="px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <Filter size={14} className="text-slate-300" />
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-full text-[13px] border border-slate-100 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {responses.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="mx-auto mb-3 text-slate-200" size={32} />
            <h3 className="text-[15px] font-semibold text-slate-900 mb-1">No Responses Yet</h3>
            <p className="text-[13px] text-slate-400 max-w-sm mx-auto font-light">
              Responses will appear here as participants complete your surveys.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Participant</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Question</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((response) => (
                  <tr key={response.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-slate-400 whitespace-nowrap">
                      {new Date(response.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-900">
                      {response.project?.title || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-500">
                      {response.enrollment?.participant_email || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] text-slate-500 line-clamp-1">{response.question?.question_text || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-900 max-w-xs truncate">
                      {(response.response_text && response.response_text.trim().length > 0)
                        ? response.response_text
                        : (response.response_value !== null && response.response_value !== undefined)
                          ? (typeof response.response_value === 'string' ? response.response_value
                            : Array.isArray(response.response_value) ? response.response_value.join(', ')
                            : JSON.stringify(response.response_value))
                          : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsesPage;
