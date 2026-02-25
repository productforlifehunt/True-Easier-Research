import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Mail, CheckCircle, Clock, XCircle, Download, X } from 'lucide-react';
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
  const [sendingInvite, setSendingInvite] = useState(false);
  const [researcher, setResearcher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/easyresearch/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadProjects();
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
      const { data: researcherData } = await supabase.from('researcher').select('id, organization_id').eq('user_id', user?.id).maybeSingle();
      if (!researcherData?.organization_id) { setProjects([]); setEnrollments([]); setLoading(false); return; }
      setResearcher(researcherData);
      const { data: projectsData } = await supabase.from('research_project').select('id, title').eq('organization_id', researcherData.organization_id).order('created_at', { ascending: false });
      const nextProjects = projectsData || [];
      setProjects(nextProjects);
      if (nextProjects.length === 0) { setEnrollments([]); setLoading(false); return; }
      const nextSelected = projectIdFromUrl || nextProjects[0]?.id || '';
      if (nextSelected && nextSelected !== selectedProject) setSelectedProject(nextSelected);
    } catch (error) { console.error('Error loading projects:', error); setProjects([]); setEnrollments([]); setLoading(false); }
  };

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('enrollment').select('id, project_id, participant_id, participant_email, status, created_at')
        .eq('project_id', selectedProject).order('created_at', { ascending: false });
      if (error) throw error;
      setEnrollments((data || []) as Enrollment[]);
    } catch (error) { console.error('Error loading enrollments:', error); }
    finally { setLoading(false); }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !selectedProject) { toast.error('Please enter a valid email and select a project'); return; }
    if (!researcher?.id || !researcher?.organization_id) { toast.error('Researcher information not found'); return; }
    setSendingInvite(true);
    try {
      const emailLower = inviteEmail.trim().toLowerCase();
      const { data: existing } = await supabase.from('enrollment').select('id').eq('project_id', selectedProject).eq('participant_email', emailLower).maybeSingle();
      if (existing) { toast.error('This participant is already enrolled'); return; }
      const { error: enrollError } = await supabase.from('enrollment').insert({ project_id: selectedProject, participant_email: emailLower, status: 'invited' });
      if (enrollError) throw enrollError;
      toast.success(`Participant ${emailLower} added`);
      setShowInviteModal(false); setInviteEmail(''); loadEnrollments();
    } catch (error: any) { console.error('Error sending invitation:', error); toast.error('Failed to create invitation'); }
    finally { setSendingInvite(false); }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      invited: { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Mail size={12} /> },
      active: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle size={12} /> },
      completed: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: <CheckCircle size={12} /> },
      withdrawn: { bg: 'bg-red-50', text: 'text-red-500', icon: <XCircle size={12} /> }
    };
    const c = config[status] || config.invited;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = !searchQuery || e.participant_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredEnrollments.length === 0) return;
    const headers = ['Email', 'Status', 'Enrolled At'];
    const csvData = filteredEnrollments.map(e => [e.participant_email, e.status, new Date(e.created_at).toLocaleString()]);
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'participants.csv'; a.click();
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Participants</h1>
            <p className="text-[13px] text-slate-400 mt-1 font-light">Manage and invite participants to your studies</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            disabled={!selectedProject}
            className="px-4 py-2 rounded-full text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <UserPlus size={16} /> Invite
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: enrollments.length, icon: Users },
            { label: 'Invited', value: enrollments.filter(e => e.status === 'invited').length, icon: Mail },
            { label: 'Active', value: enrollments.filter(e => e.status === 'active').length, icon: CheckCircle },
            { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, icon: Clock }
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100">
              <stat.icon size={16} className="text-indigo-500 mb-3" strokeWidth={1.5} />
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={projects.length === 0}
              className="px-3 py-1.5 rounded-full text-[13px] border border-slate-100 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:opacity-50"
            >
              {projects.length === 0 && <option value="" disabled>No projects</option>}
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <div className="flex gap-1 bg-slate-100 rounded-full p-0.5">
              {['all', 'invited', 'active', 'completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all ${
                    statusFilter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <input
                type="text" placeholder="Search email..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full w-48 text-[13px] border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              />
            </div>
            <button
              onClick={exportToCSV} disabled={filteredEnrollments.length === 0}
              className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Export CSV"
            >
              <Download size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Users className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">No Projects Yet</h3>
              <p className="text-[13px] text-slate-400 mb-5 max-w-sm mx-auto font-light">Create a research project first, then invite participants.</p>
              <button onClick={() => navigate('/easyresearch/dashboard?create=true')}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                Create Project
              </button>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Users className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">No Participants</h3>
              <p className="text-[13px] text-slate-400 mb-5 max-w-sm mx-auto font-light">Invite participants to start collecting responses.</p>
              <button onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                <UserPlus size={14} /> Invite
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-slate-400 uppercase tracking-wider">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnrollments.map(enrollment => (
                    <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-slate-900">{enrollment.participant_email}</td>
                      <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">{new Date(enrollment.created_at).toLocaleDateString()}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-semibold text-slate-900">Invite Participant</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-slate-50">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="participant@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  onKeyDown={(e) => e.key === 'Enter' && sendInvitation()}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={sendInvitation} disabled={sendingInvite || !inviteEmail.trim()}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {sendingInvite ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantsPage;
