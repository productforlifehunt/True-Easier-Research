import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export interface DashboardTab {
  id: 'all' | 'drafts' | 'published' | 'joined';
  label: string;
  visible: boolean;
}

export interface DashboardConfig {
  tabs: DashboardTab[];
  showNewStudyButton: boolean;
}

export interface UserRoles {
  isResearcher: boolean;
  isParticipant: boolean;
}

const DEFAULT_TABS: DashboardTab[] = [
  { id: 'all', label: 'All Studies', visible: true },
  { id: 'drafts', label: 'My Drafts', visible: true },
  { id: 'published', label: 'My Published', visible: true },
  { id: 'joined', label: 'My Joined', visible: true },
];

const DEFAULT_CONFIG: DashboardConfig = {
  tabs: DEFAULT_TABS,
  showNewStudyButton: true,
};

const STORAGE_KEY = 'easyresearch_dashboard_config';

export const useDashboardConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<DashboardConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_CONFIG;
  });

  const [roles, setRoles] = useState<UserRoles>({ isResearcher: false, isParticipant: false });
  const [rolesLoading, setRolesLoading] = useState(true);

  // Load roles from profile table
  useEffect(() => {
    if (!user) { setRolesLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase
          .from('profile')
          .select('is_researcher, is_participant')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setRoles({
            isResearcher: data.is_researcher ?? false,
            isParticipant: data.is_participant ?? false,
          });
        }
      } catch (e) {
        console.error('Failed to load roles:', e);
      } finally {
        setRolesLoading(false);
      }
    })();
  }, [user]);

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = useCallback((updates: Partial<DashboardConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setConfig(prev => {
      const newTabs = [...prev.tabs];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return { ...prev, tabs: newTabs };
    });
  }, []);

  const toggleTabVisibility = useCallback((tabId: string) => {
    setConfig(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === tabId ? { ...t, visible: !t.visible } : t),
    }));
  }, []);

  const toggleNewStudyButton = useCallback(() => {
    setConfig(prev => ({ ...prev, showNewStudyButton: !prev.showNewStudyButton }));
  }, []);

  const updateRoles = useCallback(async (updates: Partial<UserRoles>) => {
    if (!user) return;
    const newRoles = { ...roles, ...updates };
    setRoles(newRoles);
    try {
      await supabase
        .from('profile')
        .upsert({
          user_id: user.id,
          is_researcher: newRoles.isResearcher,
          is_participant: newRoles.isParticipant,
        }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Failed to update roles:', e);
    }
  }, [user, roles]);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const visibleTabs = config.tabs.filter(t => t.visible);

  return {
    config,
    roles,
    rolesLoading,
    visibleTabs,
    updateConfig,
    reorderTabs,
    toggleTabVisibility,
    toggleNewStudyButton,
    updateRoles,
    resetConfig,
  };
};
