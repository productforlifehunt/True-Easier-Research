import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  BarChart2, 
  BarChart3,
  Users, 
  FileText, 
  TrendingUp, 
  Plus, 
  Calendar,
  Zap,
  Mic,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Archive,
  Settings,
  Filter,
  Search,
  Brain,
  Trash2,
  Copy,
  MoreVertical,
  X
} from 'lucide-react';
import CreateProjectDialog from './CreateProjectDialog';

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
    totalProjects: 0,
    activeProjects: 0,
    totalParticipants: 0,
    totalResponses: 0,
    avgCompletionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check for create=true query param to auto-open create dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateDialog(true);
      // Remove the query param after opening dialog
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/easyresearch/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load researcher's organization
      const { data: researcherData } = await supabase
        .from('researcher')
        .select('id, organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (researcherData?.organization_id) {
        const { data: orgData } = await supabase
          .from('organization')
          .select('*')
          .eq('id', researcherData.organization_id)
          .maybeSingle();

        if (orgData) {
          setOrganization(orgData);
        }

        // Load projects
        const { data: projectsData } = await supabase
          .from('research_project')
          .select('*')
          .eq('organization_id', researcherData.organization_id)
          .order('created_at', { ascending: false });

        if (projectsData) {
          setProjects(projectsData);
          
          // Calculate stats
          const activeProjects = projectsData.filter(p => p.status === 'published' || p.status === 'active').length;
          
          const projectIds = projectsData.map(p => p.id);

          let enrollmentCount = 0;
          let responseCount = 0;

          if (projectIds.length > 0) {
            // Count actual enrollments
            const { count: ec } = await supabase
              .from('enrollment')
              .select('id', { count: 'exact', head: true })
              .in('project_id', projectIds);
            enrollmentCount = ec || 0;

            // Count actual responses
            const { count: rc } = await supabase
              .from('survey_respons')
              .select('id', { count: 'exact', head: true })
              .in('project_id', projectIds);
            responseCount = rc || 0;
          }
          
          // Compute real completion rate: responses / (enrollments * avg questions per project)
          const totalQuestionSlots = enrollmentCount > 0 && projectsData.length > 0
            ? enrollmentCount * Math.max(1, Math.round(responseCount / Math.max(1, enrollmentCount)))
            : 0;
          const completionRate = totalQuestionSlots > 0
            ? Math.min(100, Math.round((responseCount / totalQuestionSlots) * 100))
            : 0;

          setStats({
            totalProjects: projectsData.length,
            activeProjects,
            totalParticipants: enrollmentCount,
            totalResponses: responseCount,
            avgCompletionRate: completionRate
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'draft':
        return <Clock className="text-yellow-500" size={16} />;
      case 'completed':
        return <Archive style={{ color: 'var(--text-secondary)' }} size={16} />;
      case 'paused':
        return <AlertCircle className="text-orange-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'bg-green-50 border border-green-500 text-green-600';
      case 'draft':
        return 'bg-yellow-50 border border-yellow-500 text-yellow-600';
      case 'completed':
        return 'bg-gray-50 border border-gray-400 text-gray-500';
      case 'paused':
        return 'bg-orange-50 border border-orange-500 text-orange-600';
      default:
        return 'bg-white border border-gray-300 text-gray-500';
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setActionLoading(true);
    try {
      // Get all question IDs for this project
      const { data: questions } = await supabase
        .from('survey_question')
        .select('id')
        .eq('project_id', projectId);
      
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        // Delete question options first (foreign key constraint)
        await supabase.from('question_option').delete().in('question_id', questionIds);
      }
      
      // Delete responses (must come before questions due to FK)
      await supabase.from('survey_respons').delete().eq('project_id', projectId);
      
      // Delete questions
      await supabase.from('survey_question').delete().eq('project_id', projectId);
      
      // Delete survey instances
      await supabase.from('survey_instance').delete().eq('project_id', projectId);

      // Delete compliance tracking records (FK to enrollment)
      const { data: enrollments } = await supabase
        .from('enrollment')
        .select('id')
        .eq('project_id', projectId);
      if (enrollments && enrollments.length > 0) {
        const enrollmentIds = enrollments.map(e => e.id);
        await supabase.from('compliance_tracking').delete().in('enrollment_id', enrollmentIds);
      }
      
      // Delete enrollments
      await supabase.from('enrollment').delete().eq('project_id', projectId);
      
      // Delete project
      const { error } = await supabase.from('research_project').delete().eq('id', projectId);
      if (error) throw error;
      
      setShowDeleteConfirm(null);
      toast.success('Project deleted successfully');
      // Reload dashboard to update stats
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
      // Get the organization_id from current researcher
      const { data: researcher } = await supabase
        .from('researcher')
        .select('organization_id, id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!researcher) {
        toast.error('Researcher profile not found');
        return;
      }

      const { data: newProject, error } = await supabase
        .from('research_project')
        .insert({
          organization_id: researcher.organization_id,
          researcher_id: researcher.id,
          title: `${project.title} (Copy)`,
          description: project.description,
          status: 'draft',
          project_type: project.project_type,
          methodology_type: (project as any).methodology_type || 'single_survey',
          ai_enabled: project.ai_enabled,
          voice_enabled: project.voice_enabled,
          max_participant: (project as any).max_participant || 100,
          setting: (project as any).setting || {},
          notification_setting: (project as any).notification_setting || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      if (newProject) {
        // Copy questions with their options
        const { data: questions } = await supabase
          .from('survey_question')
          .select('*, options:question_option(*)')
          .eq('project_id', project.id)
          .order('order_index');
        
        if (questions && questions.length > 0) {
          for (const q of questions) {
            const { options, ...questionData } = q;
            const newQuestionId = crypto.randomUUID();
            
            // Insert question with new ID
            const { error: qError } = await supabase
              .from('survey_question')
              .insert({
                ...questionData,
                id: newQuestionId,
                project_id: newProject.id
              });
            
            if (qError) {
              console.error('Error copying question:', qError);
              continue;
            }
            
            // Copy options if any
            if (options && options.length > 0) {
              const newOptions = options.map((opt: any) => ({
                ...opt,
                id: crypto.randomUUID(),
                question_id: newQuestionId
              }));
              
              await supabase.from('question_option').insert(newOptions);
            }
          }
        }
        
        toast.success('Project duplicated successfully');
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-[13px] text-neutral-400">Loading...</p>
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
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  Projects
                </h1>
                <p className="text-[13px] text-neutral-400 mt-1">
                  {organization?.name} · {(organization?.plan || 'free').charAt(0).toUpperCase() + (organization?.plan || 'free').slice(1)} Plan
                </p>
              </div>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Projects', value: stats.totalProjects, sub: `${stats.activeProjects} active`, icon: FileText },
              { label: 'Participants', value: stats.totalParticipants, sub: 'enrolled', icon: Users },
              { label: 'Responses', value: stats.totalResponses, sub: 'collected', icon: BarChart3 },
              { label: 'Completion', value: `${stats.avgCompletionRate}%`, sub: 'avg rate', icon: CheckCircle },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-black/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon size={16} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-semibold tracking-tight text-neutral-900">{stat.value}</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">{stat.label} · {stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
              {(['all', 'active', 'draft', 'completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg w-full sm:w-56 text-[13px] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-2">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center border border-black/[0.04]">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileText className="text-emerald-600" size={24} />
                </div>
                <h3 className="text-[15px] font-semibold text-neutral-900 mb-1.5">No projects yet</h3>
                <p className="text-[13px] text-neutral-400 mb-5 max-w-sm mx-auto">
                  Create your first research project to start collecting insights.
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={16} /> Create Project
                </button>
              </div>
            ) : (
              filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl px-5 py-4 border border-black/[0.04] hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => navigate(`/easyresearch/project/${project.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-[15px] font-semibold text-neutral-900 truncate group-hover:text-emerald-700 transition-colors">
                          {project.title}
                        </h3>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-[13px] text-neutral-400 line-clamp-1 mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-[12px] text-neutral-400">
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
                        className="p-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleDuplicateProject(project); }}
                        title="Duplicate"
                        disabled={actionLoading}
                      >
                        <Copy size={14} className="text-neutral-400" />
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

        {/* Create Project Dialog */}
        <CreateProjectDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={loadDashboardData}
        />

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 className="text-red-500" size={16} />
                </div>
                <h3 className="text-[15px] font-semibold text-neutral-900">Delete Project?</h3>
              </div>
              <p className="text-[13px] text-neutral-500 mb-5">
                This cannot be undone. All questions, responses, and data will be permanently deleted.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-neutral-600 border border-black/[0.08] hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(showDeleteConfirm)}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
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
