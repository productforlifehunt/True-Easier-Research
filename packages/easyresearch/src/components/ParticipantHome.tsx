import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  FileText, Clock, Plus, Edit, Trash2, Copy, BarChart3, 
  Users, TrendingUp, Zap, Settings2, Eye, EyeOff, X,
  ChevronRight, GripVertical
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ── Types ──────────────────────────────────────────────
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
  current_participants?: number;
  max_participants?: number;
}

interface Enrollment {
  id: string;
  project_id: string;
  created_at: string;
  status: string;
  research_projects: Survey;
}

type SectionKey = 'stats' | 'joined' | 'available' | 'my-research';

interface DashboardPrefs {
  visibleSections: SectionKey[];
  defaultTab: SectionKey;
}

const DEFAULT_PREFS: DashboardPrefs = {
  visibleSections: ['stats', 'joined', 'available', 'my-research'],
  defaultTab: 'joined'
};

const SECTION_LABELS: Record<SectionKey, string> = {
  'stats': 'Quick Stats',
  'joined': 'My Joined Studies',
  'available': 'Available Studies',
  'my-research': 'My Research Projects'
};

const SECTION_ICONS: Record<SectionKey, React.ReactNode> = {
  'stats': <BarChart3 size={16} />,
  'joined': <FileText size={16} />,
  'available': <Users size={16} />,
  'my-research': <Zap size={16} />
};

// ── Helpers ────────────────────────────────────────────
const loadPrefs = (): DashboardPrefs => {
  try {
    const saved = localStorage.getItem('er-dashboard-prefs');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PREFS;
};

const savePrefs = (prefs: DashboardPrefs) => {
  localStorage.setItem('er-dashboard-prefs', JSON.stringify(prefs));
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

// ── Main Component ─────────────────────────────────────
const ParticipantHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [prefs, setPrefs] = useState<DashboardPrefs>(loadPrefs);
  const [activeTab, setActiveTab] = useState<SectionKey>(prefs.defaultTab === 'stats' ? 'joined' : prefs.defaultTab);
  const [showCustomize, setShowCustomize] = useState(false);
  
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [enrolledSurveys, setEnrolledSurveys] = useState<Enrollment[]>([]);
  const [myResearches, setMyResearches] = useState<Survey[]>([]);
  const [isResearcher, setIsResearcher] = useState(false);
  const [totalResponses, setTotalResponses] = useState(0);
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

  const updatePrefs = useCallback((newPrefs: DashboardPrefs) => {
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  }, []);

  const toggleSection = (key: SectionKey) => {
    const current = prefs.visibleSections;
    const updated = current.includes(key)
      ? current.filter(s => s !== key)
      : [...current, key];
    updatePrefs({ ...prefs, visibleSections: updated });
  };

  const isSectionVisible = (key: SectionKey) => prefs.visibleSections.includes(key);

  // Only show tabs that are visible
  const visibleTabs = (['joined', 'available', 'my-research'] as SectionKey[]).filter(t => isSectionVisible(t));

  useEffect(() => {
    loadSurveys();
  }, [user]);

  const loadSurveys = async () => {
    try {
      const { data: surveys } = await supabase
        .from('research_projects')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (surveys) setAvailableSurveys(surveys);

      if (user) {
        // Load enrollments
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select(`
            id, project_id, created_at, status,
            research_projects (
              id, title, description, project_type,
              study_duration, survey_frequency, status, survey_code
            )
          `)
          .eq('participant_id', user.id)
          .order('created_at', { ascending: false });

        if (enrollmentsData) setEnrolledSurveys(enrollmentsData as any);

        // Load researcher's projects
        const { data: researcher } = await supabase
          .from('researchers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (researcher) {
          setIsResearcher(true);
          const { data: myResearchData } = await supabase
            .from('research_projects')
            .select('*')
            .eq('researcher_id', researcher.id)
            .order('created_at', { ascending: false });

          if (myResearchData) {
            setMyResearches(myResearchData);
            // Load response count
            if (myResearchData.length > 0) {
              const { data: respData } = await supabase
                .from('survey_responses')
                .select('id', { count: 'exact' })
                .in('project_id', myResearchData.map(p => p.id));
              if (respData) setTotalResponses(respData.length);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Event Handlers ──────────────────────────────────
  const handleEnrolledSurveyClick = (enrollment: Enrollment) => {
    const project = enrollment.research_projects;
    if (project.project_type === 'longitudinal') {
      navigate(`/easyresearch/participant/${enrollment.project_id}/timeline`);
    } else {
      navigate(`/easyresearch/participant/${enrollment.project_id}/dashboard`);
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

  const handleDeleteResearch = async (researchId: string) => {
    if (!confirm('Are you sure you want to delete this research project?')) return;
    try {
      await supabase.from('research_projects').delete().eq('id', researchId);
      setMyResearches(prev => prev.filter(r => r.id !== researchId));
    } catch (error) {
      console.error('Error deleting research:', error);
    }
  };

  const handleCreateResearch = async () => {
    setCreateError('');
    if (!newResearch.title.trim()) { setCreateError('Please enter a research title'); return; }
    if (!newResearch.description.trim()) { setCreateError('Please enter a description'); return; }

    try {
      if (!user) { setCreateError('Please sign in'); return; }

      let researcherId = null;
      const { data: researcher } = await supabase
        .from('researchers').select('id').eq('user_id', user.id).single();

      if (researcher) {
        researcherId = researcher.id;
      } else {
        const { data: newR } = await supabase
          .from('researchers')
          .insert({ user_id: user.id, role: 'researcher', permissions: {} })
          .select('id').single();
        if (newR) researcherId = newR.id;
      }

      if (!researcherId) { setCreateError('Failed to create researcher profile'); return; }

      const surveyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: project, error } = await supabase
        .from('research_projects')
        .insert({
          researcher_id: researcherId,
          title: newResearch.title,
          description: newResearch.description,
          project_type: newResearch.project_type,
          status: 'draft',
          survey_code: surveyCode,
          study_duration: newResearch.study_duration,
          survey_frequency: newResearch.survey_frequency,
          starts_at: newResearch.starts_at,
          ends_at: newResearch.ends_at,
          max_participants: newResearch.max_participants,
          compensation_amount: newResearch.compensation_amount,
          compensation_type: newResearch.compensation_type,
          ai_enabled: newResearch.ai_enabled,
          voice_enabled: newResearch.voice_enabled,
          notification_enabled: newResearch.notification_enabled,
          allow_participant_dnd: newResearch.allow_participant_dnd,
          onboarding_required: newResearch.onboarding_required,
          onboarding_instructions: newResearch.onboarding_instructions,
          created_at: new Date().toISOString()
        })
        .select().single();

      if (error) throw error;
      if (project) {
        await loadSurveys();
        resetCreateForm();
        setShowCreateModal(false);
        setIsResearcher(true);
      }
    } catch (error: any) {
      console.error('Error creating research:', error);
      setCreateError(error?.message || 'Failed to create research project');
    }
  };

  const resetCreateForm = () => {
    setNewResearch({
      title: '', description: '', project_type: 'survey', study_duration: 7,
      survey_frequency: 'daily', starts_at: null, ends_at: null,
      max_participants: null, compensation_amount: null, compensation_type: 'cash',
      ai_enabled: false, voice_enabled: false, notification_enabled: true,
      allow_participant_dnd: true, onboarding_required: false, onboarding_instructions: null
    });
    setCreateError('');
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
        const { data: project } = await supabase
          .from('research_projects').select('id')
          .eq('survey_code', input.toUpperCase()).eq('status', 'published').single();
        if (project) projectId = project.id;
      }

      if (!projectId) { setJoinError('Invalid survey code or link'); return; }
      setShowJoinModal(false);
      setJoinInput('');
      navigate(`/easyresearch/participant/${projectId}`);
    } catch (error) {
      setJoinError('Failed to join research. Please check your code or link.');
    }
  };

  // ── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-green)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Computed Stats ──────────────────────────────────
  const activeProjects = myResearches.filter(p => p.status === 'active' || p.status === 'published').length;
  const totalParticipants = myResearches.reduce((sum, p) => sum + (p.current_participants || p.participant_count || 0), 0);

  return (
    <>
      <div className="min-h-screen pb-20 md:pb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* ── Header ─────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                My Dashboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isResearcher ? 'Manage your studies and participations' : 'Participate in research studies'}
              </p>
            </div>
            <button
              onClick={() => setShowCustomize(true)}
              className="p-2 rounded-xl hover:bg-white/80 transition-colors"
              style={{ border: '1px solid var(--border-light)' }}
              title="Customize dashboard"
            >
              <Settings2 size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* ── Stats Cards (togglable) ────────────── */}
          {isSectionVisible('stats') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} style={{ color: 'var(--color-green)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Joined</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{enrolledSurveys.length}</p>
              </div>

              {isResearcher && (
                <>
                  <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} style={{ color: 'var(--color-green)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>My Projects</span>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {myResearches.length}
                      {activeProjects > 0 && (
                        <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-green)' }}>
                          ({activeProjects} active)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} style={{ color: 'var(--color-green)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Participants</span>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalParticipants}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={16} style={{ color: 'var(--color-green)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Responses</span>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalResponses}</p>
                  </div>
                </>
              )}

              {!isResearcher && (
                <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} style={{ color: 'var(--color-green)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Available</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{availableSurveys.length}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Tabs ───────────────────────────────── */}
          {visibleTabs.length > 0 && (
            <div className="flex gap-0 mb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              {visibleTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 px-4 py-3 font-medium transition-all text-center text-sm"
                  style={{
                    color: activeTab === tab ? 'var(--color-green)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab ? '2px solid var(--color-green)' : '2px solid transparent'
                  }}
                >
                  {SECTION_LABELS[tab]}
                </button>
              ))}
            </div>
          )}

          {/* ── Tab: Joined ────────────────────────── */}
          {activeTab === 'joined' && isSectionVisible('joined') && (
            <div className="space-y-4">
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full rounded-xl py-4 font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <Plus size={20} /> Join Research by Code or Link
              </button>

              {enrolledSurveys.length === 0 ? (
                <EmptyState icon={<FileText size={48} />} title="No Joined Studies" description="Browse available studies to participate" />
              ) : (
                enrolledSurveys.map(enrollment => (
                  <div
                    key={enrollment.id}
                    onClick={() => handleEnrolledSurveyClick(enrollment)}
                    className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ border: '2px solid var(--color-green)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {enrollment.research_projects.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                        {enrollment.status}
                      </span>
                    </div>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {enrollment.research_projects.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>Enrolled {new Date(enrollment.created_at).toLocaleDateString()}</span>
                      <span>{enrollment.research_projects.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}</span>
                    </div>
                    <SurveyCodeBar surveyCode={enrollment.research_projects.survey_code} projectId={enrollment.project_id} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Available ─────────────────────── */}
          {activeTab === 'available' && isSectionVisible('available') && (
            <div className="space-y-4">
              {availableSurveys.length === 0 ? (
                <EmptyState icon={<FileText size={48} />} title="No Available Studies" description="Check back later for new research opportunities" />
              ) : (
                availableSurveys.map(survey => (
                  <div
                    key={survey.id}
                    onClick={() => handleAvailableSurveyClick(survey.id)}
                    className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ border: '1px solid var(--border-light)' }}
                  >
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {survey.title}
                    </h3>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {survey.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>{survey.duration_days || survey.study_duration} days</span>
                      <span>{getSurveyFrequencyLabel(survey.survey_frequency)}</span>
                      <span>{survey.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}</span>
                    </div>
                    <SurveyCodeBar surveyCode={survey.survey_code} projectId={survey.id} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: My Research ────────────────────── */}
          {activeTab === 'my-research' && isSectionVisible('my-research') && (
            <div className="space-y-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-white rounded-2xl p-5 flex items-center justify-center gap-3 hover:shadow-lg transition-shadow"
                style={{ border: '2px dashed var(--color-green)' }}
              >
                <Plus size={24} style={{ color: 'var(--color-green)' }} />
                <span className="font-semibold" style={{ color: 'var(--color-green)' }}>Create New Research</span>
              </button>

              {myResearches.length === 0 ? (
                <EmptyState icon={<FileText size={48} />} title="No Research Projects" description="Create your first research project" />
              ) : (
                myResearches.map(research => (
                  <div key={research.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-light)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{research.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{
                            backgroundColor: research.status === 'published' ? '#dcfce7' : '#fef3c7',
                            color: research.status === 'published' ? '#166534' : '#854d0e'
                          }}>{research.status}</span>
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{research.description}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); handleMyResearchClick(research.id); }} className="p-2 rounded-lg hover:bg-gray-100">
                          <Edit size={18} style={{ color: 'var(--color-green)' }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteResearch(research.id); }} className="p-2 rounded-lg hover:bg-gray-100">
                          <Trash2 size={18} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <span>{research.created_at ? new Date(research.created_at).toLocaleDateString() : 'N/A'}</span>
                      <span>{research.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}</span>
                      <span>{research.participant_count || 0} participants</span>
                    </div>

                    <SurveyCodeBar surveyCode={research.survey_code} projectId={research.id} />

                    <button
                      onClick={(e) => handleViewResponses(research.id, e)}
                      className="w-full mt-3 p-3 rounded-xl flex items-center justify-between hover:shadow-md transition-all"
                      style={{ backgroundColor: '#f0fdf4', border: '1px solid var(--color-green)' }}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 size={18} style={{ color: 'var(--color-green)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>View Responses</span>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--color-green)' }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Customize Panel ─────────────────────────── */}
      {showCustomize && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={() => setShowCustomize(false)}
        >
          <div
            className="bg-white w-full md:w-96 md:rounded-2xl rounded-t-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Customize Dashboard</h2>
              <button onClick={() => setShowCustomize(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Choose which sections to show on your dashboard
            </p>
            <div className="space-y-2">
              {(['stats', 'joined', 'available', 'my-research'] as SectionKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{
                    backgroundColor: isSectionVisible(key) ? '#f0fdf4' : 'transparent',
                    border: `1px solid ${isSectionVisible(key) ? 'var(--color-green)' : 'var(--border-light)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: isSectionVisible(key) ? 'var(--color-green)' : 'var(--text-secondary)' }}>
                      {SECTION_ICONS[key]}
                    </span>
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {SECTION_LABELS[key]}
                    </span>
                    {key === 'stats' && !isResearcher && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100" style={{ color: 'var(--text-secondary)' }}>Basic</span>
                    )}
                  </div>
                  {isSectionVisible(key) 
                    ? <Eye size={18} style={{ color: 'var(--color-green)' }} />
                    : <EyeOff size={18} style={{ color: 'var(--text-secondary)' }} />
                  }
                </button>
              ))}
            </div>
            <button
              onClick={() => { updatePrefs(DEFAULT_PREFS); }}
              className="w-full mt-4 py-2 text-sm font-medium rounded-lg"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* ── Create Research Modal ───────────────────── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
        >
          <div className="bg-white rounded-2xl p-8 w-11/12 max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create New Research</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Title</label>
                <input type="text" value={newResearch.title} onChange={e => setNewResearch({ ...newResearch, title: e.target.value })} placeholder="e.g., Daily Mood Assessment" className="w-full px-4 py-3 rounded-lg" style={{ border: '2px solid var(--border-light)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Description</label>
                <textarea value={newResearch.description} onChange={e => setNewResearch({ ...newResearch, description: e.target.value })} placeholder="Describe your research..." rows={3} className="w-full px-4 py-3 rounded-lg" style={{ border: '2px solid var(--border-light)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Project Type</label>
                <select value={newResearch.project_type} onChange={e => setNewResearch({ ...newResearch, project_type: e.target.value as any })} className="w-full px-4 py-3 rounded-lg" style={{ border: '2px solid var(--border-light)' }}>
                  <option value="survey">One-time Survey</option>
                  <option value="longitudinal">Longitudinal Study</option>
                  <option value="esm">Experience Sampling (ESM)</option>
                </select>
              </div>
              {(newResearch.project_type === 'longitudinal' || newResearch.project_type === 'esm') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Duration (days)</label>
                    <input type="number" value={newResearch.study_duration} onChange={e => setNewResearch({ ...newResearch, study_duration: parseInt(e.target.value) || 7 })} className="w-full px-4 py-3 rounded-lg" style={{ border: '2px solid var(--border-light)' }} min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Frequency</label>
                    <select value={newResearch.survey_frequency} onChange={e => setNewResearch({ ...newResearch, survey_frequency: e.target.value })} className="w-full px-4 py-3 rounded-lg" style={{ border: '2px solid var(--border-light)' }}>
                      <option value="hourly">Every Hour</option>
                      <option value="twice_daily">Twice Daily</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            {createError && <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{createError}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="flex-1 px-6 py-3 rounded-lg font-semibold" style={{ border: '2px solid var(--border-light)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handleCreateResearch} className="flex-1 px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: 'var(--color-green)' }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Join Modal ──────────────────────────────── */}
      {showJoinModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={() => { setShowJoinModal(false); setJoinInput(''); setJoinError(''); }}
        >
          <div className="bg-white rounded-2xl p-8 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Join Research Study</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Enter a survey code or paste the survey link</p>
            <input type="text" value={joinInput} onChange={e => setJoinInput(e.target.value)} placeholder="Enter code (e.g., 900AF2) or paste link" className="w-full px-4 py-3 rounded-lg mb-4" style={{ border: '2px solid var(--border-light)' }} onKeyPress={e => { if (e.key === 'Enter') handleJoinResearch(); }} />
            {joinError && <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{joinError}</div>}
            <div className="flex gap-3">
              <button onClick={() => { setShowJoinModal(false); setJoinInput(''); setJoinError(''); }} className="flex-1 px-6 py-3 rounded-lg font-semibold" style={{ border: '2px solid var(--border-light)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handleJoinResearch} className="flex-1 px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: 'var(--color-green)' }}>Join</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Sub-components ────────────────────────────────────
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid var(--border-light)' }}>
    <div className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }}>{icon}</div>
    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
  </div>
);

const SurveyCodeBar: React.FC<{ surveyCode?: string; projectId: string }> = ({ surveyCode, projectId }) => (
  <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
    <code className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
      {surveyCode || 'N/A'}
    </code>
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(surveyCode || ''); }}
      className="p-1 rounded hover:bg-gray-100"
    >
      <Copy size={14} style={{ color: 'var(--color-green)' }} />
    </button>
    <div className="flex-1" />
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/easyresearch/participant/${projectId}`); }}
      className="text-xs px-2 py-1 rounded-lg font-medium"
      style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}
    >
      Copy Link
    </button>
  </div>
);

export default ParticipantHome;
