import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authClient, supabase } from '../../lib/supabase';
import { Bell, Moon, User, LogOut, LogIn, FileText, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import EcogramBuilder, { EcogramMember } from './EcogramBuilder';
import { scheduleStudyNotifications, requestNotificationPermission } from '../services/notificationService';

interface ProfileQuestion { id: string; question_text: string; question_type: string; required: boolean; options?: any[]; }
interface EnrollmentQuestion { id: string; project_id: string; question_text: string; question_type: string; options: any[] | null; required: boolean; order_index: number; }

const ParticipantSettings: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>({});
  const [dndSettings, setDndSettings] = useState<any>({ periods: [] });
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestion[]>([]);
  const [enrollmentQuestions, setEnrollmentQuestions] = useState<EnrollmentQuestion[]>([]);
  const [enrollmentResponses, setEnrollmentResponses] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ecogramData, setEcogramData] = useState<{ members: EcogramMember[]; lastUpdated: string | null }>({ members: [], lastUpdated: null });

  useEffect(() => { loadSettings(); checkAuth(); }, [projectId]);

  const checkAuth = async () => { const { data: { user } } = await authClient.auth.getUser(); setCurrentUser(user); };

  const loadSettings = async () => {
    try {
      const { data: projectData } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
      if (projectData) {
        setProject({ 
          ...(projectData as any), 
          ecogram_enabled: projectData.ecogram_enabled || false,
          notification_enabled: projectData.notification_enabled,
          study_duration: projectData.study_duration,
          survey_frequency: projectData.survey_frequency,
        });
        // Load profile questions from profile_question table
        const { data: profileRows } = await supabase
          .from('profile_question')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index');
        if (profileRows) setProfileQuestions(profileRows);
      }
      const { data: questionsData } = await supabase.from('enrollment_question').select('*').eq('project_id', projectId).order('order_index');
      if (questionsData) setEnrollmentQuestions((questionsData as any[]).map((q: any) => ({ ...q, options: q.options ?? q.option ?? null })));
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) {
        const { data: enrollmentData } = await supabase.from('enrollment').select('*').eq('id', enrollmentId).maybeSingle();
        if (enrollmentData) { 
          setEnrollment(enrollmentData); 
          setProfileData(enrollmentData.profile_data || {}); 
          setEnrollmentResponses(enrollmentData.enrollment_data || {}); 
          setDndSettings(enrollmentData.dnd_setting || { periods: [] }); 
          setEcogramData(enrollmentData.ecogram_data || { members: [], lastUpdated: null });
        }
      }
    } catch (error) { console.error('Error loading settings:', error); }
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    if (!enrollment) return;
    setSaving(true);
    try {
      await supabase.from('enrollment').update({ 
        profile_data: profileData, 
        enrollment_data: enrollmentResponses, 
        dnd_setting: dndSettings,
        ecogram_data: ecogramData 
      }).eq('id', enrollment.id);

      // Re-schedule notifications with updated DND if project has notifications enabled
      if (notificationEnabled && project?.notification_enabled && project?.project_type !== 'survey') {
        const dndPeriods = (dndSettings.periods || []).map((p: any) => ({
          start_time: p.start_time,
          end_time: p.end_time,
        }));
        await requestNotificationPermission();
        await scheduleStudyNotifications({
          studyDuration: project.study_duration || 7,
          frequency: project.survey_frequency || 'daily',
          dndPeriods,
          projectTitle: project.title || 'Study',
          projectId: project.id,
        }, new Date(enrollment.study_start_date || enrollment.created_at));
      }

      toast.success('Settings saved!');
    } catch (error) { console.error('Error saving settings:', error); toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const addDndPeriod = () => { setDndSettings({ ...dndSettings, periods: [...(dndSettings.periods || []), { start_time: '22:00', end_time: '08:00', days: ['all'] }] }); };
  const updateDndPeriod = (index: number, field: string, value: any) => { const newPeriods = [...dndSettings.periods]; newPeriods[index] = { ...newPeriods[index], [field]: value }; setDndSettings({ ...dndSettings, periods: newPeriods }); };
  const removeDndPeriod = (index: number) => { setDndSettings({ ...dndSettings, periods: dndSettings.periods.filter((_: any, i: number) => i !== index) }); };
  const handleLogin = () => { navigate('/easyresearch/auth'); };
  const handleLogout = async () => { await authClient.auth.signOut(); setCurrentUser(null); window.location.reload(); };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const SectionCard = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-4 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-stone-50">
        <Icon size={18} className="text-emerald-500" />
        <h2 className="text-[14px] font-semibold text-stone-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="pb-4 bg-stone-50/50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">Settings</h1>
          <p className="text-[13px] text-stone-400 font-light mt-0.5">Manage your profile and preferences</p>
        </div>

        <SectionCard icon={User} title="Account">
          {currentUser ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-stone-50">
                <p className="text-[11px] font-medium text-stone-400 mb-0.5">Email</p>
                <p className="text-[13px] font-medium text-stone-700">{currentUser.email}</p>
              </div>
              <button onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[13px] text-stone-400 font-light mb-3">Sign in to access your researches</p>
              <button onClick={handleLogin}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <LogIn size={14} /> Sign In
              </button>
            </div>
          )}
        </SectionCard>

        {enrollmentQuestions.length > 0 && (
          <SectionCard icon={FileText} title="Enrollment Information">
            <div className="space-y-4">
              {enrollmentQuestions.map((question) => (
                <div key={question.id}>
                  <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                    {question.question_text}{question.required && <span className="text-red-400"> *</span>}
                  </label>
                  {['number', 'short_text'].includes(question.question_type) && (
                    <input type={question.question_type === 'number' ? 'number' : 'text'} value={enrollmentResponses[question.id] || ''}
                      onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" />
                  )}
                  {question.question_type === 'long_text' && (
                    <textarea value={enrollmentResponses[question.id] || ''} onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                      rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" />
                  )}
                  {(question.question_type === 'single_choice' || question.question_type === 'yes_no') && (
                    <select value={enrollmentResponses[question.id] || ''} onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                      <option value="">Select an option</option>
                      {question.question_type === 'yes_no' ? (
                        <><option value="yes">Yes</option><option value="no">No</option></>
                      ) : (
                        (question.options || []).map((option: string, idx: number) => (
                          <option key={idx} value={option}>{option}</option>
                        ))
                      )}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {profileQuestions.length > 0 && (
          <SectionCard icon={User} title="Profile Information">
            <div className="space-y-4">
              {profileQuestions.map((question) => (
                <div key={question.id}>
                  <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                    {question.question_text}{question.required && <span className="text-red-400"> *</span>}
                  </label>
                  {question.question_type === 'short_text' && (
                    <input type="text" value={profileData[question.id] || ''} onChange={(e) => setProfileData({ ...profileData, [question.id]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" />
                  )}
                  {question.question_type === 'long_text' && (
                    <textarea value={profileData[question.id] || ''} onChange={(e) => setProfileData({ ...profileData, [question.id]: e.target.value })}
                      rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" />
                  )}
                  {question.question_type === 'single_choice' && (
                    <select value={profileData[question.id] || ''} onChange={(e) => setProfileData({ ...profileData, [question.id]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                      <option value="">Select an option</option>
                      {(question.options || []).map((option: any) => (
                        <option key={option.id} value={option.id}>{option.text || option.option_text}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard icon={Bell} title="Notifications">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50">
            <div>
              <p className="text-[13px] font-medium text-stone-700">Enable Notifications</p>
              <p className="text-[11px] text-stone-400 font-light">Receive reminders for surveys</p>
            </div>
            <button onClick={() => setNotificationEnabled(!notificationEnabled)}
              className={`w-10 h-5 rounded-full transition-all relative ${notificationEnabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${notificationEnabled ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </SectionCard>

        <SectionCard icon={Moon} title="Do Not Disturb">
          <div className="space-y-3">
            {(dndSettings.periods || []).map((period: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-xl border border-stone-100">
                <input type="time" value={period.start_time || ''} onChange={(e) => updateDndPeriod(index, 'start_time', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                <span className="text-[11px] text-stone-400">to</span>
                <input type="time" value={period.end_time || ''} onChange={(e) => updateDndPeriod(index, 'end_time', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                <button onClick={() => removeDndPeriod(index)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors text-[12px]">✕</button>
              </div>
            ))}
            <button onClick={addDndPeriod}
              className="w-full py-2.5 rounded-xl border border-dashed border-stone-200 text-[12px] font-medium text-emerald-500 hover:bg-emerald-50/50 transition-colors">
              + Add DND Period
            </button>
          </div>
        </SectionCard>

        {project?.ecogram_enabled && (
          <SectionCard icon={Network} title="Care Network (Ecogram)">
            <EcogramBuilder
              initialData={ecogramData}
              onSave={(data) => {
                setEcogramData(data);
                toast.success('Ecogram updated — press Save Settings to persist');
              }}
              centerLabel={project?.ecogram_config?.center_label || 'You'}
              relationshipOptions={project?.ecogram_config?.relationship_options}
              supportCategories={project?.ecogram_config?.support_categories}
            />
          </SectionCard>
        )}

        {enrollment && (
          <button onClick={saveSettings} disabled={saving}
            className="w-full py-3 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-200/50 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ParticipantSettings;
