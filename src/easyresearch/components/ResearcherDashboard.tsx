import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  BarChart3, Users, FileText, Plus, Clock, CheckCircle, Archive, AlertCircle,
  Search, Trash2, Copy, X
} from 'lucide-react';
import CreateProjectDialog from './CreateProjectDialog';

// Define interfaces
interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ai_credit: number;
  setting: any;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: string;
  project_type: string;
  ai_enabled: boolean;
  voice_enabled: boolean;
  current_participant: number;
  max_participant: number;
  created_at: string;
  published_at: string;
  end_at: string;
  completion_rate?: number;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalParticipants: number;
  totalResponses: number;
  avgCompletionRate: number;
}

const ResearcherDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, activeProjects: 0, totalParticipants: 0, totalResponses: 0, avgCompletionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateDialog(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/easyresearch/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: researcherData } = await supabase
        .from('researcher').select('id, organization_id').eq('user_id', user?.id).maybeSingle();

      if (researcherData?.organization_id) {
        const { data: orgData } = await supabase
          .from('organization').select('*').eq('id', researcherData.organization_id).maybeSingle();
        if (orgData) setOrganization(orgData);

        const { data: projectsData } = await supabase
          .from('research_project').select('*').eq('organization_id', researcherData.organization_id)
          .order('created_at', { ascending: false });

        if (projectsData) {
          setProjects(projectsData);
          const activeProjects = projectsData.filter(p => p.status === 'published' || p.status === 'active').length;
          const projectIds = projectsData.map(p => p.id);
          let enrollmentCount = 0;
          let responseCount = 0;

          if (projectIds.length > 0) {
            const { count: ec } = await supabase
              .from('enrollment').select('id', { count: 'exact', head: true }).in('project_id', projectIds);
            enrollmentCount = ec || 0;
            const { count: rc } = await supabase
              .from('survey_respons').select('id', { count: 'exact', head: true }).in('project_id', projectIds);
            responseCount = rc || 0;
          }
          
          const totalQuestionSlots = enrollmentCount > 0 && projectsData.length > 0
            ? enrollmentCount * Math.max(1, Math.round(responseCount / Math.max(1, enrollmentCount)))
            : 0;
          const completionRate = totalQuestionSlots > 0
            ? Math.min(100, Math.round((responseCount / totalQuestionSlots) * 100))
            : 0;

          setStats({
            totalProjects: projectsData.length, activeProjects, totalParticipants: enrollmentCount,
            totalResponses: responseCount, avgCompletionRate: completionRate
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'draft':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed':
        return 'bg-stone-100 text-stone-500 border-stone-200';
      case 'paused':
        return 'bg-orange-50 text-orange-500 border-orange-100';
      default:
        return 'bg-stone-50 text-stone-400 border-stone-100';
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setActionLoading(true);
    try {
      const { data: questions } = await supabase.from('survey_question').select('id').eq('project_id', projectId);
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        await supabase.from('question_option').delete().in('question_id', questionIds);
      }
      await supabase.from('survey_respons').delete().eq('project_id', projectId);
      await supabase.from('survey_question').delete().eq('project_id', projectId);
      await supabase.from('survey_instance').delete().eq('project_id', projectId);
      const { data: enrollments } = await supabase.from('enrollment').select('id').eq('project_id', projectId);
      if (enrollments && enrollments.length > 0) {
        const enrollmentIds = enrollments.map(e => e.id);
        await supabase.from('compliance_tracking').delete().in('enrollment_id', enrollmentIds);
      }
      await supabase.from('enrollment').delete().eq('project_id', projectId);
      const { error } = await supabase.from('research_project').delete().eq('id', projectId);
      if (error) throw error;
      setShowDeleteConfirm(null);
      toast.success('Project deleted');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateProject = async (project: ResearchProject) => {
    setActionLoading(true);
    try {
      const { data: researcher } = await supabase
        .from('researcher').select('organization_id, id').eq('user_id', user?.id).maybeSingle();
      if (!researcher) { toast.error('Researcher profile not found'); return; }

      const { data: newProject, error } = await supabase
        .from('research_project')
        .insert({
          organization_id: researcher.organization_id, researcher_id: researcher.id,
          title: `${project.title} (Copy)`, description: project.description,
          status: 'draft', project_type: project.project_type,
          methodology_type: (project as any).methodology_type || 'single_survey',
          ai_enabled: project.ai_enabled, voice_enabled: project.voice_enabled,
          max_participant: (project as any).max_participant || 100,
          show_progress_bar: (project as any).show_progress_bar ?? true,
          consent_required: (project as any).consent_required ?? false,
          screening_enabled: (project as any).screening_enabled ?? false,
          notification_frequency: (project as any).notification_frequency,
          notification_times_per_day: (project as any).notification_times_per_day
        })
        .select().single();
      
      if (error) throw error;
      if (newProject) {
        const { data: questions } = await supabase
          .from('survey_question').select('*, options:question_option(*)').eq('project_id', project.id).order('order_index');
        
        if (questions && questions.length > 0) {
          for (const q of questions) {
            const { options, ...questionData } = q;
            const newQuestionId = crypto.randomUUID();
            const { error: qError } = await supabase
              .from('survey_question').insert({ ...questionData, id: newQuestionId, project_id: newProject.id });
            if (qError) { console.error('Error copying question:', qError); continue; }
            if (options && options.length > 0) {
              const newOptions = options.map((opt: any) => ({
                ...opt, id: crypto.randomUUID(), question_id: newQuestionId
              }));
              await supabase.from('question_option').insert(newOptions);
            }
          }
        }
        toast.success('Project duplicated');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast.error('Failed to duplicate project');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return project.status === 'published' || project.status === 'active';
    if (activeTab === 'draft') return project.status === 'draft';
    if (activeTab === 'completed') return project.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[13px] text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-800">Projects</h1>
              <p className="text-[13px] text-stone-400 mt-1">
                {organization?.name}
              </p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Projects', value: stats.totalProjects, sub: `${stats.activeProjects} active`, icon: FileText, gradient: 'from-emerald-50 to-teal-50', iconColor: 'text-emerald-600' },
            { label: 'Participants', value: stats.totalParticipants, sub: 'enrolled', icon: Users, gradient: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600' },
            { label: 'Responses', value: stats.totalResponses, sub: 'collected', icon: BarChart3, gradient: 'from-violet-50 to-purple-50', iconColor: 'text-violet-600' },
            { label: 'Completion', value: `${stats.avgCompletionRate}%`, sub: 'avg rate', icon: CheckCircle, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 border border-white/60`}>
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={16} className={stat.iconColor} strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-stone-800">{stat.value}</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{stat.label} · {stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex gap-1 bg-stone-100 rounded-full p-0.5">
            {(['all', 'active', 'draft', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-full w-full sm:w-56 text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
            />
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-stone-100 shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <FileText className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">No projects yet</h3>
              <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">
                Create your first research project to start collecting insights.
              </p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200"
              >
                <Plus size={16} /> Create Project
              </button>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-2xl px-5 py-4 border border-stone-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all cursor-pointer group"
                onClick={() => navigate(`/easyresearch/project/${project.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-[15px] font-semibold text-stone-800 truncate group-hover:text-emerald-600 transition-colors">
                        {project.title}
                      </h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-stone-400 line-clamp-1 mb-2 font-light">{project.description}</p>
                    <div className="flex items-center gap-4 text-[12px] text-stone-300">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {(project as any).current_participant || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleDuplicateProject(project); }}
                      title="Duplicate"
                      disabled={actionLoading}
                    >
                      <Copy size={14} className="text-stone-400" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(project.id); }}
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateProjectDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={loadDashboardData}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl border border-stone-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="text-red-500" size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-stone-800">Delete Project?</h3>
            </div>
            <p className="text-[13px] text-stone-400 mb-5 font-light">
              This cannot be undone. All questions, responses, and data will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearcherDashboard;
