import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, Trophy, TrendingUp, Plus, ArrowRight, Calendar, CheckCircle, Circle, Users, ChevronRight, Loader2, Copy, Edit, Trash2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface Survey {
  id: string;
  title: string;
  description: string;
  study_duration: number;
  survey_frequency: string;
  participant_count: number;
  compensation?: string;
  project_type: string;
  duration_days?: number;
  status?: string;
  researcher_id?: string;
  created_at?: string;
  survey_code?: string;
}

interface Enrollment {
  id: string;
  project_id: string;
  created_at: string;
  status: string;
  research_project: Survey;
}

const ParticipantHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'joined' | 'available' | 'my-research'>('joined');
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [enrolledSurveys, setEnrolledSurveys] = useState<Enrollment[]>([]);
  const [myResearches, setMyResearches] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResearch, setNewResearch] = useState({
    title: '',
    description: '',
    project_type: 'survey' as 'survey' | 'longitudinal' | 'esm',
    study_duration: 7,
    survey_frequency: 'daily',
    starts_at: null as string | null,
    ends_at: null as string | null,
    max_participants: null as number | null,
    compensation_amount: null as number | null,
    compensation_type: 'cash' as string | null,
    ai_enabled: false,
    voice_enabled: false,
    notification_enabled: true,
    allow_participant_dnd: true,
    onboarding_required: false,
    onboarding_instructions: '' as string | null
  });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadSurveys();
  }, [user]);

  const loadSurveys = async () => {
    try {
      // Load all published surveys for Available tab
      const { data: surveys } = await supabase
        .from('research_project')
        .select('*')
        .in('status', ['published', 'active'])
        .order('created_at', { ascending: false });

      if (surveys) {
        setAvailableSurveys(surveys);
      }

      // Load user's enrollments for Joined tab
      if (user) {
        const { data: enrollmentsData } = await supabase
          .from('enrollment')
          .select('id, project_id, created_at, status')
          .eq('participant_id', user.id)
          .order('created_at', { ascending: false });

        if (enrollmentsData && enrollmentsData.length > 0) {
          const projectIds = Array.from(new Set(enrollmentsData.map((e: any) => e.project_id).filter(Boolean)));
          const { data: projectsData } = projectIds.length
            ? await supabase
                .from('research_project')
                .select('id, title, description, project_type, study_duration, survey_frequency, status, survey_code')
                .in('id', projectIds)
            : { data: [] as any[] };

          const projectById = new Map((projectsData || []).map((p: any) => [p.id, p]));
          setEnrolledSurveys(
            (enrollmentsData as any[]).map((e: any) => ({
              ...e,
              research_project: projectById.get(e.project_id)
            })) as any
          );
        } else {
          setEnrolledSurveys([]);
        }
      }


      // Load user's created researches for My Research tab
      if (user) {
        // First get researcher record - use maybeSingle to avoid error when no record
        const { data: researcher } = await supabase
          .from('researcher')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (researcher) {
          const { data: myResearchData } = await supabase
            .from('research_project')
            .select('*')
            .eq('researcher_id', researcher.id)
            .order('created_at', { ascending: false });

          if (myResearchData) {
            setMyResearches(myResearchData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSurveyFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      hourly: 'Every hour',
      '2hours': 'Every 2 hours',
      '4hours': 'Every 4 hours',
      daily: 'Once daily',
      twice_daily: 'Twice daily'
    };
    return labels[frequency] || frequency;
  };

  const handleEnrolledSurveyClick = (enrollment: Enrollment) => {
    const project = enrollment.research_project;
    if (project.project_type === 'longitudinal') {
      navigate(`/easyresearch/participant/${enrollment.project_id}/timeline`);
    } else if (project.project_type === 'esm' || project.project_type === 'ema') {
      navigate(`/easyresearch/participant/${enrollment.project_id}/dashboard`);
    } else {
      // One-time survey → go to survey view
      navigate(`/easyresearch/participant/${enrollment.project_id}`);
    }
  };

  const handleAvailableSurveyClick = (surveyId: string) => {
    navigate(`/easyresearch/participant/${surveyId}`);
  };

  const handleMyResearchClick = (researchId: string) => {
    navigate(`/easyresearch/mobile/edit/${researchId}`);
  };

  const handleViewResponses = (researchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/easyresearch/project/${researchId}/responses`);
  };

  const handleCreateNewResearch = () => {
    setShowCreateModal(true);
  };

  const handleCreateResearch = async () => {
    setCreateError('');
    
    if (!newResearch.title.trim()) {
      setCreateError('Please enter a research title');
      return;
    }
    
    if (!newResearch.description.trim()) {
      setCreateError('Please enter a research description');
      return;
    }

    try {
      if (!user) {
        setCreateError('Please sign in to create a research project');
        return;
      }

      // Get or create researcher record
      let researcherId = null;
      let organizationId = null;
      const { data: researcher } = await supabase
        .from('researcher')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (researcher) {
        researcherId = researcher.id;
        organizationId = researcher.organization_id;
      } else {
        let { data: org } = await supabase
          .from('organization')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (!org) {
          const { data: newOrg } = await supabase
            .from('organization')
            .insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' })
            .select('id')
            .single();
          org = newOrg;
        }

        // Create researcher record
        const { data: newResearcher } = await supabase
          .from('researcher')
          .insert({
            user_id: user.id,
            organization_id: org?.id,
            role: 'researcher',
            
          })
          .select('id')
          .single();
        
        if (newResearcher) {
          researcherId = newResearcher.id;
          organizationId = org?.id;
        }
      }

      if (!researcherId) {
        setCreateError('Failed to create researcher profile');
        return;
      }

      // Generate unique survey code
      const surveyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: project, error } = await supabase
        .from('research_project')
        .insert({
          researcher_id: researcherId,
          organization_id: organizationId,
          title: newResearch.title,
          description: newResearch.description,
          project_type: newResearch.project_type,
          status: 'draft',
          survey_code: surveyCode,
          study_duration: newResearch.study_duration,
          survey_frequency: newResearch.survey_frequency,
          start_at: newResearch.starts_at,
          end_at: newResearch.ends_at,
          max_participant: newResearch.max_participants,
          compensation_amount: newResearch.compensation_amount,
          compensation_type: newResearch.compensation_type,
          ai_enabled: newResearch.ai_enabled,
          voice_enabled: newResearch.voice_enabled,
          notification_enabled: newResearch.notification_enabled,
          allow_participant_dnd: newResearch.allow_participant_dnd,
          onboarding_required: newResearch.onboarding_required,
          onboarding_instruction: newResearch.onboarding_instructions
        })
        .select()
        .single();

      if (error) throw error;

      if (project) {
        // Refresh the list
        await loadSurveys();
        
        // Reset form and close modal
        setNewResearch({
          title: '',
          description: '',
          project_type: 'survey',
          study_duration: 7,
          survey_frequency: 'daily',
          starts_at: null,
          ends_at: null,
          max_participants: null,
          compensation_amount: null,
          compensation_type: 'cash',
          ai_enabled: false,
          voice_enabled: false,
          notification_enabled: true,
          allow_participant_dnd: true,
          onboarding_required: false,
          onboarding_instructions: null
        });
        setShowCreateModal(false);
        
        // Stay on mobile page - research created successfully
      }
    } catch (error: any) {
      console.error('Error creating research:', error);
      const errorMessage = error?.message || 'Failed to create research project. Please try again.';
      setCreateError(errorMessage);
    }
  };

  const handleDeleteResearch = async (researchId: string) => {
    if (!confirm('Are you sure you want to delete this research project? This will also delete all questions, options, enrollments, and responses.')) return;
    
    try {
      // Get question IDs for this project to delete their options
      const { data: questions } = await supabase
        .from('survey_question')
        .select('id')
        .eq('project_id', researchId);
      
      const questionIds = (questions || []).map(q => q.id);
      
      // Cascade delete in correct order
      if (questionIds.length > 0) {
        await supabase.from('question_option').delete().in('question_id', questionIds);
      }
      await supabase.from('survey_respons').delete().eq('project_id', researchId);
      await supabase.from('survey_question').delete().eq('project_id', researchId);
      await supabase.from('survey_instance').delete().eq('project_id', researchId);

      // Delete compliance_tracking records linked to enrollments
      const { data: enrollments } = await supabase
        .from('enrollment')
        .select('id')
        .eq('project_id', researchId);
      if (enrollments && enrollments.length > 0) {
        const enrollmentIds = enrollments.map(e => e.id);
        await supabase.from('compliance_tracking').delete().in('enrollment_id', enrollmentIds);
      }

      await supabase.from('enrollment').delete().eq('project_id', researchId);
      await supabase.from('research_project').delete().eq('id', researchId);
      
      setMyResearches(prev => prev.filter(r => r.id !== researchId));
      toast.success('Research project deleted');
    } catch (error) {
      console.error('Error deleting research:', error);
      toast.error('Failed to delete research project');
    }
  };

  const handleJoinResearch = async () => {
    setJoinError('');
    const input = joinInput.trim();
    
    if (!input) {
      setJoinError('Please enter a survey code or link');
      return;
    }

    try {
      let projectId = '';

      // Check if input is a URL
      if (input.includes('http') || input.includes('/')) {
        // Extract project ID from URL
        const match = input.match(/participant\/([a-f0-9-]+)/);
        if (match) {
          projectId = match[1];
        }
      } else {
        // Input is a survey code
        const { data: project } = await supabase
          .from('research_project')
          .select('id')
          .eq('survey_code', input.toUpperCase())
          .in('status', ['published', 'active'])
          .maybeSingle();

        if (project) {
          projectId = project.id;
        }
      }

      if (!projectId) {
        setJoinError('Invalid survey code or link');
        return;
      }

      // Navigate to enrollment page
      setShowJoinModal(false);
      setJoinInput('');
      navigate(`/easyresearch/participant/${projectId}`);
    } catch (error) {
      console.error('Error joining research:', error);
      setJoinError('Failed to join research. Please check your code or link.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading available surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen pb-20 md:pb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Easier-research Platform
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Participate in research or manage your studies
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={() => setActiveTab('joined')}
            className="flex-1 px-6 py-3 font-medium transition-all text-center"
            style={{
              color: activeTab === 'joined' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'joined' ? '2px solid var(--color-green)' : '2px solid transparent'
            }}
          >
            My Joined Researches
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className="flex-1 px-6 py-3 font-medium transition-all text-center"
            style={{
              color: activeTab === 'available' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'available' ? '2px solid var(--color-green)' : '2px solid transparent'
            }}
          >
            Available Researches
          </button>
          <button
            onClick={() => setActiveTab('my-research')}
            className="flex-1 px-6 py-3 font-medium transition-all text-center"
            style={{
              color: activeTab === 'my-research' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'my-research' ? '2px solid var(--color-green)' : '2px solid transparent'
            }}
          >
            My Researches
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'joined' && (
          <div className="space-y-4">
            {/* Join by Code/Link Button */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full rounded-xl py-4 font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <Plus size={20} />
              Join Research by Code or Link
            </button>

            {enrolledSurveys.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Joined Researches
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Browse available researches to participate
                </p>
              </div>
            ) : (
              enrolledSurveys.map(enrollment => (
                <div
                  key={enrollment.id}
                  onClick={() => handleEnrolledSurveyClick(enrollment)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ border: '2px solid var(--color-green)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {enrollment.research_project.title}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {enrollment.research_project.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Enrolled On</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Type</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {enrollment.research_project.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Status</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {enrollment.status}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Survey Code:</span>
                    <code className="px-2 py-1 rounded text-sm font-mono" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                      {enrollment.research_project.survey_code || 'N/A'}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(enrollment.research_project.survey_code || '');
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Copy size={16} style={{ color: 'var(--color-green)' }} />
                    </button>
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Share Link:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={`${window.location.origin}/easyresearch/participant/${enrollment.project_id}`}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg text-sm"
                        style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLInputElement).select();
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}/easyresearch/participant/${enrollment.project_id}`);
                        }}
                        className="px-3 py-2 rounded-lg font-medium text-white"
                        style={{ backgroundColor: 'var(--color-green)' }}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableSurveys.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Available Researches
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Check back later for new research opportunities
                </p>
              </div>
            ) : (
              availableSurveys.map(survey => (
                <div
                  key={survey.id}
                  onClick={() => handleAvailableSurveyClick(survey.id)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ border: '1px solid var(--border-light)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {survey.title}
                      </h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {survey.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p style={{ color: 'var(--text-secondary)' }}>Duration</p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {survey.duration_days || survey.study_duration} days
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)' }}>Frequency</p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {getSurveyFrequencyLabel(survey.survey_frequency)}
                      </p>
                    </div>
                    {survey.compensation && (
                      <div>
                        <p style={{ color: 'var(--text-secondary)' }}>Reward</p>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {survey.compensation}
                        </p>
                      </div>
                    )}
                    <div>
                      <p style={{ color: 'var(--text-secondary)' }}>Type</p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {survey.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Survey Code:</span>
                      <code className="px-2 py-1 rounded text-sm font-mono" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                        {survey.survey_code || 'N/A'}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(survey.survey_code || '');
                        }}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Copy size={16} style={{ color: 'var(--color-green)' }} />
                      </button>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Share Link:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={`${window.location.origin}/easyresearch/participant/${survey.id}`}
                          readOnly
                          className="flex-1 px-3 py-2 rounded-lg text-sm"
                          style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            (e.target as HTMLInputElement).select();
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/easyresearch/participant/${survey.id}`);
                          }}
                          className="px-3 py-2 rounded-lg font-medium text-white"
                          style={{ backgroundColor: 'var(--color-green)' }}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'my-research' && (
          <div className="space-y-4">
            <button
              onClick={handleCreateNewResearch}
              className="w-full bg-white rounded-2xl p-6 flex items-center justify-center gap-3 hover:shadow-lg transition-shadow"
              style={{ border: '2px dashed var(--color-green)' }}
            >
              <Plus size={24} style={{ color: 'var(--color-green)' }} />
              <span className="font-semibold" style={{ color: 'var(--color-green)' }}>
                Create New Research Project
              </span>
            </button>

            {myResearches.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Research Projects
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Create your first research project to get started
                </p>
              </div>
            ) : (
              myResearches.map(research => (
                <div
                  key={research.id}
                  className="bg-white rounded-2xl p-6"
                  style={{ border: '1px solid var(--border-light)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {research.title}
                      </h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {research.description}
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-full text-xs" 
                          style={{ 
                            backgroundColor: research.status === 'published' ? '#dcfce7' : '#fef3c7',
                            color: research.status === 'published' ? '#166534' : '#854d0e'
                          }}>
                          {research.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMyResearchClick(research.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Edit size={20} style={{ color: 'var(--color-green)' }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResearch(research.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 size={20} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p style={{ color: 'var(--text-secondary)' }}>Created</p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {research.created_at ? new Date(research.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)' }}>Type</p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {research.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)' }}>Participants</p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {research.participant_count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Survey Code and Link */}
                  <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Survey Code:</span>
                      <code className="px-2 py-1 rounded text-sm font-mono" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                        {research.survey_code || 'N/A'}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(research.survey_code || '');
                          toast.success('Survey code copied!');
                        }}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Copy code"
                      >
                        <Copy size={16} style={{ color: 'var(--color-green)' }} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Survey Link:</span>
                      <code className="px-2 py-1 rounded text-xs flex-1 truncate" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                        {`${window.location.origin}/easyresearch/participant/${research.id}`}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/easyresearch/participant/${research.id}`);
                          toast.success('Survey link copied!');
                        }}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Copy link"
                      >
                        <Copy size={16} style={{ color: 'var(--color-green)' }} />
                      </button>
                    </div>
                  </div>

                  {/* Responses Section */}
                  <button
                    onClick={(e) => handleViewResponses(research.id, e)}
                    className="w-full mt-4 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all"
                    style={{ backgroundColor: '#f0fdf4', border: '1px solid var(--color-green)' }}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 size={24} style={{ color: 'var(--color-green)' }} />
                      <div className="text-left">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>View Responses</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Click to see all participant responses</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--color-green)' }}>→</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>

    {/* Create Research Modal */}
    {showCreateModal && (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
        onClick={() => {
          setShowCreateModal(false);
          setNewResearch({
            title: '',
            description: '',
            project_type: 'survey',
            study_duration: 7,
            survey_frequency: 'daily',
            starts_at: null,
            ends_at: null,
            max_participants: null,
            compensation_amount: null,
            compensation_type: 'cash',
            ai_enabled: false,
            voice_enabled: false,
            notification_enabled: true,
            allow_participant_dnd: true,
            onboarding_required: false,
            onboarding_instructions: null
          });
          setCreateError('');
        }}
      >
        <div
          className="bg-white rounded-2xl p-8 w-11/12 max-w-md max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Create New Research
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Fill in the details to create your research project
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Research Title
              </label>
              <input
                type="text"
                value={newResearch.title}
                onChange={(e) => setNewResearch({ ...newResearch, title: e.target.value })}
                placeholder="e.g., Daily Mood Assessment"
                className="w-full px-4 py-3 rounded-lg"
                style={{ border: '2px solid var(--border-light)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Description
              </label>
              <textarea
                value={newResearch.description}
                onChange={(e) => setNewResearch({ ...newResearch, description: e.target.value })}
                placeholder="Describe your research study..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg"
                style={{ border: '2px solid var(--border-light)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Project Type
              </label>
              <select
                value={newResearch.project_type}
                onChange={(e) => setNewResearch({ ...newResearch, project_type: e.target.value as 'survey' | 'longitudinal' | 'esm' })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ border: '2px solid var(--border-light)' }}
              >
                <option value="survey">One-time Survey</option>
                <option value="longitudinal">Longitudinal Study</option>
                <option value="esm">Experience Sampling (ESM)</option>
              </select>
            </div>

            {(newResearch.project_type === 'longitudinal' || newResearch.project_type === 'esm') && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={newResearch.study_duration}
                    onChange={(e) => setNewResearch({ ...newResearch, study_duration: parseInt(e.target.value) || 7 })}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{ border: '2px solid var(--border-light)' }}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Survey Frequency
                  </label>
                  <select
                    value={newResearch.survey_frequency}
                    onChange={(e) => setNewResearch({ ...newResearch, survey_frequency: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{ border: '2px solid var(--border-light)' }}
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="daily">Daily</option>
                    <option value="twice_weekly">Twice Weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="every_4_hours">Every 4 Hours</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {createError && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
              {createError}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewResearch({
                  title: '',
                  description: '',
                  project_type: 'survey',
                  study_duration: 7,
                  survey_frequency: 'daily',
                  starts_at: null,
                  ends_at: null,
                  max_participants: null,
                  compensation_amount: null,
                  compensation_type: 'cash',
                  ai_enabled: false,
                  voice_enabled: false,
                  notification_enabled: true,
                  allow_participant_dnd: true,
                  onboarding_required: false,
                  onboarding_instructions: null
                });
                setCreateError('');
              }}
              className="flex-1 px-6 py-3 rounded-lg font-semibold"
              style={{ border: '2px solid var(--border-light)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateResearch}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Join Research Modal */}
    {showJoinModal && (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
        onClick={() => {
          setShowJoinModal(false);
          setJoinInput('');
          setJoinError('');
        }}
      >
        <div
          className="bg-white rounded-2xl p-8 w-11/12 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Join Research Study
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Enter a survey code or paste the survey link below
          </p>

          <input
            type="text"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="Enter code (e.g., 900AF2) or paste link"
            className="w-full px-4 py-3 rounded-lg mb-4"
            style={{ border: '2px solid var(--border-light)' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleJoinResearch();
              }
            }}
          />

          {joinError && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
              {joinError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowJoinModal(false);
                setJoinInput('');
                setJoinError('');
              }}
              className="flex-1 px-6 py-3 rounded-lg font-semibold"
              style={{ border: '2px solid var(--border-light)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleJoinResearch}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    )
    }
    </>
  );
};

export default ParticipantHome;
