import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { authClient } from '../../lib/supabase';
import { Bell, Moon, User, FileText, CheckCircle, LogIn, LogOut } from 'lucide-react';

interface ProfileQuestion {
  id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  options?: any[];
}

interface EnrollmentQuestion {
  id: string;
  project_id: string;
  question_text: string;
  question_type: string;
  options: any[] | null;
  required: boolean;
  order_index: number;
}

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

  useEffect(() => {
    loadSettings();
    checkAuth();
  }, [projectId]);

  const checkAuth = async () => {
    const { data: { user } } = await authClient.auth.getUser();
    setCurrentUser(user);
  };

  const loadSettings = async () => {
    try {
      // Load project
      const { data: projectData } = await supabase
        .from('research_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setProject(projectData);
        
        // Load profile questions if configured
        if (projectData.profile_questions) {
          setProfileQuestions(projectData.profile_questions);
        }
      }

      // Load enrollment questions
      const { data: questionsData } = await supabase
        .from('enrollment_questions')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (questionsData) {
        setEnrollmentQuestions(questionsData);
      }

      // Load enrollment
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('id', enrollmentId)
          .single();

        if (enrollmentData) {
          setEnrollment(enrollmentData);
          setProfileData(enrollmentData.profile_data || {});
          setEnrollmentResponses(enrollmentData.enrollment_responses || {});
          setDndSettings(enrollmentData.dnd_settings || { periods: [] });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!enrollment) return;
    
    setSaving(true);
    try {
      await supabase
        .from('enrollments')
        .update({
          profile_data: profileData,
          enrollment_responses: enrollmentResponses,
          dnd_settings: dndSettings
        })
        .eq('id', enrollment.id);

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addDndPeriod = () => {
    setDndSettings({
      ...dndSettings,
      periods: [
        ...(dndSettings.periods || []),
        { start_time: '22:00', end_time: '08:00', days: ['all'] }
      ]
    });
  };

  const updateDndPeriod = (index: number, field: string, value: any) => {
    const newPeriods = [...dndSettings.periods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setDndSettings({ ...dndSettings, periods: newPeriods });
  };

  const removeDndPeriod = (index: number) => {
    setDndSettings({
      ...dndSettings,
      periods: dndSettings.periods.filter((_: any, i: number) => i !== index)
    });
  };

  const handleLogin = () => {
    navigate('/easyresearch/auth');
  };

  const handleLogout = async () => {
    await authClient.auth.signOut();
    setCurrentUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your profile and notification preferences
            </p>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-6">
              <User size={24} style={{ color: 'var(--color-green)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Account
              </h2>
            </div>

            {currentUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Email
                  </p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {currentUser.email}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    User ID
                  </p>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                    {currentUser.id}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Sign in to access your researches and manage your account
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                >
                  <LogIn size={20} />
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Enrollment Questions */}
          {enrollmentQuestions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} style={{ color: 'var(--color-green)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Enrollment Information
                </h2>
              </div>

              <div className="space-y-4">
                {enrollmentQuestions.map((question) => (
                  <div key={question.id}>
                    <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      {question.question_text}
                      {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    
                    {question.question_type === 'number' && (
                      <input
                        type="number"
                        value={enrollmentResponses[question.id] || ''}
                        onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    )}
                    
                    {question.question_type === 'short_text' && (
                      <input
                        type="text"
                        value={enrollmentResponses[question.id] || ''}
                        onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    )}
                    
                    {question.question_type === 'long_text' && (
                      <textarea
                        value={enrollmentResponses[question.id] || ''}
                        onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    )}
                    
                    {question.question_type === 'single_choice' && question.options && (
                      <select
                        value={enrollmentResponses[question.id] || ''}
                        onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      >
                        <option value="">Select an option</option>
                        {question.options.map((option: string, idx: number) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {question.question_type === 'yes_no' && (
                      <select
                        value={enrollmentResponses[question.id] || ''}
                        onChange={(e) => setEnrollmentResponses({ ...enrollmentResponses, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      >
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Questions */}
          {profileQuestions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-6">
                <User size={24} style={{ color: 'var(--color-green)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Profile Information
                </h2>
              </div>

              <div className="space-y-4">
                {profileQuestions.map((question) => (
                  <div key={question.id}>
                    <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      {question.question_text}
                      {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    
                    {question.question_type === 'short_text' && (
                      <input
                        type="text"
                        value={profileData[question.id] || ''}
                        onChange={(e) => setProfileData({ ...profileData, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    )}
                    
                    {question.question_type === 'long_text' && (
                      <textarea
                        value={profileData[question.id] || ''}
                        onChange={(e) => setProfileData({ ...profileData, [question.id]: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    )}
                    
                    {question.question_type === 'single_choice' && (
                      <select
                        value={profileData[question.id] || ''}
                        onChange={(e) => setProfileData({ ...profileData, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      >
                        <option value="">Select an option</option>
                        {(question.options || []).map((option: any) => (
                          <option key={option.id} value={option.id}>
                            {option.text || option.option_text}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-6">
              <Bell size={24} style={{ color: 'var(--color-green)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </h2>
            </div>

            <div className="flex items-center justify-between mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Enable Notifications
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Receive reminders for scheduled surveys
                </p>
              </div>
              <button
                onClick={() => setNotificationEnabled(!notificationEnabled)}
                className="w-12 h-6 rounded-full transition-all"
                style={{
                  backgroundColor: notificationEnabled ? 'var(--color-green)' : '#d1d5db'
                }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-all"
                  style={{
                    transform: notificationEnabled ? 'translateX(24px)' : 'translateX(2px)'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Do Not Disturb */}
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-6">
              <Moon size={24} style={{ color: 'var(--color-green)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Do Not Disturb
              </h2>
            </div>

            <div className="space-y-4">
              {(dndSettings.periods || []).map((period: any, index: number) => (
                <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={period.start_time}
                        onChange={(e) => updateDndPeriod(index, 'start_time', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={period.end_time}
                        onChange={(e) => updateDndPeriod(index, 'end_time', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{ border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <button
                      onClick={() => removeDndPeriod(index)}
                      className="mt-6 px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addDndPeriod}
                className="w-full px-4 py-3 rounded-lg font-semibold"
                style={{ border: '2px dashed var(--color-green)', color: 'var(--color-green)' }}
              >
                + Add DND Period
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full px-6 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ParticipantSettings;
