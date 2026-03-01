import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, ChevronRight, Loader2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Enrollment {
  id: string;
  project_id: string;
  created_at: string;
  status: string;
  research_project: {
    id: string;
    title: string;
    description: string;
    project_type: string;
    study_duration: number;
    status: string;
  } | null;
}

const ParticipantHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadEnrollments();
  }, [user]);

  const loadEnrollments = async () => {
    try {
      const { data: enrollmentsData } = await supabase
        .from('enrollment')
        .select('id, project_id, created_at, status')
        .eq('participant_id', user!.id)
        .order('created_at', { ascending: false });

      if (enrollmentsData && enrollmentsData.length > 0) {
        const projectIds = Array.from(new Set(enrollmentsData.map((e: any) => e.project_id).filter(Boolean)));
        const { data: projectsData } = projectIds.length
          ? await supabase.from('research_project')
              .select('id, title, description, project_type, study_duration, status')
              .in('id', projectIds)
          : { data: [] as any[] };
        const projectById = new Map((projectsData || []).map((p: any) => [p.id, p]));
        setEnrollments(
          (enrollmentsData as any[]).map((e: any) => ({
            ...e,
            research_project: projectById.get(e.project_id) || null,
          }))
        );
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-stone-50/50">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-lg font-bold text-stone-800 mb-1">Sign in to get started</h1>
          <p className="text-[13px] text-stone-400 mb-5">Join studies and track your participation</p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="px-6 py-2.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={28} />
      </div>
    );
  }

  const activeStudies = enrollments.filter(e => e.status === 'active' && e.research_project);
  const completedStudies = enrollments.filter(e => e.status !== 'active' && e.research_project);

  return (
    <div className="bg-stone-50/50">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">My Studies</h1>
          <p className="text-[13px] text-stone-400 font-light mt-0.5">
            {activeStudies.length > 0
              ? `${activeStudies.length} active ${activeStudies.length === 1 ? 'study' : 'studies'}`
              : 'No active studies yet'}
          </p>
        </div>

        {/* Active Studies */}
        {activeStudies.length > 0 ? (
          <div className="space-y-2.5 mb-6">
            {activeStudies.map(enrollment => (
              <button
                key={enrollment.id}
                onClick={() => navigate(`/easyresearch/participant/${enrollment.project_id}`)}
                className="w-full bg-white rounded-2xl border border-stone-100 p-4 text-left hover:shadow-md hover:shadow-stone-100/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-stone-800 truncate">
                      {enrollment.research_project?.title || 'Untitled Study'}
                    </h3>
                    <p className="text-[12px] text-stone-400 font-light mt-0.5 line-clamp-1">
                      {enrollment.research_project?.description}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-400 transition-colors ml-2 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    {enrollment.research_project?.project_type || 'survey'}
                  </span>
                  {enrollment.research_project?.study_duration && (
                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                      <Clock size={9} /> {enrollment.research_project.study_duration}d
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-3">
              <Search size={22} className="text-stone-300" />
            </div>
            <h2 className="text-[14px] font-semibold text-stone-700 mb-1">No active studies</h2>
            <p className="text-[12px] text-stone-400 font-light mb-4">Find and join research studies to get started</p>
            <button
              onClick={() => navigate('/easyresearch/participant/join')}
              className="px-5 py-2 rounded-full text-[12px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              Find Studies
            </button>
          </div>
        )}

        {/* Completed / Past Studies */}
        {completedStudies.length > 0 && (
          <>
            <h2 className="text-[12px] font-medium text-stone-400 uppercase tracking-wider mb-2">Past Studies</h2>
            <div className="space-y-2">
              {completedStudies.map(enrollment => (
                <button
                  key={enrollment.id}
                  onClick={() => navigate(`/easyresearch/participant/${enrollment.project_id}`)}
                  className="w-full bg-white/60 rounded-xl border border-stone-100 p-3.5 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-medium text-stone-500 truncate">
                        {enrollment.research_project?.title || 'Untitled'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 ml-2">
                      {enrollment.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParticipantHome;
