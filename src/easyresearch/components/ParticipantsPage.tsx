import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Mail, CheckCircle, Clock, XCircle, Download, X, Eye, ChevronRight, Hash, Network } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { bToast } from '../utils/bilingualToast';
import { loadProfileData } from '../utils/enrollmentSync';
import { useI18n } from '../hooks/useI18n';

interface Enrollment {
  id: string;
  project_id: string;
  participant_id: string | null;
  participant_email: string;
  participant_number?: string | null;
  participant_type_id?: string | null;
  status: 'invited' | 'active' | 'completed' | 'withdrawn';
  created_at: string;
  profile_data?: any;
  study_start_date?: string;
}

interface Project { id: string; title: string; }

// Inline component to load profile data from flat table
const ProfileDataSection: React.FC<{ enrollmentId: string }> = ({ enrollmentId }) => {
  const { t } = useI18n();
  const [data, setData] = useState<Record<string, any>>({});
  useEffect(() => { loadProfileData(enrollmentId).then(setData); }, [enrollmentId]);
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-stone-700 mb-2">{t('pp.profileData')}</h3>
      <div className="space-y-1.5">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="p-2.5 rounded-lg bg-stone-50">
            <p className="text-[11px] text-stone-400">{key}</p>
            <p className="text-[13px] text-stone-700">{Array.isArray(value) ? (value as string[]).join(', ') : String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
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
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentResponses, setEnrollmentResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate('/easyresearch/auth'); }, [user, authLoading, navigate]);
  useEffect(() => { if (user) loadProjects(); }, [user]);
  useEffect(() => {
    if (selectedProject) loadEnrollments();
    else if (projects.length > 0 && !selectedProject) setSelectedProject(projects[0].id);
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
      const { data, error } = await supabase.from('enrollment')
        .select('id, project_id, participant_id, participant_email, participant_number, participant_type_id, status, created_at, study_start_date')
        .eq('project_id', selectedProject).order('created_at', { ascending: false });
      if (error) throw error;
      setEnrollments((data || []) as Enrollment[]);
    } catch (error) { console.error('Error loading enrollments:', error); }
    finally { setLoading(false); }
  };

  const loadEnrollmentResponses = async (enrollmentId: string) => {
    setResponsesLoading(true);
    try {
      const { data: responsesData } = await supabase.from('survey_response')
        .select('id, question_id, response_text, response_value, created_at, instance_id')
        .eq('enrollment_id', enrollmentId).order('created_at', { ascending: false });
      
      const questionIds = Array.from(new Set((responsesData || []).map((r: any) => r.question_id).filter(Boolean)));
      let questionsMap = new Map();
      if (questionIds.length > 0) {
        const { data: questionsData } = await supabase.from('question').select('id, question_text, question_type, order_index').in('id', questionIds);
        questionsMap = new Map((questionsData || []).map((q: any) => [q.id, q]));
      }
      
      setEnrollmentResponses((responsesData || []).map((r: any) => ({ ...r, question: questionsMap.get(r.question_id) })));
    } catch (error) { console.error('Error loading responses:', error); }
    finally { setResponsesLoading(false); }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !selectedProject) { bToast.error('Please enter a valid email and select a project', '请输入有效邮箱并选择项目'); return; }
    setSendingInvite(true);
    try {
      const emailLower = inviteEmail.trim().toLowerCase();
      const { data: existing } = await supabase.from('enrollment').select('id').eq('project_id', selectedProject).eq('participant_email', emailLower).maybeSingle();
      if (existing) { bToast.error('This participant is already enrolled', '该参与者已经注册'); setSendingInvite(false); return; }
      const { error: enrollError } = await supabase.from('enrollment').insert({ project_id: selectedProject, participant_email: emailLower, status: 'invited' });
      if (enrollError) throw enrollError;
      bToast.success(`Participant ${emailLower} added`, `参与者 ${emailLower} 已添加`);
      setShowInviteModal(false); setInviteEmail(''); loadEnrollments();
    } catch (error: any) { console.error('Error sending invitation:', error); bToast.error('Failed to create invitation', '创建邀请失败'); }
    finally { setSendingInvite(false); }
  };

  const statusLabels: Record<string, string> = {
    invited: t('pp.invited'),
    active: t('pp.active'),
    completed: t('pp.completed'),
    withdrawn: t('pp.withdrawn'),
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
      invited: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Mail size={12} /> },
      active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle size={12} /> },
      completed: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', icon: <CheckCircle size={12} /> },
      withdrawn: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', icon: <XCircle size={12} /> }
    };
    const c = config[status] || config.invited;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${c.bg} ${c.text} ${c.border}`}>{c.icon}{statusLabels[status] || status}</span>;
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = !searchQuery || e.participant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.participant_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredEnrollments.length === 0) return;
    const headers = ['Email', 'Participant #', 'Role', 'Status', 'Enrolled At', 'Study Start'];
    const csvData = filteredEnrollments.map(e => [
      e.participant_email, e.participant_number || '',
      e.status, new Date(e.created_at).toLocaleString(), e.study_start_date || ''
    ]);
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'participants.csv'; a.click();
  };

  const filterTabs = [
    { key: 'all', label: t('pp.all') },
    { key: 'invited', label: t('pp.invited') },
    { key: 'active', label: t('pp.active') },
    { key: 'completed', label: t('pp.completed') },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-800">{t('pp.title')}</h1>
            <p className="text-[13px] text-stone-400 mt-1 font-light">{t('pp.subtitle')}</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} disabled={!selectedProject}
            className="px-4 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5 disabled:opacity-50">
            <UserPlus size={16} /> {t('pp.invite')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: t('pp.total'), value: enrollments.length, icon: Users, gradient: 'from-emerald-50 to-teal-50', iconColor: 'text-emerald-600' },
            { label: t('pp.invited'), value: enrollments.filter(e => e.status === 'invited').length, icon: Mail, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600' },
            { label: t('pp.active'), value: enrollments.filter(e => e.status === 'active').length, icon: CheckCircle, gradient: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600' },
            { label: t('pp.completed'), value: enrollments.filter(e => e.status === 'completed').length, icon: Clock, gradient: 'from-violet-50 to-purple-50', iconColor: 'text-violet-600' }
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 border border-white/60`}>
              <stat.icon size={16} className={`${stat.iconColor} mb-3`} strokeWidth={1.5} />
              <p className="text-2xl font-semibold tracking-tight text-stone-800">{stat.value}</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={projects.length === 0}
              className="px-3 py-1.5 rounded-full text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 disabled:opacity-50">
              {projects.length === 0 && <option value="" disabled>{t('pp.noProjects')}</option>}
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <div className="flex gap-1 bg-stone-100 rounded-full p-0.5">
              {filterTabs.map(tab => (
                <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${statusFilter === tab.key ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
              <input type="text" placeholder={t('pp.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full w-48 text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white" />
            </div>
            <button onClick={exportToCSV} disabled={filteredEnrollments.length === 0}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors" title="Export CSV">
              <Download size={16} className="text-stone-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mx-auto"></div></div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <Users className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">{projects.length === 0 ? t('pp.noProjectsYet') : t('pp.noParticipants')}</h3>
              <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">
                {projects.length === 0 ? t('pp.createFirst') : t('pp.inviteToCollect')}
              </p>
              <button onClick={() => projects.length === 0 ? navigate('/easyresearch/dashboard?create=true') : setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200">
                {projects.length === 0 ? t('pp.createProject') : <><UserPlus size={14} /> {t('pp.invite')}</>}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100" style={{ backgroundColor: 'rgba(16,185,129,0.03)' }}>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">{t('pp.participant')}</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">{t('pp.idRole')}</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">{t('pp.status')}</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">{t('pp.enrolled')}</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredEnrollments.map(enrollment => (
                    <tr key={enrollment.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                      onClick={() => { setSelectedEnrollment(enrollment); loadEnrollmentResponses(enrollment.id); }}>
                      <td className="px-4 py-3 text-[13px] font-medium text-stone-800">{enrollment.participant_email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {enrollment.participant_number && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {enrollment.participant_number}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                      <td className="px-4 py-3 text-[12px] text-stone-400">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Eye size={14} className="text-stone-300 hover:text-emerald-500 transition-colors" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="text-[15px] font-semibold text-stone-800">{t('pp.inviteParticipant')}</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-stone-50"><X size={16} className="text-stone-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">{t('pp.emailAddress')}</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="participant@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-stone-50/50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  onKeyDown={(e) => e.key === 'Enter' && sendInvitation()} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50">{t('pp.cancel')}</button>
                <button onClick={sendInvitation} disabled={sendingInvite || !inviteEmail.trim()}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 shadow-sm shadow-emerald-200">
                  {sendingInvite ? t('pp.adding') : t('pp.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participant Detail Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setSelectedEnrollment(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-800">{t('pp.participantDetails')}</h2>
                <p className="text-[12px] text-stone-400">{selectedEnrollment.participant_email}</p>
              </div>
              <button onClick={() => setSelectedEnrollment(null)} className="p-1.5 rounded-lg hover:bg-stone-50">
                <X size={16} className="text-stone-400" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50">
                  <p className="text-[11px] text-stone-400">{t('pp.status')}</p>
                  <div className="mt-1">{getStatusBadge(selectedEnrollment.status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50">
                  <p className="text-[11px] text-stone-400">{t('pp.enrolled')}</p>
                  <p className="text-[13px] font-medium text-stone-700 mt-1">{new Date(selectedEnrollment.created_at).toLocaleDateString()}</p>
                </div>
                {selectedEnrollment.participant_number && (
                  <div className="p-3 rounded-xl bg-indigo-50">
                    <p className="text-[11px] text-indigo-400">{t('pp.participantNum')}</p>
                    <p className="text-[14px] font-bold text-indigo-600 mt-1">{selectedEnrollment.participant_number}</p>
                  </div>
                )}
                {selectedEnrollment.study_start_date && (
                  <div className="p-3 rounded-xl bg-stone-50">
                    <p className="text-[11px] text-stone-400">{t('pp.studyStart')}</p>
                    <p className="text-[13px] font-medium text-stone-700 mt-1">{selectedEnrollment.study_start_date}</p>
                  </div>
                )}
              </div>

              {/* Profile Data */}
              <ProfileDataSection enrollmentId={selectedEnrollment.id} />

              {/* Survey Responses */}
              <div>
                <h3 className="text-[13px] font-semibold text-stone-700 mb-2">
                  {t('pp.surveyResponses')} ({enrollmentResponses.length})
                </h3>
                {responsesLoading ? (
                  <div className="py-6 text-center"><div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent mx-auto"></div></div>
                ) : enrollmentResponses.length === 0 ? (
                  <p className="text-[12px] text-stone-400 py-4 text-center">{t('pp.noResponsesYet')}</p>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {enrollmentResponses.slice(0, 50).map(r => (
                      <div key={r.id} className="p-2.5 rounded-lg bg-stone-50 text-[12px]">
                        <span className="font-medium text-stone-600">{r.question?.question_text?.substring(0, 50) || 'Q'}:</span>{' '}
                        <span className="text-stone-500">{r.response_text?.substring(0, 100) || JSON.stringify(r.response_value)?.substring(0, 100) || '-'}</span>
                      </div>
                    ))}
                    {enrollmentResponses.length > 50 && <p className="text-[11px] text-stone-400 text-center">+{enrollmentResponses.length - 50} {t('pp.more')}</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setSelectedEnrollment(null)}
                className="w-full py-2.5 rounded-full text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
                {t('pp.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantsPage;
