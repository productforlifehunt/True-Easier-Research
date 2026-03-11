import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, ChevronRight, Loader2, Search, Plus, BarChart3, Users, SlidersHorizontal, Bookmark } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardConfig } from '../hooks/useDashboardConfig';
import EditDashboardModal from './EditDashboardModal';
import { useI18n } from '../hooks/useI18n';
import TemplateMarketplaceEmbed from './TemplateMarketplaceEmbed';
interface StudyItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  project_type: string;
  study_duration: number | null;
  status: string;
  role: 'owner' | 'participant';
  enrolled_at?: string;
}

const TAB_I18N_MAP: Record<string, string> = {
  all: 'dashboard.allStudies',
  drafts: 'dashboard.myDrafts',
  published: 'dashboard.myPublished',
  joined: 'dashboard.myJoined',
};

const ParticipantHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [studies, setStudies] = useState<StudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const {
    config, roles, visibleTabs,
    reorderTabs, toggleTabVisibility, toggleNewStudyButton,
    updateRoles, resetConfig,
  } = useDashboardConfig();

  const [activeTab, setActiveTab] = useState<string>('all');

  // Ensure activeTab is always a visible tab
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadAllStudies();
  }, [user]);

  const loadAllStudies = async () => {
    try {
      const { data: researcher } = await supabase
        .from('researcher')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      const [ownedRes, enrolledRes] = await Promise.all([
        researcher
          ? supabase
              .from('research_project')
              .select('id, title, description, project_type, study_duration, status')
              .eq('researcher_id', researcher.id)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('enrollment')
          .select('id, project_id, created_at, status')
          .eq('participant_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      const items: StudyItem[] = [];

      if (ownedRes.data) {
        for (const p of ownedRes.data) {
          items.push({
            id: p.id, project_id: p.id,
            title: p.title || 'Untitled Study',
            description: p.description || '',
            project_type: p.project_type || 'survey',
            study_duration: p.study_duration,
            status: p.status || 'draft',
            role: 'owner',
          });
        }
      }

      if (enrolledRes.data && enrolledRes.data.length > 0) {
        const ownedIds = new Set(items.map(i => i.project_id));
        const enrolledProjectIds = Array.from(
          new Set((enrolledRes.data as any[]).map(e => e.project_id).filter((id: string) => !ownedIds.has(id)))
        );
        if (enrolledProjectIds.length > 0) {
          const { data: projects } = await supabase
            .from('research_project')
            .select('id, title, description, project_type, study_duration, status')
            .in('id', enrolledProjectIds);
          const projectMap = new Map((projects || []).map((p: any) => [p.id, p]));
          for (const e of enrolledRes.data as any[]) {
            if (ownedIds.has(e.project_id)) continue;
            const p = projectMap.get(e.project_id);
            if (!p) continue;
            items.push({
              id: e.id, project_id: e.project_id,
              title: p.title || 'Untitled Study',
              description: p.description || '',
              project_type: p.project_type || 'survey',
              study_duration: p.study_duration,
              status: e.status || 'active',
              role: 'participant',
              enrolled_at: e.created_at,
            });
          }
        }
      }

      setStudies(items);
    } catch (error) {
      console.error('Error loading studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'drafts':
        return studies.filter(s => s.role === 'owner' && s.status === 'draft');
      case 'published':
        return studies.filter(s => s.role === 'owner' && s.status !== 'draft');
      case 'joined':
        return studies.filter(s => s.role === 'participant');
      default:
        return studies;
    }
  }, [studies, activeTab]);

  const tabCounts = useMemo(() => ({
    all: studies.length,
    drafts: studies.filter(s => s.role === 'owner' && s.status === 'draft').length,
    published: studies.filter(s => s.role === 'owner' && s.status !== 'draft').length,
    joined: studies.filter(s => s.role === 'participant').length,
  }), [studies]);

  const handleStudyClick = (study: StudyItem) => {
    if (study.role === 'owner') {
      navigate(`/easyresearch/project/${study.project_id}`);
    } else {
      navigate(`/easyresearch/participant/${study.project_id}`);
    }
  };

  if (!user) {
    return (
      <div className="bg-stone-50/50">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-lg font-bold text-stone-800 mb-1">{t('dashboard.signInToStart')}</h1>
          <p className="text-[13px] text-stone-400 mb-5">{t('dashboard.createOrJoin')}</p>
          <button onClick={() => navigate('/easyresearch/auth')}
            className="px-6 py-2.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500">
            {t('common.signIn')}
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

  return (
    <div className="bg-stone-50/50">
      <div className="max-w-3xl px-0 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">{t('dashboard.myStudies')}</h1>
            <p className="text-[13px] text-stone-400 font-light mt-0.5">
              {studies.length} {studies.length === 1 ? t('dashboard.study') : t('dashboard.studies')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-stone-500 bg-white border border-stone-100 hover:border-stone-200 transition-all"
            >
              <SlidersHorizontal size={13} /> {t('dashboard.edit')}
            </button>
            {config.showNewStudyButton && (
              <button
                onClick={() => navigate('/easyresearch/create-survey')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200 hover:shadow-md transition-all"
              >
                <Plus size={14} /> {t('dashboard.newStudy')}
              </button>
            )}
          </div>
        </div>

        {/* Configurable tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5 -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' as any }}>
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-100'
              }`}
            >
              {TAB_I18N_MAP[tab.id] ? t(TAB_I18N_MAP[tab.id]) : tab.label}
              <span className="ml-1 opacity-60">
                {tabCounts[tab.id as keyof typeof tabCounts] ?? 0}
              </span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeTab === 'templates'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-100'
            }`}
          >
            <Bookmark size={11} /> {t('project.myTemplates')}
          </button>
        </div>

        {/* Templates tab */}
        {activeTab === 'templates' ? (
          <TemplateMarketplaceEmbed mode="my_templates" />
        ) : filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map(study => (
              <button
                key={`${study.role}-${study.id}`}
                onClick={() => handleStudyClick(study)}
                className="w-full bg-white rounded-2xl border border-stone-100 p-4 text-left hover:shadow-md hover:shadow-stone-100/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-semibold text-stone-800 truncate">{study.title}</h3>
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        study.role === 'owner' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {study.role === 'owner' ? (
                          <span className="flex items-center gap-0.5"><BarChart3 size={9} /> {t('dashboard.owner')}</span>
                        ) : (
                          <span className="flex items-center gap-0.5"><Users size={9} /> {t('dashboard.participant')}</span>
                        )}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-400 font-light line-clamp-1">
                      {study.description || t('dashboard.noDescription')}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-400 transition-colors ml-2 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    study.status === 'active' || study.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600'
                      : study.status === 'draft'
                      ? 'bg-stone-50 text-stone-500'
                      : 'bg-stone-100 text-stone-400'
                  }`}>
                    {t(`status.${study.status}`)}
                  </span>
                  <span className="text-[10px] text-stone-400">{t(`projectType.${study.project_type}`)}</span>
                  {study.study_duration && (
                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                      <Clock size={9} /> {study.study_duration}d
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-3">
              <Search size={22} className="text-stone-300" />
            </div>
            <h2 className="text-[14px] font-semibold text-stone-700 mb-1">
              {t('dashboard.noProjects')}
            </h2>
            <p className="text-[12px] text-stone-400 font-light mb-4">
              {activeTab === 'joined' ? t('dashboard.joinFromDiscover') : t('dashboard.createFirst')}
            </p>
            <button
              onClick={() => activeTab === 'joined' ? navigate('/easyresearch/participant/join') : navigate('/easyresearch/create-survey')}
              className="px-5 py-2 rounded-full text-[12px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {activeTab === 'joined' ? t('dashboard.findStudies') : t('dashboard.createStudy')}
            </button>
          </div>
        )}
      </div>

      {/* Edit Dashboard Modal */}
      <EditDashboardModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        config={config}
        roles={roles}
        onToggleTab={toggleTabVisibility}
        onReorder={reorderTabs}
        onToggleNewStudy={toggleNewStudyButton}
        onUpdateRoles={updateRoles}
        onReset={resetConfig}
      />
    </div>
  );
};

export default ParticipantHome;
