import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChevronRight } from 'lucide-react';
import EasyResearchBottomNav from './EasyResearchBottomNav';

interface ParticipantOnboardingProps {
  projectId: string;
  onComplete: () => void;
}

const ParticipantOnboarding: React.FC<ParticipantOnboardingProps> = ({ projectId, onComplete }) => {
  const [project, setProject] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      // Check if already enrolled
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) {
        // Already enrolled, redirect based on project type
        const { data: projectData } = await supabase
          .from('research_projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        // Use SurveyViewRouter for both types - it will show correct component
        navigate(`/easyresearch/participant/${projectId}?skip_consent=true`);
        return;
      }

      // Load project details
      const { data: projectData } = await supabase
        .from('research_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!email) return;
    
    try {
      // Create enrollment with correct schema fields
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          project_id: projectId,
          participant_email: email,
          status: 'active',
          consent_signed_at: new Date().toISOString(),
          study_start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      
      if (enrollError) {
        console.error('Enrollment error:', enrollError);
        return;
      }

      if (enrollment) {
        // Store enrollment ID
        localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
        
        // For longitudinal surveys, create survey instances
        if (project?.project_type === 'longitudinal') {
          const instances = [];
          const startDate = new Date();
          let instanceCounter = 1;
          
          const duration = project.study_duration || 7;
          const frequency = project.survey_frequency || 'once_daily';
          
          // Determine survey times based on frequency
          let surveyTimes: number[] = [];
          if (frequency === 'hourly') {
            surveyTimes = Array.from({ length: 14 }, (_, i) => 8 + i); // 8 AM to 9 PM
          } else if (frequency === 'twice_daily') {
            surveyTimes = [9, 21]; // 9 AM and 9 PM
          } else if (frequency === 'three_times_daily') {
            surveyTimes = [9, 14, 21]; // 9 AM, 2 PM, 9 PM
          } else if (frequency === 'four_times_daily') {
            surveyTimes = [9, 12, 15, 21]; // 9 AM, 12 PM, 3 PM, 9 PM
          } else {
            // once_daily or daily
            surveyTimes = [9]; // 9 AM
          }
          
          for (let day = 1; day <= duration; day++) {
            for (const hour of surveyTimes) {
              const scheduledTime = new Date(startDate);
              scheduledTime.setDate(startDate.getDate() + (day - 1));
              scheduledTime.setHours(hour, 0, 0, 0);
              
              instances.push({
                enrollment_id: enrollment.id,
                instance_number: instanceCounter++,
                day_number: day,
                time_point: hour.toString(),
                scheduled_time: scheduledTime.toISOString(),
                status: 'scheduled'
              });
            }
          }
          
          // Insert all instances
          const { error: instanceError } = await supabase
            .from('survey_instances')
            .insert(instances);
          
          if (instanceError) {
            console.error('Instance creation error:', instanceError);
          }
          
          // Navigate to SurveyViewRouter which will show LongitudinalSurveyView
          window.location.href = `/easyresearch/participant/${projectId}?skip_consent=true`;
        } else {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {project?.title}
            </h1>
            
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {project?.description}
            </p>

            {project?.project_type === 'longitudinal' && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Study Information</h3>
                <p className="text-sm">
                  Welcome to our longitudinal study!
                </p>
                <p className="text-sm mt-2">
                  This research will track your experiences every hour for the next week. 
                  You will receive survey notifications hourly between 9am-9pm daily.
                </p>
                <p className="text-sm mt-2">
                  Each survey takes only 2-3 minutes to complete. You can configure your 
                  Do Not Disturb periods after enrollment.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                  placeholder="Enter your email for survey notifications"
                  required
                />
              </div>

              <button
                onClick={handleEnroll}
                disabled={!email}
                className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: email ? 'var(--color-green)' : '#ccc',
                  color: 'white'
                }}
              >
                {project?.project_type === 'longitudinal' ? 'Start Study' : 'Begin Survey'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <EasyResearchBottomNav />
    </>
  );
};

export default ParticipantOnboarding;
