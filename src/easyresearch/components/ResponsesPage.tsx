import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Download, ChevronRight, Users, MessageSquare, BarChart3, TrendingUp } from 'lucide-react';

const ResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/easyresearch/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data: researcher } = await supabase.from('researcher').select('id, organization_id').eq('user_id', user?.id).maybeSingle();
      if (!researcher) { setLoading(false); return; }

      const { data: projectData } = await supabase.from('research_project').select('id, title, status, created_at, project_type')
        .eq('organization_id', researcher.organization_id).order('created_at', { ascending: false });

      if (!projectData || projectData.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectIds = projectData.map(p => p.id);

      // Get response counts and enrollment counts per project
      const [{ data: responseCounts }, { data: enrollmentCounts }] = await Promise.all([
        supabase.from('survey_respons').select('project_id').in('project_id', projectIds),
        supabase.from('enrollment').select('project_id, status').in('project_id', projectIds),
      ]);

      const responseByProject = new Map<string, number>();
      (responseCounts || []).forEach(r => {
        responseByProject.set(r.project_id, (responseByProject.get(r.project_id) || 0) + 1);
      });

      const enrollmentByProject = new Map<string, { total: number; completed: number }>();
      (enrollmentCounts || []).forEach(e => {
        const current = enrollmentByProject.get(e.project_id) || { total: 0, completed: 0 };
        current.total++;
        if (e.status === 'completed') current.completed++;
        enrollmentByProject.set(e.project_id, current);
      });

      setProjects(projectData.map(p => ({
        ...p,
        responseCount: responseByProject.get(p.id) || 0,
        participantCount: enrollmentByProject.get(p.id)?.total || 0,
        completedCount: enrollmentByProject.get(p.id)?.completed || 0,
      })));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResponses = projects.reduce((sum, p) => sum + p.responseCount, 0);
  const totalParticipants = projects.reduce((sum, p) => sum + p.participantCount, 0);
  const totalCompleted = projects.reduce((sum, p) => sum + p.completedCount, 0);
  const avgCompletion = totalParticipants > 0 ? Math.round((totalCompleted / totalParticipants) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800">Responses</h1>
        <p className="text-[13px] text-stone-400 mt-1 font-light">Overview of all responses across your projects</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Projects', value: projects.length, icon: FileText },
          { label: 'Total Responses', value: totalResponses, icon: MessageSquare },
          { label: 'Participants', value: totalParticipants, icon: Users },
          { label: 'Avg Completion', value: `${avgCompletion}%`, icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={15} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-semibold text-stone-800 tracking-tight">{s.value}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Project cards */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-100 p-16 text-center">
          <BarChart3 size={32} className="text-stone-200 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-stone-600 mb-1">No projects yet</p>
          <p className="text-[12px] text-stone-400">Create a project to start collecting responses.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => navigate(`/easyresearch/project/${p.id}`, { state: { activeTab: 'responses' } })}
              className="w-full bg-white rounded-xl border border-stone-100 p-4 flex items-center justify-between hover:border-emerald-200 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[14px] font-semibold text-stone-800 truncate">{p.title || 'Untitled'}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    p.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1"><MessageSquare size={11} /> {p.responseCount} responses</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {p.participantCount} participants</span>
                  <span>{p.completedCount}/{p.participantCount} completed</span>
                </div>
              </div>
              {/* Response bar */}
              <div className="flex items-center gap-4 shrink-0 ml-4">
                {p.participantCount > 0 && (
                  <div className="w-24">
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.round((p.completedCount / p.participantCount) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-stone-400 text-right mt-0.5">
                      {Math.round((p.completedCount / p.participantCount) * 100)}%
                    </p>
                  </div>
                )}
                <ChevronRight size={14} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsesPage;
