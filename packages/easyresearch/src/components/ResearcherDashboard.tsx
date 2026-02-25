import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
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
  Brain
} from 'lucide-react';
import CreateProjectDialog from './CreateProjectDialog';
import ResearcherHeader from './ResearcherHeader';
import ResearcherFooter from './ResearcherFooter';
import EasierResearchLayout from './EasierResearchLayout';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ai_credits: number;
  settings: any;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: string;
  project_type: string;
  ai_enabled: boolean;
  voice_enabled: boolean;
  current_participants: number;
  max_participants: number;
  created_at: string;
  published_at: string;
  ends_at: string;
  completion_rate?: number;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalParticipants: number;
  totalResponses: number;
  avgCompletionRate: number;
  aiCreditsUsed: number;
}

const ResearcherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalParticipants: 0,
    totalResponses: 0,
    avgCompletionRate: 0,
    aiCreditsUsed: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load researcher's organization
      const { data: researcherData } = await supabase
        .from('researchers')
        .select('*, organization:organizations(*)')
        .eq('user_id', user?.id)
        .single();

      if (researcherData?.organization) {
        setOrganization(researcherData.organization);

        // Load projects
        const { data: projectsData } = await supabase
          .from('research_projects')
          .select('*')
          .eq('organization_id', researcherData.organization.id)
          .order('created_at', { ascending: false });

        if (projectsData) {
          setProjects(projectsData);
          
          // Calculate stats
          const activeProjects = projectsData.filter(p => p.status === 'active').length;
          const totalParticipants = projectsData.reduce((sum, p) => sum + (p.current_participants || 0), 0);
          
          setStats({
            totalProjects: projectsData.length,
            activeProjects,
            totalParticipants,
            totalResponses: 0, // Will load from responses
            avgCompletionRate: 0,
            aiCreditsUsed: 0
          });

          // Load response stats
          const { data: responsesCount } = await supabase
            .from('survey_responses')
            .select('id', { count: 'exact' })
            .in('project_id', projectsData.map(p => p.id));

          if (responsesCount) {
            setStats(prev => ({ ...prev, totalResponses: responsesCount.length }));
          }
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
        return <Archive className="text-gray-500" size={16} />;
      case 'paused':
        return <AlertCircle className="text-orange-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    // All badges use white background with green border and text
    return 'bg-white border border-green-500 text-green-600';
  };

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return project.status === 'active';
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
    <EasierResearchLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <ResearcherHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  EasierResearch Dashboard
                </h1>
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {organization?.name} • {organization?.plan.toUpperCase()} Plan
                </p>
              </div>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <Plus size={20} />
                Create New Research Study
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
                <Zap style={{ color: 'var(--color-green)' }} size={24} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {organization?.ai_credits} left
                </span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.aiCreditsUsed}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                AI Credits Used
              </p>
            </div>
          </div>

          {/* Projects Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
              {(['all', 'active', 'draft', 'completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize transition-all ${
                    activeTab === tab 
                      ? 'border-b-2' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    color: activeTab === tab ? 'var(--color-green)' : 'var(--text-secondary)',
                    borderColor: activeTab === tab ? 'var(--color-green)' : 'transparent'
                  }}
                >
                  {tab === 'all' ? 'All Projects' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid var(--border-light)' }}>
                <FileText className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    No projects yet
                  </h3>
                  <button
                    onClick={() => navigate('/easyresearch/create-survey')}
                    className="text-sm font-medium text-white px-3 py-1 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-green)' }}
                  >
                    Create Survey
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Create your first research survey to get started
                </p>
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
                        {project.ai_enabled && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-green-500" style={{ color: 'var(--color-green)' }}>
                            <Zap size={12} />
                            AI
                          </span>
                        )}
                        {project.voice_enabled && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-green-500" style={{ color: 'var(--color-green)' }}>
                            <Mic size={12} />
                            Voice
                          </span>
                        )}
                      </div>
                      <p className="mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {project.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {project.current_participants}/{project.max_participants || '∞'} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        {project.ends_at && (
                          <span className="flex items-center gap-1">
                            <AlertCircle size={14} />
                            Ends {new Date(project.ends_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {project.completion_rate && (
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: 'var(--color-green)' }}>
                            {project.completion_rate}%
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Completion Rate
                          </p>
                        </div>
                      )}
                      <button 
                        className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="ESM Study"
                      >
                        <Zap size={16} style={{ color: 'var(--color-green)' }} />
                      </button>
                      <button 
                        className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="AI Analysis Enabled"
                      >
                        <Brain size={16} style={{ color: 'var(--color-green)' }} />
                      </button>
                      <button 
                        className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Voice Input Enabled"
                      >
                        <Mic size={16} style={{ color: 'var(--color-green)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3">
            <button
              onClick={() => navigate('/easyresearch/analytics')}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              style={{ border: '1px solid var(--border-light)' }}
            >
              <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
            </button>
            <button
              onClick={() => navigate('/easyresearch/participants')}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              style={{ border: '1px solid var(--border-light)' }}
            >
              <Users style={{ color: 'var(--color-green)' }} size={24} />
            </button>
            <button
              onClick={() => navigate('/easyresearch/settings')}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              style={{ border: '1px solid var(--border-light)' }}
            >
              <Settings style={{ color: 'var(--color-green)' }} size={24} />
            </button>
          </div>
        </div>
        
        {/* Create Project Dialog */}
        <CreateProjectDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={loadDashboardData}
        />
        
        <ResearcherFooter />
      </div>
    </EasierResearchLayout>
  );
};

export default ResearcherDashboard;
