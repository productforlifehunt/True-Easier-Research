import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Download, Filter, Calendar, User, CheckCircle } from 'lucide-react';

interface Response {
  id: string;
  enrollment_id: string;
  question_id: string;
  response_text: string | null;
  response_value: any;
  created_at: string;
  project_id?: string;
  enrollment?: {
    participant_number?: string;
    participant_email?: string;
    profile_data?: any;
    enrollment_data?: any;
  };
  project?: {
    id: string;
    title: string;
  };
  question?: {
    question_text?: string;
    question_type?: string;
  };
}

const ResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/easyresearch/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadResponses();
    }
  }, [selectedProject, user]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      
      // Get researcher's organization_id first to ensure data isolation
      const { data: researcherData } = await supabase
        .from('researcher')
        .select('organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!researcherData) {
        throw new Error('Researcher not found');
      }
      
      // Load researcher's projects (filtered by organization)
      const { data: projectData } = await supabase
        .from('research_project')
        .select('*')
        .eq('organization_id', researcherData.organization_id)
        .order('created_at', { ascending: false });
      
      if (projectData) {
        setProjects(projectData);
      }

      // Load responses (only for this organization's projects)
      const organizationProjectIds = projectData ? projectData.map(p => p.id) : [];
      
      if (organizationProjectIds.length === 0) {
        setResponses([]);
        return;
      }

      let query = supabase
        .from('survey_respons')
        .select('id, project_id, enrollment_id, question_id, response_text, response_value, created_at')
        .in('project_id', organizationProjectIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedProject !== 'all') {
        query = query.eq('project_id', selectedProject);
      }

      const { data: responseData } = await query;
      
      if (responseData) {
        const rawResponses = responseData as Array<{
          id: string;
          project_id: string;
          enrollment_id: string;
          question_id: string;
          response_text: string | null;
          response_value: any;
          created_at: string;
        }>;

        const enrollmentIds = Array.from(new Set(rawResponses.map(r => r.enrollment_id).filter(Boolean)));
        const questionIds = Array.from(new Set(rawResponses.map(r => r.question_id).filter(Boolean)));

        const [{ data: enrollmentsData }, { data: questionsData }] = await Promise.all([
          enrollmentIds.length
            ? supabase
                .from('enrollment')
                .select('id, participant_email')
                .in('id', enrollmentIds)
            : Promise.resolve({ data: [] as any[] } as any),
          questionIds.length
            ? supabase
                .from('survey_question')
                .select('id, question_text, question_type')
                .in('id', questionIds)
            : Promise.resolve({ data: [] as any[] } as any)
        ]);

        const enrollmentById = new Map((enrollmentsData || []).map((e: any) => [e.id, e]));
        const questionById = new Map((questionsData || []).map((q: any) => [q.id, q]));
        const projectById = new Map((projectData || []).map((p: any) => [p.id, p]));

        const enrichedResponses = rawResponses.map(r => ({
          ...r,
          enrollment: enrollmentById.get(r.enrollment_id),
          question: questionById.get(r.question_id),
          project: projectById.get(r.project_id)
        }));

        setResponses(enrichedResponses as any);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResponses = () => {
    // Create CSV export
    const headers = ['Timestamp', 'Project', 'Participant', 'Question', 'Answer'];
    const csvData = responses.map(r => [
      new Date(r.created_at).toLocaleString(),
      r.project?.title || 'Unknown',
      r.enrollment?.participant_email || 'Anonymous',
      r.question?.question_text || 'Unknown',
      (r.response_text && r.response_text.trim().length > 0)
        ? r.response_text
        : (r.response_value !== null && r.response_value !== undefined)
          ? (typeof r.response_value === 'string' ? r.response_value : JSON.stringify(r.response_value))
          : ''
    ]);
    
    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading responses...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Survey Responses
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View and export participant responses
            </p>
          </div>
          <button
            onClick={exportResponses}
            className="px-4 py-2 rounded-lg bg-green-500 text-white flex items-center gap-2 hover:bg-green-600"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl overflow-hidden">
          {responses.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <FileText style={{ color: 'var(--color-green)' }} size={40} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Responses Yet
              </h2>
              <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Survey responses will appear here as participants complete your surveys. Share your survey link to start collecting data.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={16} className="inline mr-2" />
                      Time
                    </th>
                    <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <FileText size={16} className="inline mr-2" />
                      Project
                    </th>
                    <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <User size={16} className="inline mr-2" />
                      Participant
                    </th>
                    <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Question
                    </th>
                    <th className="text-left p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Answer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response, index) => (
                    <tr 
                      key={response.id}
                      className="border-b"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(response.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {response.project?.title || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {response.enrollment?.participant_email || 'Anonymous'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {response.question?.question_text || 'Unknown'}
                        </p>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          {response.question?.question_type || 'text'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {(response.response_text && response.response_text.trim().length > 0)
                            ? response.response_text
                            : (response.response_value !== null && response.response_value !== undefined)
                              ? (typeof response.response_value === 'string'
                                ? response.response_value
                                : Array.isArray(response.response_value)
                                  ? response.response_value.join(', ')
                                  : JSON.stringify(response.response_value))
                              : '-'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
  );
};

export default ResponsesPage;
