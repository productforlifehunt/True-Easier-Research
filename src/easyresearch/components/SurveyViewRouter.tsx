import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ParticipantAppView from './ParticipantAppView';
import ParticipantSurveyView from './ParticipantSurveyView';

const SurveyViewRouter: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const [methodologyType, setMethodologyType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const { data: projectData } = await supabase
          .from('research_project')
          .select('id, methodology_type')
          .eq('id', projectId)
          .maybeSingle();

        if (projectData) {
          setMethodologyType(projectData.methodology_type);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-20 bg-stone-100 rounded-xl" />
        <div className="h-14 bg-stone-100 rounded-xl" />
        <div className="h-14 bg-stone-100 rounded-xl" />
      </div>
    );
  }

  // For multi_time (longitudinal/ESM) surveys with an instance param, show the survey view
  const instanceId = searchParams.get('instance');
  
  if (methodologyType === 'multi_time' && instanceId) {
    return <ParticipantSurveyView />;
  }

  // Use the layout-based app view for all project types
  return <ParticipantAppView />;
};

export default SurveyViewRouter;
