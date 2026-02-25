import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Calendar, Clock, CheckCircle, Circle, AlertCircle, 
  TrendingUp, Award, Bell, ChevronRight, BarChart3,
  Smartphone, Zap, Mic, Play, Plus, Trash2, Edit2
} from 'lucide-react';
import ParticipantNotificationSettings from './ParticipantNotificationSettings';
import ParticipantSurveyView from './ParticipantSurveyView';
import CompletedSurveyView from './CompletedSurveyView';
import AddEntryDialog from './AddEntryDialog';

interface SurveyInstance {
  id: string;
  instance_number: number;
  scheduled_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'late';
  day_number: number;
  time_point: string;
  completion_rate?: number;
}

interface ComplianceData {
  date: string;
  expected_responses: number;
  completed_responses: number;
  missed_responses: number;
  compliance_rate: number;
  streak_days: number;
}

const ESMParticipantDashboard: React.FC = () => {
  const { projectId: urlEnrollmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [instances, setInstances] = useState<SurveyInstance[]>([]);
  const [compliance, setCompliance] = useState<ComplianceData[]>([]);
  const [currentInstance, setCurrentInstance] = useState<SurveyInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'summary' | 'help' | 'settings'>('timeline');
  const [completedResponses, setCompletedResponses] = useState<any[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'scheduled' | 'late' | 'missed'>('all');
  const [showAddEntryDialog, setShowAddEntryDialog] = useState(false);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editedResponses, setEditedResponses] = useState<any>({});
  const [summaryDayFilter, setSummaryDayFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    if (urlEnrollmentId) {
      loadDashboardData();
    }
  }, [urlEnrollmentId]);

  const createManualEntry = async (scheduledTime: Date) => {
    if (!enrollment || !project) return;
    
    try {
      // Get max instance_number for this enrollment
      const { data: maxData } = await supabase
        .from('survey_instances')
        .select('instance_number')
        .eq('enrollment_id', enrollment.id)
        .order('instance_number', { ascending: false })
        .limit(1)
        .single();
      
      const nextInstanceNumber = maxData ? maxData.instance_number + 1 : 1;
      
      // Format date to preserve local time (don't convert to UTC)
      const year = scheduledTime.getFullYear();
      const month = String(scheduledTime.getMonth() + 1).padStart(2, '0');
      const day = String(scheduledTime.getDate()).padStart(2, '0');
      const hours = String(scheduledTime.getHours()).padStart(2, '0');
      const minutes = String(scheduledTime.getMinutes()).padStart(2, '0');
      const seconds = String(scheduledTime.getSeconds()).padStart(2, '0');
      const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      const { data: newInstance, error } = await supabase
        .from('survey_instances')
        .insert({
          project_id: enrollment.project_id,
          enrollment_id: enrollment.id,
          scheduled_time: scheduledTime.toISOString(),
          status: 'scheduled',
          day_number: Math.ceil((scheduledTime.getTime() - new Date(enrollment.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          instance_number: nextInstanceNumber
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating manual entry:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to create entry: ${error.message}`);
        return;
      }
      
      if (newInstance) {
        await loadDashboardData();
        setActiveSurveyInstanceId(newInstance.id);
      }
    } catch (error) {
      console.error('Error creating manual entry:', error);
    }
  };

  const deleteInstance = async (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this survey entry?')) return;
    
    try {
      // Delete associated responses first
      await supabase
        .from('survey_responses')
        .delete()
        .eq('instance_id', instanceId);
      
      // Delete the instance
      const { error } = await supabase
        .from('survey_instances')
        .delete()
        .eq('id', instanceId);
      
      if (error) {
        console.error('Error deleting instance:', error);
        alert('Failed to delete entry');
        return;
      }
      
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting instance:', error);
      alert('Failed to delete entry');
    }
  };

  const loadDashboardData = async () => {
    try {
      // The URL param is actually the enrollment ID
      const enrollmentId = urlEnrollmentId;
      
      if (!enrollmentId) {
        setLoading(false);
        return;
      }

      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .single();

      if (enrollmentData) {
        setEnrollment(enrollmentData);
        
        // Load project details using the enrollment's project_id
        const { data: projectData } = await supabase
          .from('research_projects')
          .select('*')
          .eq('id', enrollmentData.project_id)
          .single();

        setProject(projectData);
        setCurrentDay(enrollmentData.current_day || 1);

        // Load survey instances
        const { data: instancesData } = await supabase
          .from('survey_instances')
          .select('*')
          .eq('enrollment_id', enrollmentData.id)
          .order('scheduled_time');

        if (instancesData) {
          setInstances(instancesData);
          
          // Calculate current day and progress from actual enrollment date
          const now = new Date();
          const enrollDate = new Date(enrollmentData.created_at);
          const daysDiff = Math.floor((now.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));
          const actualDay = Math.min(daysDiff + 1, projectData.study_duration || 7);
          setCurrentDay(actualDay);
          
          const completed = instancesData.filter(i => i.status === 'completed').length;
          const total = instancesData.length;
          setOverallProgress(total > 0 ? (completed / total) * 100 : 0);
          
          // Find current/next instance
          const upcoming = instancesData.find(i => 
            i.status === 'scheduled' && new Date(i.scheduled_time) > now
          );
          setCurrentInstance(upcoming || null);
        }

        // Load compliance data
        const { data: complianceData } = await supabase
          .from('compliance_tracking')
          .select('*')
          .eq('enrollment_id', enrollmentData.id)
          .order('date', { ascending: false })
          .limit(7);

        if (complianceData) {
          setCompliance(complianceData);
        }

        // Load completed responses for summary tab
        if (enrollmentData) {
          const { data: responsesData } = await supabase
            .from('survey_responses')
            .select('*, survey_questions(*)')
            .eq('enrollment_id', enrollmentData.id)
            .order('created_at', { ascending: false });
          
          if (responsesData) {
            setCompletedResponses(responsesData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = (payload: any) => {
    // Handle real-time notification updates
    if (payload.new?.status === 'sent') {
      // Show in-app notification
      showNotification('New survey available!');
    }
  };

  const showNotification = (message: string) => {
    // Browser notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Easier-research Survey', {
        body: message,
        icon: '/icon.png'
      });
    }
  };

  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [activeSurveyInstanceId, setActiveSurveyInstanceId] = useState<string | null>(null);

  const startSurvey = (instanceId: string) => {
    navigate(`/easyresearch/participant/${enrollment?.id}?skip_consent=true&instance=${instanceId}`);
  };

  const renderCurrentStatus = () => {
    const completedCount = instances.filter(i => i.status === 'completed').length;
    const totalCount = instances.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <div className="bg-white rounded-xl p-6 mb-6" style={{ border: '1px solid var(--border-light)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Study Progress</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {completedCount} of {totalCount} surveys completed
            </p>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-green)' }}>
            {Math.round(progressPercent)}%
          </div>
        </div>
        <div className="w-full rounded-full h-2 mt-4" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
          <div 
            className="h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-green)' }}
          />
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    if (!project || !enrollment) return null;
    
    if (instances.length === 0) {
      return (
        <div className="bg-white rounded-xl p-12 text-center" style={{ border: '1px solid var(--border-light)' }}>
          <Calendar size={64} style={{ color: 'var(--text-tertiary)', margin: '0 auto 24px' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No Survey Schedule Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your survey schedule will appear here once the study begins.
          </p>
        </div>
      );
    }
    
    // Get next scheduled survey
    const now = new Date();
    const nextSurvey = instances.find(i => i.status === 'scheduled' && new Date(i.scheduled_time) > now);

    // Get unique days from actual survey instances
    const uniqueDays = new Map<string, { date: Date; dayNumber: number }>();
    const enrollmentDate = new Date(enrollment.created_at);
    
    instances.forEach(instance => {
      const schedTime = new Date(instance.scheduled_time);
      const dateKey = schedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayNumber = Math.floor((schedTime.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (!uniqueDays.has(dateKey)) {
        uniqueDays.set(dateKey, { date: schedTime, dayNumber });
      }
    });
    
    const days = Array.from(uniqueDays.entries()).map(([dateKey, data]) => ({
      dateStr: dateKey,
      date: data.date,
      dayNumber: data.dayNumber
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Determine current day based on enrollment date
    const currentDayNumber = Math.floor((now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentDayObj = days.find(d => d.dayNumber === currentDayNumber);
    
    // Set default selected day to current day if not set
    if (!selectedDayDate && currentDayObj) {
      setSelectedDayDate(currentDayObj.date);
    }
    
    // Get selected day or default to current
    const activeDay = selectedDayDate ? days.find(d => 
      d.date.toDateString() === selectedDayDate.toDateString()
    ) : currentDayObj;
    
    if (!activeDay) return null;

    // Show all 24 hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get instances for selected day only
    const allDayInstances = instances.filter(i => {
      const schedTime = new Date(i.scheduled_time);
      return schedTime.toDateString() === activeDay.date.toDateString();
    });
    
    // Calculate counts for each status
    const statusCounts = {
      all: allDayInstances.length,
      completed: allDayInstances.filter(i => i.status === 'completed').length,
      scheduled: allDayInstances.filter(i => i.status === 'scheduled').length,
      missed: allDayInstances.filter(i => i.status === 'missed').length
    };
    
    // Apply status filter
    let dayInstances = statusFilter === 'all' 
      ? allDayInstances 
      : allDayInstances.filter(i => i.status === statusFilter);

    // Button visual styles with clear status distinctions
    const getStatusStyles = (status: string) => {
      if (status === 'completed') {
        return {
          backgroundColor: 'white',
          color: 'var(--color-green)',
          border: '2px solid var(--border-light)',
          fontWeight: '700'
        } as React.CSSProperties;
      }
      
      if (status === 'missed') {
        return {
          backgroundColor: 'white',
          color: '#ef4444',
          border: '2px solid var(--border-light)',
          fontWeight: '600'
        } as React.CSSProperties;
      }
      
      if (status === 'in_progress') {
        return {
          backgroundColor: 'white',
          color: 'var(--color-green)',
          border: '3px double var(--color-green)',
          fontWeight: '600'
        } as React.CSSProperties;
      }
      
      // Scheduled
      return {
        backgroundColor: 'white',
        color: 'var(--text-secondary)',
        border: '2px solid var(--border-light)',
        fontWeight: '500'
      } as React.CSSProperties;
    };

    return (
      <div className="space-y-4">
        {/* Next Survey Alert */}
        {nextSurvey && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <Clock size={20} style={{ color: 'var(--color-green)', marginTop: '2px' }} />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-green)' }}>Next Survey</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {new Date(nextSurvey.scheduled_time).toLocaleString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}
        
        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {days.map(day => {
            const isActive = activeDay.date.toDateString() === day.date.toDateString();
            const isToday = day.dayNumber === currentDayNumber;
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDayDate(day.date)}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-green)' : 'white',
                  color: isActive ? 'white' : isToday ? 'var(--color-green)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--color-green)' : 'var(--border-light)'}`,
                  minWidth: '100px'
                }}
              >
                <div className="text-xs">{isToday ? 'Today' : `Day ${day.dayNumber}`}</div>
                <div className="font-normal">{day.dateStr}</div>
              </button>
            );
          })}
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {(['all', 'scheduled', 'completed', 'missed'] as const).map(status => {
            const isActive = statusFilter === status;
            const statusLabels = {
              all: 'All',
              completed: 'Completed',
              scheduled: 'Scheduled',
              missed: 'Missed'
            };
            const count = statusCounts[status];
            
            // Style tabs to always match their survey button appearance
            let tabStyle: React.CSSProperties = {};
            let containerStyle: React.CSSProperties = {
              position: 'relative' as const
            };
            
            if (status === 'completed') {
              tabStyle = {
                backgroundColor: 'white',
                color: 'var(--color-green)',
                border: '2px solid var(--border-light)',
                borderRadius: '8px'
              };
            } else if (status === 'missed') {
              tabStyle = {
                backgroundColor: 'white',
                color: '#ef4444',
                border: '2px solid var(--border-light)',
                borderRadius: '8px'
              };
            } else if (status === 'scheduled') {
              tabStyle = {
                backgroundColor: 'white',
                color: 'var(--text-secondary)',
                border: '2px solid var(--border-light)',
                borderRadius: '8px'
              };
            } else {
              // All tab - transparent style
              tabStyle = {
                color: 'var(--text-secondary)'
              };
            }
            
            return (
              <div key={status} style={containerStyle}>
                <button
                  onClick={() => setStatusFilter(status)}
                  className="flex-shrink-0 px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2"
                  style={tabStyle}
                >
                  {statusLabels[status]}
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: status === 'completed' ? '#f0fdf4' : status === 'missed' ? '#fee' : 'var(--border-light)',
                      color: status === 'completed' ? 'var(--color-green)' : status === 'missed' ? '#ef4444' : 'var(--text-secondary)'
                    }}
                  >
                    {count}
                  </span>
                </button>
                {isActive && (
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      right: '0',
                      height: '3px',
                      backgroundColor: 'var(--color-green)',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Single Day Timeline - Vertical */}
        <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {activeDay.dateStr} - Day {activeDay.dayNumber}
          </h3>
          
          <div className="space-y-1">
            {hours.map(hour => {
              const hourInstances = dayInstances.filter(i => 
                new Date(i.scheduled_time).getHours() === hour
              );
              const isCurrentHour = now.getHours() === hour && activeDay.date.toDateString() === now.toDateString();
              
              return (
                <div key={hour} className="flex items-center gap-3 py-2" style={{ borderLeft: isCurrentHour ? '3px solid var(--color-green)' : '3px solid transparent' }}>
                  <div className="w-16 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 flex gap-2 flex-wrap">
                    {hourInstances.length > 0 ? (
                      hourInstances.map(instance => (
                        <button
                          key={instance.id}
                          onClick={() => setActiveSurveyInstanceId(instance.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                          style={getStatusStyles(instance.status)}
                        >
                          {new Date(instance.scheduled_time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </button>
                      ))
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Floating Add Entry Button */}
        <button
          onClick={() => {
            // Always set to today when opening dialog, not the viewed day
            setSelectedDayDate(new Date());
            setShowAddEntryDialog(true);
          }}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
          style={{ backgroundColor: 'var(--color-green)', zIndex: 100 }}
        >
          <Plus size={24} style={{ color: 'white' }} />
        </button>
      </div>
    );
  };


  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
        </div>
      </>
    );
  }

  const renderTabs = () => (
    <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
      <button
        onClick={() => setActiveTab('timeline')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'timeline' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'timeline' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Timeline
      </button>
      <button
        onClick={() => setActiveTab('summary')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'summary' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'summary' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Summary
      </button>
      <button
        onClick={() => setActiveTab('help')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'help' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'help' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Help
      </button>
      <button
        onClick={() => setActiveTab('settings')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'settings' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'settings' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Settings
      </button>
    </div>
  );

  const renderSummaryTab = () => {
    const completedInstances = instances.filter(i => i.status === 'completed');
    const enrollmentDate = enrollment?.created_at ? new Date(enrollment.created_at) : new Date();
    
    const allInstancesWithData = completedInstances.map(instance => {
      const instanceResponses = completedResponses.filter(r => r.instance_id === instance.id);
      const schedTime = new Date(instance.scheduled_time);
      const dayNumber = Math.floor((schedTime.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      return {
        instance,
        dayNumber,
        responses: instanceResponses,
        time: schedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: schedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }).sort((a, b) => b.instance.scheduled_time.localeCompare(a.instance.scheduled_time));
    
    const instancesWithData = summaryDayFilter === 'all' 
      ? allInstancesWithData 
      : allInstancesWithData.filter(i => i.dayNumber === summaryDayFilter);
    
    const studyDuration = project?.study_duration || 30;
    const dayOptions = Array.from({ length: studyDuration }, (_, i) => i + 1);

    const handleEdit = (instanceId: string) => {
      const instance = allInstancesWithData.find(i => i.instance.id === instanceId);
      if (instance) {
        const responsesMap: any = {};
        instance.responses.forEach(r => {
          responsesMap[r.question_id] = r.response_value || r.response_text;
        });
        setEditedResponses(responsesMap);
        setEditingInstanceId(instanceId);
      }
    };

    const handleSave = async (instanceId: string) => {
      try {
        for (const [questionId, value] of Object.entries(editedResponses)) {
          await supabase
            .from('survey_responses')
            .update({ 
              response_value: value,
              response_text: typeof value === 'string' ? value : null
            })
            .eq('instance_id', instanceId)
            .eq('question_id', questionId);
        }
        await loadDashboardData();
        setEditingInstanceId(null);
      } catch (error) {
        console.error('Error saving responses:', error);
      }
    };

    const handleCancel = () => {
      setEditingInstanceId(null);
      setEditedResponses({});
    };

    const getAnswerText = (response: any) => {
      const question = response.survey_questions;
      if (!question) return response.response_text || String(response.response_value);
      
      if (['single_choice', 'multiple_choice'].includes(question.question_type)) {
        const options = question.question_config?.options || [];
        let actualValue = response.response_value;
        if (actualValue && typeof actualValue === 'object' && 'text' in actualValue) {
          actualValue = actualValue.text;
        }
        
        if (question.question_type === 'multiple_choice') {
          let valueArray = actualValue;
          if (typeof valueArray === 'string') {
            try {
              valueArray = JSON.parse(valueArray);
            } catch {
              valueArray = [valueArray];
            }
          }
          
          if (Array.isArray(valueArray)) {
            return valueArray.map((optId: string) => {
              const opt = options.find((o: any) => o.id === optId);
              return opt?.text || optId;
            }).join(', ');
          }
        }
        
        const opt = options.find((o: any) => o.id === actualValue);
        return opt?.text || response.response_text || String(response.response_value);
      }
      
      return response.response_text || String(response.response_value);
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Filter by Day</h3>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            <button
              onClick={() => setSummaryDayFilter('all')}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: summaryDayFilter === 'all' ? 'var(--color-green)' : 'white',
                color: summaryDayFilter === 'all' ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${summaryDayFilter === 'all' ? 'var(--color-green)' : 'var(--border-light)'}`,
              }}
            >
              All Days
            </button>
            {dayOptions.map(day => (
              <button
                key={day}
                onClick={() => setSummaryDayFilter(day)}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: summaryDayFilter === day ? 'var(--color-green)' : 'white',
                  color: summaryDayFilter === day ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${summaryDayFilter === day ? 'var(--color-green)' : 'var(--border-light)'}`,
                }}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>
        
        {instancesWithData.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid var(--border-light)' }}>
            <Circle size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No surveys completed yet</p>
          </div>
        ) : (
          instancesWithData.map(({ instance, dayNumber, responses, time, date }) => (
            <div key={instance.id} className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Day {dayNumber} - {time}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{date}</p>
                </div>
                {editingInstanceId === instance.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(instance.id)}
                      className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                      style={{ backgroundColor: 'var(--color-green)' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-lg font-medium text-sm"
                      style={{ border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(instance.id)}
                    className="px-4 py-2 rounded-lg font-medium text-sm"
                    style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                  >
                    Edit
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {responses.map((response: any) => (
                  <div key={response.id}>
                    <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      {response.survey_questions?.question_text || 'Question'}
                    </p>
                    {editingInstanceId === instance.id ? (
                      <input
                        type="text"
                        value={editedResponses[response.question_id] || ''}
                        onChange={(e) => setEditedResponses({
                          ...editedResponses,
                          [response.question_id]: e.target.value
                        })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                    ) : (
                      <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        {getAnswerText(response)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderHelpTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Study Help & Information
          </h3>
          {project?.help_information ? (
            <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <p className="whitespace-pre-wrap">{project.help_information}</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              No help information is available for this study. If you have questions, please contact the research team.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    if (project?.project_type !== 'longitudinal') return null;
    
    const enrollmentDate = enrollment?.created_at ? new Date(enrollment.created_at) : null;
    const isActive = enrollment?.status === 'active';
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Research Participation Status
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status</p>
              <p className="font-semibold text-lg" style={{ color: isActive ? 'var(--color-green)' : 'var(--text-primary)' }}>
                {isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            {enrollmentDate && (
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Started On</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {enrollmentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {project?.duration_days} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Notification Settings
          </h3>
          <button
            onClick={() => setShowNotificationSettings(true)}
            className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            Configure Notifications
          </button>
        </div>
      </div>
    );
  };


  return (
    <>
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {project?.title || 'ESM Study Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {project?.description}
          </p>
        </div>

        {/* Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        {activeTab === 'timeline' && (
          <>
            {/* Status Cards */}
            {renderCurrentStatus()}
            
            {/* Timeline View */}
            {renderTimelineView()}
          </>
        )}
        
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'help' && renderHelpTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        
      </div>
    </div>
    
    {/* Notification Settings Dialog */}
    <ParticipantNotificationSettings
      isOpen={showNotificationSettings}
      onClose={() => setShowNotificationSettings(false)}
      enrollmentId={enrollment?.id || ''}
      currentSettings={enrollment?.notification_settings}
    />

    {/* Survey Modal - Centered Pop-up, No Overlay */}
    {activeSurveyInstanceId && (
      <div 
        className="fixed bg-white shadow-2xl rounded-2xl"
        style={{ 
          width: window.innerWidth < 768 ? '90%' : '50%',
          height: window.innerWidth < 768 ? '70%' : '50%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          border: '1px solid var(--border-light)'
        }}
      >
        <div 
          className="h-full flex flex-col"
        >
          <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4" style={{ borderColor: 'var(--border-light)', zIndex: 10 }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Survey
            </h2>
            <button
              onClick={() => setActiveSurveyInstanceId(null)}
              className="p-2 rounded-full text-2xl hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            <div className="p-4 md:p-6">
              <ParticipantSurveyView 
                projectId={enrollment?.project_id}
                enrollmentId={enrollment?.id}
                instanceId={activeSurveyInstanceId}
              />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Add Entry Dialog */}
    <AddEntryDialog
      isOpen={showAddEntryDialog}
      onClose={() => setShowAddEntryDialog(false)}
      onConfirm={(selectedTime) => createManualEntry(selectedTime)}
      currentDay={selectedDayDate || new Date()}
    />
    </>
  );
};

export default ESMParticipantDashboard;
