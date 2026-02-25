import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Users, Calendar, Download, Filter } from 'lucide-react';

interface Response {
  id: string;
  participant_id: string;
  created_at: string;
  answers: any;
  completion_time?: number;
  profiles?: {
    email?: string;
    full_name?: string;
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
        .from('research_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setProject(projectData);
      }

      // Load survey responses
      const { data: responsesData } = await supabase
        .from('survey_responses')
        .select(`
          id,
          participant_id,
          created_at,
          answers,
          completion_time,
          profiles:participant_id (
            email,
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (responsesData) {
        setResponses(responsesData as any);
      }
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
    if (response.profiles?.full_name) {
      return response.profiles.full_name;
    }
    if (response.profiles?.email) {
      return response.profiles.email;
    }
    return `Participant ${response.participant_id.substring(0, 8)}`;
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;

    const headers = ['Participant', 'Submitted At', 'Completion Time (s)', 'Answers'];
    const csvData = responses.map(r => [
      getParticipantName(r),
      formatDate(r.created_at),
      r.completion_time || 'N/A',
      JSON.stringify(r.answers)
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
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
            onClick={() => navigate('/easyresearch')}
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            Back to Home
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
            onClick={() => navigate('/easyresearch')}
            className="flex items-center gap-2 mb-4 text-sm font-medium"
            style={{ color: 'var(--color-green)' }}
          >
            <ArrowLeft size={16} />
            Back to My Researches
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
                Total Responses
              </h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
              {responses.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} style={{ color: 'var(--color-green)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Latest Response
              </h3>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {responses.length > 0 ? formatDate(responses[0].created_at) : 'No responses yet'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Filter size={24} style={{ color: 'var(--color-green)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Avg. Completion
              </h3>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {responses.length > 0 
                ? `${Math.round(responses.reduce((sum, r) => sum + (r.completion_time || 0), 0) / responses.length)}s`
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Responses List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            All Responses
          </h2>

          {responses.length === 0 ? (
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
            responses.map(response => (
              <div
                key={response.id}
                className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ border: '1px solid var(--border-light)' }}
                onClick={() => setSelectedResponse(response)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {getParticipantName(response)}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Submitted {formatDate(response.created_at)}
                    </p>
                  </div>
                  {response.completion_time && (
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                      {response.completion_time}s
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Response Preview:
                  </p>
                  <pre className="text-sm p-3 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {JSON.stringify(response.answers, null, 2)}
                  </pre>
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

              {selectedResponse.completion_time && (
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Completion Time:
                  </p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedResponse.completion_time} seconds
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Response:
                </p>
                <pre className="p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {JSON.stringify(selectedResponse.answers, null, 2)}
                </pre>
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
