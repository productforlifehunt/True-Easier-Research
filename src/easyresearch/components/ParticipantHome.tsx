import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Trophy, TrendingUp, Plus, ArrowRight, Calendar, CheckCircle, Circle, Users, ChevronRight, Loader2, Copy, Edit, Trash2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
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

  useEffect(() => { loadSurveys(); }, [user]);

  const loadSurveys = async () => {
    try {
      const { data: surveys } = await supabase
        .from('research_project').select('*').in('status', ['published', 'active']).order('created_at', { ascending: false });
      if (surveys) setAvailableSurveys(surveys);
      if (user) {
        const { data: enrollmentsData } = await supabase
          .from('enrollment').select('id, project_id, created_at, status').eq('participant_id', user.id).order('created_at', { ascending: false });
        if (enrollmentsData && enrollmentsData.length > 0) {
          const projectIds = Array.from(new Set(enrollmentsData.map((e: any) => e.project_id).filter(Boolean)));
          const { data: projectsData } = projectIds.length
            ? await supabase.from('research_project').select('id, title, description, project_type, study_duration, survey_frequency, status, survey_code').in('id', projectIds)
            : { data: [] as any[] };
          const projectById = new Map((projectsData || []).map((p: any) => [p.id, p]));
          setEnrolledSurveys((enrollmentsData as any[]).map((e: any) => ({ ...e, research_project: projectById.get(e.project_id) })) as any);
        } else { setEnrolledSurveys([]); }
      }
      if (user) {
        const { data: researcher } = await supabase.from('researcher').select('id').eq('user_id', user.id).maybeSingle();
        if (researcher) {
          const { data: myResearchData } = await supabase.from('research_project').select('*').eq('researcher_id', researcher.id).order('created_at', { ascending: false });
          if (myResearchData) setMyResearches(myResearchData);
        }
      }
    } catch (error) { console.error('Error loading surveys:', error); }
    finally { setLoading(false); }
  };

  const getSurveyFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = { hourly: 'Every hour', '2hours': 'Every 2 hours', '4hours': 'Every 4 hours', daily: 'Once daily', twice_daily: 'Twice daily' };
    return labels[frequency] || frequency;
  };

  const handleEnrolledSurveyClick = (enrollment: Enrollment) => {
    navigate(`/easyresearch/participant/${enrollment.project_id}`);
  };

  const handleAvailableSurveyClick = (surveyId: string) => { navigate(`/easyresearch/participant/${surveyId}`); };
  const handleMyResearchClick = (researchId: string) => { navigate(`/easyresearch/mobile/edit/${researchId}`); };
  const handleViewResponses = (researchId: string, e: React.MouseEvent) => { e.stopPropagation(); navigate(`/easyresearch/project/${researchId}/responses`); };
  const handleCreateNewResearch = () => { setShowCreateModal(true); };

  const handleCreateResearch = async () => {
    setCreateError('');
    if (!newResearch.title.trim()) { setCreateError('Please enter a research title'); return; }
    if (!newResearch.description.trim()) { setCreateError('Please enter a research description'); return; }
    try {
      if (!user) { setCreateError('Please sign in to create a research project'); return; }
      let researcherId = null; let organizationId = null;
      const { data: researcher } = await supabase.from('researcher').select('id, organization_id').eq('user_id', user.id).maybeSingle();
      if (researcher) { researcherId = researcher.id; organizationId = researcher.organization_id; }
      else {
        let { data: org } = await supabase.from('organization').select('id').limit(1).maybeSingle();
        if (!org) { const { data: newOrg } = await supabase.from('organization').insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' }).select('id').single(); org = newOrg; }
        const { data: newResearcher } = await supabase.from('researcher').insert({ user_id: user.id, organization_id: org?.id, role: 'researcher' }).select('id').single();
        if (newResearcher) { researcherId = newResearcher.id; organizationId = org?.id; }
      }
      if (!researcherId) { setCreateError('Failed to create researcher profile'); return; }
      const surveyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: project, error } = await supabase.from('research_project').insert({
        researcher_id: researcherId, organization_id: organizationId, title: newResearch.title, description: newResearch.description,
        project_type: newResearch.project_type, status: 'draft', survey_code: surveyCode, study_duration: newResearch.study_duration,
        survey_frequency: newResearch.survey_frequency, start_at: newResearch.starts_at, end_at: newResearch.ends_at,
        max_participant: newResearch.max_participants, compensation_amount: newResearch.compensation_amount,
        compensation_type: newResearch.compensation_type, ai_enabled: newResearch.ai_enabled, voice_enabled: newResearch.voice_enabled,
        notification_enabled: newResearch.notification_enabled, allow_participant_dnd: newResearch.allow_participant_dnd,
        onboarding_required: newResearch.onboarding_required, onboarding_instruction: newResearch.onboarding_instructions
      }).select().single();
      if (error) throw error;
      if (project) {
        await loadSurveys();
        setNewResearch({ title: '', description: '', project_type: 'survey', study_duration: 7, survey_frequency: 'daily', starts_at: null, ends_at: null, max_participants: null, compensation_amount: null, compensation_type: 'cash', ai_enabled: false, voice_enabled: false, notification_enabled: true, allow_participant_dnd: true, onboarding_required: false, onboarding_instructions: null });
        setShowCreateModal(false);
      }
    } catch (error: any) { console.error('Error creating research:', error); setCreateError(error?.message || 'Failed to create research project.'); }
  };

  const handleDeleteResearch = async (researchId: string) => {
    if (!confirm('Are you sure you want to delete this research project?')) return;
    try {
      const { data: questions } = await supabase.from('survey_question').select('id').eq('project_id', researchId);
      const questionIds = (questions || []).map(q => q.id);
      if (questionIds.length > 0) await supabase.from('question_option').delete().in('question_id', questionIds);
      await supabase.from('survey_respons').delete().eq('project_id', researchId);
      await supabase.from('survey_question').delete().eq('project_id', researchId);
      await supabase.from('survey_instance').delete().eq('project_id', researchId);
      const { data: enrollments } = await supabase.from('enrollment').select('id').eq('project_id', researchId);
      if (enrollments && enrollments.length > 0) {
        const enrollmentIds = enrollments.map(e => e.id);
        await supabase.from('compliance_tracking').delete().in('enrollment_id', enrollmentIds);
      }
      await supabase.from('enrollment').delete().eq('project_id', researchId);
      await supabase.from('research_project').delete().eq('id', researchId);
      setMyResearches(prev => prev.filter(r => r.id !== researchId));
      toast.success('Research project deleted');
    } catch (error) { console.error('Error deleting research:', error); toast.error('Failed to delete research project'); }
  };

  const handleJoinResearch = async () => {
    setJoinError('');
    const input = joinInput.trim();
    if (!input) { setJoinError('Please enter a survey code or link'); return; }
    try {
      let projectId = '';
      if (input.includes('http') || input.includes('/')) {
        const match = input.match(/participant\/([a-f0-9-]+)/);
        if (match) projectId = match[1];
      } else {
        const { data: project } = await supabase.from('research_project').select('id').eq('survey_code', input.toUpperCase()).in('status', ['published', 'active']).maybeSingle();
        if (project) projectId = project.id;
      }
      if (!projectId) { setJoinError('Invalid survey code or link'); return; }
      setShowJoinModal(false); setJoinInput('');
      navigate(`/easyresearch/participant/${projectId}`);
    } catch (error) { console.error('Error joining research:', error); setJoinError('Failed to join research.'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-3" size={32} />
          <p className="text-[13px] text-stone-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'joined' as const, label: 'Joined' },
    { key: 'available' as const, label: 'Available' },
    { key: 'my-research' as const, label: 'My Research' },
  ];

  return (
    <>
    <div className="pb-4 md:pb-8 bg-stone-50/50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">Research Hub</h1>
          <p className="text-[13px] text-stone-400 font-light mt-0.5">Participate in studies or create your own</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 rounded-full p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'joined' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full rounded-2xl py-3.5 text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-200/50 transition-all"
            >
              <Plus size={16} /> Join Research by Code or Link
            </button>

            {enrolledSurveys.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} className="text-stone-300" />
                </div>
                <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Joined Researches</h2>
                <p className="text-[13px] text-stone-400 font-light">Browse available researches to participate</p>
              </div>
            ) : (
              enrolledSurveys.map(enrollment => (
                <div
                  key={enrollment.id}
                  onClick={() => handleEnrolledSurveyClick(enrollment)}
                  className="bg-white rounded-2xl border border-stone-100 p-5 cursor-pointer hover:shadow-md hover:shadow-stone-100 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-stone-800">{enrollment.research_project?.title || 'Untitled'}</h3>
                      <p className="text-[12px] text-stone-400 font-light mt-0.5">{enrollment.research_project?.description?.substring(0, 80) || ''}</p>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-400 transition-colors mt-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      {enrollment.research_project?.project_type || 'survey'}
                    </span>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      enrollment.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-3">
            {availableSurveys.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} className="text-stone-300" />
                </div>
                <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Available Researches</h2>
                <p className="text-[13px] text-stone-400 font-light">Check back later for new studies</p>
              </div>
            ) : (
              availableSurveys.map(survey => (
                <div
                  key={survey.id}
                  onClick={() => handleAvailableSurveyClick(survey.id)}
                  className="bg-white rounded-2xl border border-stone-100 p-5 cursor-pointer hover:shadow-md hover:shadow-stone-100 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[15px] font-semibold text-stone-800 flex-1">{survey.title}</h3>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-400 transition-colors mt-1" />
                  </div>
                  <p className="text-[12px] text-stone-400 font-light mb-3 line-clamp-2">{survey.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-50 text-stone-500">{survey.project_type}</span>
                    {survey.study_duration && (
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock size={10} /> {survey.study_duration} days
                      </span>
                    )}
                    {survey.survey_code && (
                      <span className="text-[11px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{survey.survey_code}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'my-research' && (
          <div className="space-y-3">
            <button
              onClick={handleCreateNewResearch}
              className="w-full rounded-2xl py-3.5 text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-200/50 transition-all"
            >
              <Plus size={16} /> Create New Research
            </button>

            {myResearches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={24} className="text-stone-300" />
                </div>
                <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Researches Yet</h2>
                <p className="text-[13px] text-stone-400 font-light">Create your first research project</p>
              </div>
            ) : (
              myResearches.map(research => (
                <div
                  key={research.id}
                  onClick={() => handleMyResearchClick(research.id)}
                  className="bg-white rounded-2xl border border-stone-100 p-5 cursor-pointer hover:shadow-md hover:shadow-stone-100 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[15px] font-semibold text-stone-800 flex-1">{research.title}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => handleViewResponses(research.id, e)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                        <BarChart3 size={14} className="text-stone-400" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteResearch(research.id); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-stone-400 font-light mb-3 line-clamp-1">{research.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      research.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {research.status || 'draft'}
                    </span>
                    {research.survey_code && (
                      <span className="text-[11px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{research.survey_code}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>

    {/* Join Modal */}
    {showJoinModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowJoinModal(false)}>
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-stone-800 mb-1">Join Research</h2>
          <p className="text-[13px] text-stone-400 font-light mb-5">Enter survey code or paste a link</p>
          <input
            type="text"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="e.g., ABC123"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all bg-stone-50/50"
            autoFocus
          />
          {joinError && <p className="text-[12px] text-red-500 mt-2">{joinError}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowJoinModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
            <button onClick={handleJoinResearch} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-medium hover:shadow-lg transition-all">Join</button>
          </div>
        </div>
      </div>
    )}

    {/* Create Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Create New Research</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Title</label>
              <input type="text" value={newResearch.title} onChange={(e) => setNewResearch({ ...newResearch, title: e.target.value })}
                placeholder="Research title" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Description</label>
              <textarea value={newResearch.description} onChange={(e) => setNewResearch({ ...newResearch, description: e.target.value })}
                placeholder="Brief description" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Type</label>
              <select value={newResearch.project_type} onChange={(e) => setNewResearch({ ...newResearch, project_type: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                <option value="survey">One-time Survey</option>
                <option value="longitudinal">Longitudinal Study</option>
                <option value="esm">Experience Sampling (ESM)</option>
              </select>
            </div>
          </div>
          {createError && <p className="text-[12px] text-red-500 mt-3">{createError}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
            <button onClick={handleCreateResearch} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-medium hover:shadow-lg transition-all">Create</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ParticipantHome;
