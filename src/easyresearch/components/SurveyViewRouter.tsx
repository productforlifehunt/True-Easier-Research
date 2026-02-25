import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, authClient } from '../../lib/supabase';
import OneTimeSurveyView from './OneTimeSurveyView';
import LongitudinalSurveyView from './LongitudinalSurveyView';
import ParticipantSurveyView from './ParticipantSurveyView';
import ConsentModal from './ConsentModal';

const SurveyViewRouter: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projectType, setProjectType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const checkConsentAndLoadProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        // Load project details including consent requirements
        const { data: projectData } = await supabase
          .from('research_project')
          .select('id, title, project_type, consent_form')
          .eq('id', projectId)
          .maybeSingle();

        if (!projectData) {
          setLoading(false);
          return;
        }

        setProject(projectData);
        setProjectType(projectData.project_type);

        // Check if consent is required (consent_form is a JSONB object)
        const consentRequired = projectData.consent_form?.required === true;
        
        if (consentRequired) {
          // Check if user already gave consent
          const { data: { user } } = await authClient.auth.getUser();
          
          if (user) {
            const { data: enrollment } = await supabase
              .from('enrollment')
              .select('id, consent_signed_at')
              .eq('project_id', projectId)
              .eq('participant_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!enrollment?.consent_signed_at) {
              // Need to show consent modal
              setShowConsentModal(true);
              setConsentChecked(true);
              setLoading(false);
              return;
            }
            // Consent already signed — ensure enrollment is in localStorage for downstream views
            if (enrollment?.id) {
              localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
            }
          }
        }

        setConsentChecked(true);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConsentAndLoadProject();
  }, [projectId]);

  const handleConsentAccept = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      
      if (user && projectId) {
        const now = new Date().toISOString();

        const { data: existingEnrollment } = await supabase
          .from('enrollment')
          .select('id, status')
          .eq('project_id', projectId)
          .eq('participant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingEnrollment?.id) {
          await supabase
            .from('enrollment')
            .update({ consent_signed_at: now })
            .eq('id', existingEnrollment.id);
          // Store in localStorage so downstream views find it
          localStorage.setItem(`enrollment_${projectId}`, existingEnrollment.id);
        } else {
          const { data: newEnroll } = await supabase
            .from('enrollment')
            .insert({
              project_id: projectId,
              participant_id: user.id,
              participant_email: user.email,
              status: 'active',
              consent_signed_at: now,
            })
            .select('id')
            .single();
          if (newEnroll?.id) {
            localStorage.setItem(`enrollment_${projectId}`, newEnroll.id);
          }
        }

        setShowConsentModal(false);
        setConsentChecked(true);
      }
    } catch (error) {
      console.error('Error storing consent:', error);
    }
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    navigate('/easyresearch');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  // Show consent modal if required and not yet accepted
  if (showConsentModal && project) {
    return (
      <>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }} />
        <ConsentModal
          isOpen={showConsentModal}
          onClose={handleConsentDecline}
          onAccept={handleConsentAccept}
          projectTitle={project.title}
          consentFormUrl={project.consent_form?.form_url}
          consentFormText={project.consent_form?.form_text}
        />
      </>
    );
  }

  // Only show survey if consent check is complete
  if (!consentChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  // Check if instance parameter is present for longitudinal surveys
  const instanceId = searchParams.get('instance');
  
  if (projectType === 'longitudinal') {
    // If instance specified, show the actual survey view
    if (instanceId) {
      return <ParticipantSurveyView />;
    }
    // Otherwise show the timeline/dashboard view
    return <LongitudinalSurveyView />;
  }

  return <OneTimeSurveyView />;
};

export default SurveyViewRouter;
