import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, Search, Mail, CheckCircle, Clock, XCircle, Download, X, Eye, Hash, MessageSquare, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bToast } from '../utils/bilingualToast';

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

interface ParticipantType {
  id: string;
  name: string;
  color?: string;
  numbering_enabled?: boolean;
  number_prefix?: string;
}

interface ParticipantProfile {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  country?: string;
  region?: string;
  age?: number;
  occupation?: string;
  bio?: string;
}

type SubView = 'manage' | 'find';

interface Props {
  projectId: string;
}

const ProjectParticipantsTab: React.FC<Props> = ({ projectId }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [subView, setSubView] = useState<SubView>('manage');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [participantTypes, setParticipantTypes] = useState<ParticipantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTypeId, setInviteTypeId] = useState<string>('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentResponses, setEnrollmentResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // Find participants state
  const [libraryProfiles, setLibraryProfiles] = useState<ParticipantProfile[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => { loadEnrollments(); loadParticipantTypes(); }, [projectId]);

  const startConversation = async (enrollment: Enrollment) => {
    if (!user || !enrollment.participant_id) {
      bToast.error('Cannot message: participant has not joined yet', '无法发消息：参与者尚未加入');
      return;
    }
    try {
      const { data: existing } = await supabase.from('conversations')
        .select('id')
        .eq('project_id', projectId)
        .eq('researcher_user_id', user.id)
        .eq('participant_user_id', enrollment.participant_id)
        .maybeSingle();
      if (existing) {
        navigate(`/easyresearch/inbox/${existing.id}`);
        return;
      }
      const { data: newConv, error } = await supabase.from('conversations').insert({
        project_id: projectId,
        researcher_user_id: user.id,
        participant_user_id: enrollment.participant_id,
        last_message_at: new Date().toISOString(),
        last_message_preview: null,
      }).select('id').single();
      if (error) throw error;
      navigate(`/easyresearch/inbox/${newConv.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Failed to start conversation');
    }
  };

  useEffect(() => { if (subView === 'find') loadLibrary(); }, [subView]);

  const loadParticipantTypes = async () => {
    try {
      const { data } = await supabase.from('participant_type')
        .select('id, name, color, numbering_enabled, number_prefix')
        .eq('project_id', projectId).order('order_index');
      setParticipantTypes((data || []) as ParticipantType[]);
    } catch (e) { console.error('Error loading participant types:', e); }
  };

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('enrollment')
        .select('id, project_id, participant_id, participant_email, participant_number, participant_type_id, status, created_at, study_start_date')
        .eq('project_id', projectId).order('created_at', { ascending: false });
      if (error) throw error;
      setEnrollments((data || []) as Enrollment[]);
    } catch (error) { console.error('Error loading enrollments:', error); }
    finally { setLoading(false); }
  };

  const loadLibrary = async () => {
    setLibraryLoading(true);
    try {
      const { data } = await supabase.from('profile')
        .select('id, user_id, full_name, email, country, region, age, occupation, bio')
        .eq('join_participant_library', true)
        .order('full_name');
      setLibraryProfiles((data || []) as ParticipantProfile[]);
    } catch (e) { console.error('Error loading library:', e); }
    finally { setLibraryLoading(false); }
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

  // Generate participant_number based on type prefix and existing count
  // 根据类型前缀和已有数量生成参与者编号
  const generateParticipantNumber = async (typeId?: string): Promise<string | null> => {
    if (!typeId) {
      // Global numbering fallback: count all enrollments in project
      const count = enrollments.filter(e => !e.participant_type_id).length;
      return `P${String(count + 1).padStart(3, '0')}`;
    }
    const pType = participantTypes.find(t => t.id === typeId);
    if (!pType || !pType.numbering_enabled) return null;
    const prefix = pType.number_prefix || 'P';
    const count = enrollments.filter(e => e.participant_type_id === typeId).length;
    return `${prefix}${String(count + 1).padStart(3, '0')}`;
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) { toast.error('Please enter a valid email'); return; }
    setSendingInvite(true);
    try {
      const emailLower = inviteEmail.trim().toLowerCase();
      const { data: existing } = await supabase.from('enrollment').select('id').eq('project_id', projectId).eq('participant_email', emailLower).maybeSingle();
      if (existing) { toast.error('This participant is already enrolled'); setSendingInvite(false); return; }

      const participantNumber = await generateParticipantNumber(inviteTypeId || undefined);

      const insertData: any = {
        project_id: projectId,
        participant_email: emailLower,
        status: 'invited',
      };
      if (inviteTypeId) insertData.participant_type_id = inviteTypeId;
      if (participantNumber) insertData.participant_number = participantNumber;

      const { error } = await supabase.from('enrollment').insert(insertData);
      if (error) throw error;
      toast.success(`${t('nav.participants')}: ${emailLower} added`);
      setShowInviteModal(false); setInviteEmail(''); setInviteTypeId(''); loadEnrollments();
    } catch (error: any) { console.error('Error sending invitation:', error); toast.error('Failed to create invitation'); }
    finally { setSendingInvite(false); }
  };

  const inviteFromLibrary = async (profile: ParticipantProfile) => {
    const email = profile.email || '';
    if (!email) { toast.error('This participant has no email'); return; }
    try {
      const { data: existing } = await supabase.from('enrollment').select('id').eq('project_id', projectId).eq('participant_email', email.toLowerCase()).maybeSingle();
      if (existing) { toast.error('Already enrolled'); return; }
      const participantNumber = await generateParticipantNumber(undefined);
      const { error } = await supabase.from('enrollment').insert({
        project_id: projectId,
        participant_email: email.toLowerCase(),
        status: 'invited',
        participant_id: profile.user_id,
        ...(participantNumber ? { participant_number: participantNumber } : {}),
      });
      if (error) throw error;
      toast.success(`Invited ${profile.full_name}`);
      loadEnrollments();
    } catch (e: any) { toast.error('Failed to invite'); }
  };

  // Lookup helpers
  const getTypeName = (typeId?: string | null) => {
    if (!typeId) return null;
    return participantTypes.find(t => t.id === typeId);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
      invited: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Mail size={12} /> },
      active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle size={12} /> },
      completed: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', icon: <CheckCircle size={12} /> },
      withdrawn: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', icon: <XCircle size={12} /> }
    };
    const c = config[status] || config.invited;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${c.bg} ${c.text} ${c.border}`}>{c.icon}{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = !searchQuery || e.participant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.participant_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLibrary = libraryProfiles.filter(p => {
    const matchesSearch = !librarySearch || p.full_name?.toLowerCase().includes(librarySearch.toLowerCase()) ||
      p.occupation?.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesCountry = !countryFilter || p.country === countryFilter;
    const enrolled = enrollments.some(e => e.participant_id === p.user_id || e.participant_email === p.email?.toLowerCase());
    return matchesSearch && matchesCountry && !enrolled;
  });

  const countries = useMemo(() => Array.from(new Set(libraryProfiles.map(p => p.country).filter(Boolean))).sort(), [libraryProfiles]);

  const exportToCSV = () => {
    if (filteredEnrollments.length === 0) return;
    const headers = ['Email', 'Participant #', 'Type', 'Status', 'Enrolled At', 'Study Start'];
    const csvData = filteredEnrollments.map(e => {
      const pType = getTypeName(e.participant_type_id);
      return [
        e.participant_email, e.participant_number || '',
        pType?.name || '', e.status,
        new Date(e.created_at).toLocaleString(), e.study_start_date || ''
      ];
    });
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'participants.csv'; a.click();
  };

  return (
    <div>
      {/* Sub-navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
          <button onClick={() => setSubView('manage')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${subView === 'manage' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
            <Users size={14} /> {t('nav.participants')}
          </button>
          <button onClick={() => setSubView('find')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${subView === 'find' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
            <Search size={14} /> {t('project.findParticipants')}
          </button>
        </div>
        {subView === 'manage' && (
          <button onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5">
            <UserPlus size={16} /> {t('project.inviteParticipant')}
          </button>
        )}
      </div>

      {/* MANAGE view */}
      {subView === 'manage' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: t('project.totalParticipants'), value: enrollments.length, icon: Users, gradient: 'from-emerald-50 to-teal-50', iconColor: 'text-emerald-600' },
              { label: t('project.invited'), value: enrollments.filter(e => e.status === 'invited').length, icon: Mail, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600' },
              { label: t('project.active'), value: enrollments.filter(e => e.status === 'active').length, icon: CheckCircle, gradient: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600' },
              { label: t('responses.completed'), value: enrollments.filter(e => e.status === 'completed').length, icon: Clock, gradient: 'from-violet-50 to-purple-50', iconColor: 'text-violet-600' }
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
              <div className="flex gap-1 bg-stone-100 rounded-full p-0.5">
                {['all', 'invited', 'active', 'completed'].map(tab => (
                  <button key={tab} onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all ${statusFilter === tab ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                    {tab === 'all' ? t('responses.allQuestionnaires').split(' ')[0] : tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
                <input type="text" placeholder={`${t('common.search')}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
                <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">{t('project.noParticipants')}</h3>
                <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">{t('project.noParticipantsDesc')}</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200">
                    <UserPlus size={14} /> {t('project.inviteParticipant')}
                  </button>
                  <button onClick={() => setSubView('find')}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200">
                    <Search size={14} /> {t('project.findParticipants')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100" style={{ backgroundColor: 'rgba(16,185,129,0.03)' }}>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">{t('nav.participants')}</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">ID</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider">{t('project.enrolled')}</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-stone-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredEnrollments.map(enrollment => {
                      const pType = getTypeName(enrollment.participant_type_id);
                      return (
                        <tr key={enrollment.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                          onClick={() => { setSelectedEnrollment(enrollment); loadEnrollmentResponses(enrollment.id); }}>
                          <td className="px-4 py-3 text-[13px] font-medium text-stone-800">{enrollment.participant_email}</td>
                          <td className="px-4 py-3">
                            {enrollment.participant_number && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {enrollment.participant_number}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {pType ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                                style={{
                                  backgroundColor: pType.color ? `${pType.color}15` : '#f5f5f4',
                                  color: pType.color || '#78716c',
                                  borderColor: pType.color ? `${pType.color}30` : '#e7e5e4',
                                }}>
                                {pType.name}
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                          <td className="px-4 py-3 text-[12px] text-stone-400">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); startConversation(enrollment); }}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors" title="Message participant / 发送消息"
                              >
                                <MessageSquare size={14} className="text-emerald-500" />
                              </button>
                              <Eye size={14} className="text-stone-300 hover:text-emerald-500 transition-colors cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setSelectedEnrollment(enrollment); loadEnrollmentResponses(enrollment.id); }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* FIND PARTICIPANTS view */}
      {subView === 'find' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-800">{t('participantLibrary.title')}</h2>
              <p className="text-[13px] text-stone-400 font-light">{t('project.findParticipantsDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
                <input type="text" placeholder={`${t('common.search')}...`} value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-full w-48 text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white" />
              </div>
              {countries.length > 0 && (
                <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-full text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">{t('participantLibrary.allCountries')}</option>
                  {countries.map(c => <option key={c} value={c!}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {libraryLoading ? (
            <div className="p-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mx-auto"></div></div>
          ) : filteredLibrary.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-16 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-stone-200" />
              <p className="text-[14px] font-medium text-stone-800 mb-1">{t('participantLibrary.noResults')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibrary.map(profile => (
                <div key={profile.id} className="bg-white rounded-2xl border border-stone-100 p-5 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[14px] font-semibold text-stone-800">{profile.full_name}</h3>
                      {profile.occupation && <p className="text-[12px] text-stone-400">{profile.occupation}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      {profile.country && <span>{profile.country}</span>}
                      {profile.age && <span>· {profile.age}</span>}
                    </div>
                  </div>
                  {profile.bio && <p className="text-[12px] text-stone-500 mb-3 line-clamp-2">{profile.bio}</p>}
                  <button onClick={() => inviteFromLibrary(profile)}
                    className="w-full py-2 rounded-full text-[12px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
                    <UserPlus size={13} /> {t('participantLibrary.inviteToStudy')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal — with participant type selection / 邀请弹窗——含参与者类型选择 */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="text-[15px] font-semibold text-stone-800">{t('project.inviteParticipant')}</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-stone-50"><X size={16} className="text-stone-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="participant@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-stone-50/50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  onKeyDown={(e) => e.key === 'Enter' && sendInvitation()} />
              </div>
              {participantTypes.length > 0 && (
                <div>
                  <label className="block text-[12px] font-medium text-stone-400 mb-1.5">
                    Participant Type / 参与者类型
                  </label>
                  <select value={inviteTypeId} onChange={(e) => setInviteTypeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-stone-50/50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                    <option value="">— No type / 无类型 —</option>
                    {participantTypes.map(pt => (
                      <option key={pt.id} value={pt.id}>{pt.name}{pt.number_prefix ? ` (${pt.number_prefix}...)` : ''}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50">{t('common.cancel')}</button>
                <button onClick={sendInvitation} disabled={sendingInvite || !inviteEmail.trim()}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 shadow-sm shadow-emerald-200">
                  {sendingInvite ? '...' : t('project.inviteParticipant')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participant Detail Modal — shows ID, type, responses, and message shortcut */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setSelectedEnrollment(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-800">{selectedEnrollment.participant_email}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {getStatusBadge(selectedEnrollment.status)}
                  {selectedEnrollment.participant_number && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {selectedEnrollment.participant_number}
                    </span>
                  )}
                  {(() => {
                    const pType = getTypeName(selectedEnrollment.participant_type_id);
                    return pType ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                        style={{
                          backgroundColor: pType.color ? `${pType.color}15` : '#f5f5f4',
                          color: pType.color || '#78716c',
                          borderColor: pType.color ? `${pType.color}30` : '#e7e5e4',
                        }}>
                        {pType.name}
                      </span>
                    ) : null;
                  })()}
                  <span className="text-[11px] text-stone-400">{new Date(selectedEnrollment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startConversation(selectedEnrollment)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  <MessageSquare size={13} /> Message / 消息
                </button>
                <button onClick={() => setSelectedEnrollment(null)} className="p-1 rounded-lg hover:bg-stone-50"><X size={16} className="text-stone-400" /></button>
              </div>
            </div>
            <div className="p-5">
              {responsesLoading ? (
                <div className="text-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent mx-auto"></div></div>
              ) : enrollmentResponses.length === 0 ? (
                <p className="text-[13px] text-stone-400 text-center py-8">{t('responses.noResponses')}</p>
              ) : (
                <div className="space-y-2">
                  {enrollmentResponses.map((r: any) => (
                    <div key={r.id} className="p-3 rounded-xl bg-stone-50">
                      <p className="text-[12px] font-medium text-stone-700">{r.question?.question_text || 'Question'}</p>
                      <p className="text-[12px] text-stone-500 mt-1">{r.response_text || (r.response_value != null ? String(r.response_value) : 'No response')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectParticipantsTab;
