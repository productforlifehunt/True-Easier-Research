import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, Download, Filter, Calendar, User, CheckCircle } from 'lucide-react';

interface Response {
  id: string;
  enrollment_id: string;
  question_id: string;
  answer_text: string;
  answer_number: number;
  answer_array: string[];
  created_at: string;
  enrollment: {
    participant_number: string;
    profile_data: any;
  };
  project: {
    id: string;
    title: string;
  };
  question: {
    question_text: string;
    question_type: string;
  };
}

const ResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<Response[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, [selectedProject]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      
      // Load researcher's projects
      const { data: projectData } = await supabase
        .from('research_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectData) {
        setProjects(projectData);
      }

      // Load responses
      let query = supabase
        .from('survey_responses')
        .select(`
          *,
          enrollment:enrollments(
            participant_number,
            profile_data
          ),
          question:survey_questions(
            question_text,
            question_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedProject !== 'all') {
        query = query.eq('project_id', selectedProject);
      }

      const { data: responseData } = await query;
      
      if (responseData) {
        // Group responses with project info
        const enrichedResponses = responseData.map(response => ({
          ...response,
          project: projectData?.find(p => p.id === response.project_id)
        }));
        setResponses(enrichedResponses);
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
      r.enrollment?.participant_number || 'Anonymous',
      r.question?.question_text || 'Unknown',
      r.answer_text || r.answer_number || (r.answer_array || []).join(', ')
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
            <div className="p-8 text-center">
              <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Responses Yet
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Responses will appear here as participants complete surveys
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
                      className="border-b hover:bg-gray-50"
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
                          {response.enrollment?.participant_number || 'Anonymous'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {response.question?.question_text || 'Unknown'}
                        </p>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                          {response.question?.question_type || 'text'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {response.answer_text || 
                           response.answer_number || 
                           (response.answer_array || []).join(', ') || 
                           '-'}
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
