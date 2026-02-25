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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-green)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  My Projects
                </h1>
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {organization?.name} • {(organization?.plan || 'free').toUpperCase()} Plan
                </p>
              </div>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <Plus size={20} />
                New Project
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <FileText style={{ color: 'var(--color-green)' }} size={24} />
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor('active')}`}>
                  {stats.activeProjects} Active
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalProjects}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Total Projects
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <Users style={{ color: 'var(--color-green)' }} size={24} />
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalParticipants}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Total Participants
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  This Month
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalResponses}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Total Responses
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <CheckCircle style={{ color: 'var(--color-green)' }} size={24} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Rate
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.avgCompletionRate}%
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Completion Rate
              </p>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 border-b flex-1" style={{ borderColor: 'var(--border-light)' }}>
                {(['all', 'active', 'draft', 'completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium capitalize transition-all ${
                      activeTab === tab 
                        ? 'border-b-2' 
                        : ''
                    }`}
                    onMouseEnter={(e) => activeTab !== tab && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => activeTab !== tab && (e.currentTarget.style.backgroundColor = 'transparent')}
                    style={{
                      color: activeTab === tab ? 'var(--color-green)' : 'var(--text-secondary)',
                      borderColor: activeTab === tab ? 'var(--color-green)' : 'transparent'
                    }}
                  >
                    {tab === 'all' ? 'All Projects' : tab}
                  </button>
                ))}
              </div>
              <div className="relative ml-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{ border: '1px solid var(--border-light)' }}
                />
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid var(--border-light)' }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <FileText style={{ color: 'var(--color-green)' }} size={40} />
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                  No projects yet
                </h3>
                <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Create your first research project to start collecting valuable insights from participants.
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  <Plus size={20} />
                  Create Your First Project
                </button>
              </div>
            ) : (
              filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] transform"
                  style={{ border: '1px solid var(--border-light)' }}
                  onClick={() => navigate(`/easyresearch/project/${project.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {project.title}
                        </h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </span>
                        {project.project_type && project.project_type !== 'one_time' && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-light)' }}>
                            {project.project_type === 'longitudinal' ? 'Longitudinal' : project.project_type === 'esm' ? 'ESM' : project.project_type}
                          </span>
                        )}
                      </div>
                      <p className="mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {project.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {(project as any).current_participant}/{(project as any).max_participant || '∞'} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        {(project as any).end_at && (
                          <span className="flex items-center gap-1">
                            <AlertCircle size={14} />
                            Ends {new Date((project as any).end_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {project.completion_rate && (
                        <div className="text-right mb-2">
                          <p className="text-2xl font-bold" style={{ color: 'var(--color-green)' }}>
                            {project.completion_rate}%
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Completion Rate
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateProject(project);
                          }}
                          title="Duplicate Project"
                          disabled={actionLoading}
                        >
                          <Copy size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button 
                          className="p-2 rounded-lg transition-colors hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(project.id);
                          }}
                          title="Delete Project"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
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

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-500" size={20} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Delete Project?
                </h3>
              </div>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                This action cannot be undone. All questions, responses, and data associated with this project will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(showDeleteConfirm)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ResearcherDashboard;
