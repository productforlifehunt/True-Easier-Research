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
  survey_question?: {
    question_text: string;
    question_type: string;
    order_index: number;
  };
  enrollment?: {
    participant_email?: string;
  };
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

  useEffect(() => {
    if (projectId) {
      loadProjectAndResponses();
    }
  }, [projectId]);

  const loadProjectAndResponses = async () => {
    try {
      // Load project details
      const { data: projectData } = await supabase
        .from('research_project')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectData) {
        setProject(projectData);
      }

      // Load survey responses with correct schema
      const { data: responsesData } = await supabase
        .from('survey_respons')
        .select('id, enrollment_id, question_id, response_text, response_value, created_at, instance_id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      const rawResponses = (responsesData || []) as Array<{
        id: string;
        enrollment_id: string;
        question_id: string;
        response_text: string | null;
        response_value: any;
        created_at: string;
        instance_id?: string;
      }>;

      const questionIds = Array.from(new Set(rawResponses.map(r => r.question_id).filter(Boolean)));
      const enrollmentIds = Array.from(new Set(rawResponses.map(r => r.enrollment_id).filter(Boolean)));

      const [{ data: questionsData }, { data: enrollmentsData }] = await Promise.all([
        questionIds.length
          ? supabase
              .from('survey_question')
              .select('id, question_text, question_type, order_index')
              .in('id', questionIds)
          : Promise.resolve({ data: [] as any[] } as any),
        enrollmentIds.length
          ? supabase
              .from('enrollment')
              .select('id, participant_email')
              .in('id', enrollmentIds)
          : Promise.resolve({ data: [] as any[] } as any)
      ]);

      const questionById = new Map((questionsData || []).map((q: any) => [q.id, q]));
      const enrollmentById = new Map((enrollmentsData || []).map((e: any) => [e.id, e]));

      const enriched = rawResponses.map(r => ({
        ...r,
        survey_question: questionById.get(r.question_id),
        enrollment: enrollmentById.get(r.enrollment_id)
      }));

      setResponses(enriched as any);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getParticipantName = (response: Response) => {
    if (response.enrollment?.participant_email) {
      return response.enrollment.participant_email;
    }
    return `Participant ${response.enrollment_id?.substring(0, 8) || 'Unknown'}`;
  };

  const getAnswerDisplay = (response: Response) => {
    if (response.response_text && response.response_text.trim().length > 0) {
      return response.response_text;
    }
    if (response.response_value !== null && response.response_value !== undefined) {
      if (typeof response.response_value === 'string') return response.response_value;
      if (Array.isArray(response.response_value)) return response.response_value.join(', ');
      return JSON.stringify(response.response_value);
    }
    return 'No response';
  };

  // Group responses by enrollment_id and instance_id for tabular display
  const groupedResponses = React.useMemo(() => {
    const groups: Record<string, Response[]> = {};
    responses.forEach(r => {
      const key = `${r.enrollment_id || 'unknown'}_${r.instance_id || 'default'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups).map(([key, resps]) => ({
      key,
      enrollmentId: resps[0]?.enrollment_id,
      instanceId: resps[0]?.instance_id,
      participantEmail: resps[0]?.enrollment?.participant_email,
      createdAt: resps[0]?.created_at,
      responses: resps
    }));
  }, [responses]);

  const exportToCSV = () => {
    if (groupedResponses.length === 0) return;

    // Get unique questions for columns
    const allQuestions = new Map<string, string>();
    responses.forEach(r => {
      if (r.question_id && r.survey_question?.question_text) {
        allQuestions.set(r.question_id, r.survey_question.question_text);
      }
    });
    const questionIds = Array.from(allQuestions.keys());
    const questionTexts = Array.from(allQuestions.values());

    const headers = ['Participant', 'Instance', 'Submitted At', ...questionTexts];
    const csvData = groupedResponses.map(group => {
      const row = [
        group.participantEmail || `Participant ${group.enrollmentId?.substring(0, 8) || 'Unknown'}`,
        group.instanceId || 'N/A',
        formatDate(group.createdAt)
      ];
      // Add answer for each question
      questionIds.forEach(qId => {
        const resp = group.responses.find(r => r.question_id === qId);
        row.push(resp ? getAnswerDisplay(resp) : '');
      });
      return row;
    });

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title || 'survey'}-responses.csv`;
    a.click();
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
        </div>
    );
  }

  if (!project) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Project Not Found</h2>
            <button
              onClick={() => navigate('/easyresearch/responses')}
              className="px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              Back to Responses
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen pb-20 md:pb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/easyresearch/responses')}
              className="flex items-center gap-2 mb-4 text-sm font-medium"
              style={{ color: 'var(--color-green)' }}
            >
              <ArrowLeft size={16} />
              Back to Responses
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              </div>
              <button
                onClick={exportToCSV}
                disabled={responses.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
                style={{ 
                  backgroundColor: responses.length > 0 ? 'var(--color-green)' : 'var(--border-light)',
                  opacity: responses.length > 0 ? 1 : 0.5
                }}
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} style={{ color: 'var(--color-green)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Submissions
              </h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
              {groupedResponses.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} style={{ color: 'var(--color-green)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Latest Submission
              </h3>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {groupedResponses.length > 0 ? formatDate(groupedResponses[0].createdAt) : 'No submissions yet'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Filter size={24} style={{ color: 'var(--color-green)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Total Answers
              </h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {responses.length}
            </p>
          </div>
        </div>

        {/* Responses List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            All Responses
          </h2>

          {groupedResponses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Responses Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Responses will appear here once participants complete the survey
              </p>
            </div>
          ) : (
            groupedResponses.map(group => (
              <div
                key={group.key}
                className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ border: '1px solid var(--border-light)' }}
                onClick={() => setSelectedResponse(group.responses[0])}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {group.participantEmail || `Participant ${group.enrollmentId?.substring(0, 8) || 'Unknown'}`}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Submitted {formatDate(group.createdAt)}
                      {group.instanceId && <span className="ml-2">• Instance: {group.instanceId.substring(0, 8)}</span>}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                    {group.responses.length} answers
                  </span>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Response Preview:
                  </p>
                  <div className="space-y-2">
                    {group.responses.slice(0, 3).map(r => (
                      <div key={r.id} className="text-sm p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {r.survey_question?.question_text?.substring(0, 50) || 'Question'}:
                        </span>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {getAnswerDisplay(r).substring(0, 100)}
                        </span>
                      </div>
                    ))}
                    {group.responses.length > 3 && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        +{group.responses.length - 3} more answers
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response Detail Modal */}
        {selectedResponse && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
            onClick={() => setSelectedResponse(null)}
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Response Details
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {getParticipantName(selectedResponse)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Submitted At:
                  </p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(selectedResponse.created_at)}
                  </p>
                </div>

                {selectedResponse.survey_question && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Question:
                    </p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedResponse.survey_question.question_text}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Answer:
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p style={{ color: 'var(--text-primary)' }}>{getAnswerDisplay(selectedResponse)}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedResponse(null)}
                className="mt-6 w-full px-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default SurveyResponses;
