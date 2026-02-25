import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Mail, CheckCircle, Clock, XCircle, Filter, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface Enrollment {
  id: string;
  project_id: string;
  participant_id: string | null;
  participant_email: string;
  status: 'invited' | 'active' | 'completed' | 'withdrawn';
  created_at: string;
  research_project?: {
    title: string;
  };
}

interface Project {
  id: string;
  title: string;
}

const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectIdFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [researcher, setResearcher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/easyresearch/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadEnrollments();
    } else if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [selectedProject, projects]);

  const loadProjects = async () => {
    try {
      const { data: researcherData } = await supabase
        .from('researcher')
        .select('id, organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!researcherData?.organization_id) {
        setProjects([]);
        setEnrollments([]);
        setLoading(false);
        return;
      }

      setResearcher(researcherData);

      const { data: projectsData } = await supabase
        .from('research_project')
        .select('id, title')
        .eq('organization_id', researcherData.organization_id)
        .order('created_at', { ascending: false });

      const nextProjects = projectsData || [];
      setProjects(nextProjects);

      if (nextProjects.length === 0) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      // Select first valid project
      const nextSelected = projectIdFromUrl || nextProjects[0]?.id || '';
      if (nextSelected && nextSelected !== selectedProject) {
        setSelectedProject(nextSelected);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      setEnrollments([]);
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enrollment')
        .select('id, project_id, participant_id, participant_email, status, created_at')
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectTitle = projects.find(p => p.id === selectedProject)?.title;
      setEnrollments(
        (data || []).map((e: any) => ({
          ...e,
          research_project: projectTitle ? { title: projectTitle } : undefined
        })) as any
      );
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !selectedProject) {
      toast.error('Please enter a valid email and select a project');
      return;
    }

    if (!researcher?.id || !researcher?.organization_id) {
      toast.error('Researcher information not found');
      return;
    }

    setSendingInvite(true);
    try {
      const emailLower = inviteEmail.trim().toLowerCase();

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollment')
        .select('id')
        .eq('project_id', selectedProject)
        .eq('participant_email', emailLower)
        .maybeSingle();

      if (existing) {
        toast.error('This participant is already enrolled in this project');
        return;
      }

      // Create enrollment with invited status
      const { error: enrollError } = await supabase
        .from('enrollment')
        .insert({
          project_id: selectedProject,
          participant_email: emailLower,
          status: 'invited',
        });

      if (enrollError) throw enrollError;

      toast.success(`Participant ${emailLower} added successfully`);

      setShowInviteModal(false);
      setInviteEmail('');
      setCustomMessage('');
      
      // Refresh enrollments
      loadEnrollments();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to create invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      invited: { bg: '#fef3c7', color: '#d97706', icon: <Mail size={14} /> },
      active: { bg: '#d1fae5', color: '#059669', icon: <CheckCircle size={14} /> },
      completed: { bg: '#dbeafe', color: '#2563eb', icon: <CheckCircle size={14} /> },
      withdrawn: { bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={14} /> }
    };
    const style = styles[status] || styles.invited;
    
    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = !searchQuery || 
      e.participant_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredEnrollments.length === 0) return;
    
    const headers = ['Email', 'Status', 'Enrolled At'];
    const csvData = filteredEnrollments.map(e => [
      e.participant_email,
      e.status,
      new Date(e.created_at).toLocaleString()
    ]);
    
    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Participants
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Manage and invite participants to your studies
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              disabled={!selectedProject}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <UserPlus size={20} />
              Invite Participants
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={projects.length === 0}
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50"
              style={{ borderColor: 'var(--border-light)' }}
            >
              {projects.length === 0 && (
                <option value="" disabled>No projects</option>
              )}
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <div className="relative flex-1 max-w-xs">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-white"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <option value="all">All Statuses</option>
              <option value="invited">Invited</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            <button
              onClick={exportToCSV}
              disabled={filteredEnrollments.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Download size={18} />
              Export
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', count: enrollments.length, color: 'var(--text-primary)' },
              { label: 'Invited', count: enrollments.filter(e => e.status === 'invited').length, color: '#d97706' },
              { label: 'Active', count: enrollments.filter(e => e.status === 'active').length, color: '#059669' },
              { label: 'Completed', count: enrollments.filter(e => e.status === 'completed').length, color: '#2563eb' }
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
              </div>
            ))}
          </div>

          {/* Participants List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--color-green)' }} />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid var(--border-light)' }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Users style={{ color: 'var(--color-green)' }} size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Projects Yet
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Create a research project first, then you can invite participants to your studies.
              </p>
              <button
                onClick={() => navigate('/easyresearch/dashboard?create=true')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <UserPlus size={20} />
                Create Your First Survey
              </button>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid var(--border-light)' }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Users style={{ color: 'var(--color-green)' }} size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Participants Yet
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Start building your research panel by inviting participants to your study.
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <UserPlus size={20} />
                Invite Your First Participant
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Email</th>
                    <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map(enrollment => (
                    <tr key={enrollment.id} className="border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <td className="px-6 py-4">
                        <span style={{ color: 'var(--text-primary)' }}>{enrollment.participant_email}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(enrollment.status)}</td>
                      <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(enrollment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Invite Participants
            </h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Add a participant by email. They can access the survey via the shared link.
            </p>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="participant@example.com"
              className="w-full p-3 rounded-lg border"
              style={{ borderColor: 'var(--border-light)' }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 rounded-lg font-medium border"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={sendInvitation}
                disabled={sendingInvite || !inviteEmail.trim()}
                className="flex-1 py-3 rounded-lg font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                {sendingInvite ? 'Adding...' : 'Add Participant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantsPage;
