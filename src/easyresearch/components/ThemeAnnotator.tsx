import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Tag, Plus, X, Filter, Search, Hash, MessageSquare, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

// Theme Annotator – Tag and categorize open-text responses with thematic codes
// 主题标注器 – 为开放文本响应标注和分类主题代码

interface Props {
  projectId: string;
  questionnaires: any[];
}

interface ThemeCode {
  id: string;
  name: string;
  color: string;
  description: string;
  count: number;
}

interface Annotation {
  response_id: string;
  theme_ids: string[];
  note?: string;
}

const THEME_COLORS = [
  '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899',
  '#6366f1', '#14b8a6', '#84cc16', '#f97316', '#a855f7', '#0ea5e9',
];

const ThemeAnnotator: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [themes, setThemes] = useState<ThemeCode[]>(() => {
    const stored = localStorage.getItem(`themes_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [annotations, setAnnotations] = useState<Map<string, Annotation>>(() => {
    const stored = localStorage.getItem(`annotations_${projectId}`);
    if (stored) {
      const arr: [string, Annotation][] = JSON.parse(stored);
      return new Map(arr);
    }
    return new Map();
  });
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [newThemeName, setNewThemeName] = useState('');
  const [showThemePanel, setShowThemePanel] = useState(true);

  useEffect(() => { loadData(); }, [projectId]);

  const loadData = async () => {
    try {
      const [{ data: respData }, { data: qData }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId).not('response_text', 'is', null),
        supabase.from('question').select('*').eq('project_id', projectId).order('order_index'),
      ]);
      // Filter to text-type responses only / 仅筛选文本类型响应
      const textResponses = (respData || []).filter(r => r.response_text && r.response_text.trim().length > 0);
      setResponses(textResponses);
      setQuestions((qData || []).filter((q: any) => ['text_short', 'text_long', 'text_paragraph', 'open_text'].includes(q.question_type)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveThemes = (updated: ThemeCode[]) => {
    setThemes(updated);
    localStorage.setItem(`themes_${projectId}`, JSON.stringify(updated));
  };

  const saveAnnotations = (updated: Map<string, Annotation>) => {
    setAnnotations(updated);
    localStorage.setItem(`annotations_${projectId}`, JSON.stringify(Array.from(updated.entries())));
  };

  const createTheme = () => {
    if (!newThemeName.trim()) return;
    const newTheme: ThemeCode = {
      id: crypto.randomUUID(),
      name: newThemeName.trim(),
      color: THEME_COLORS[themes.length % THEME_COLORS.length],
      description: '',
      count: 0,
    };
    saveThemes([...themes, newTheme]);
    setNewThemeName('');
    toast.success('Theme created / 主题已创建');
  };

  const deleteTheme = (id: string) => {
    saveThemes(themes.filter(t => t.id !== id));
    // Remove from annotations / 从标注中移除
    const updated = new Map(annotations);
    updated.forEach((ann, key) => {
      ann.theme_ids = ann.theme_ids.filter(tid => tid !== id);
      if (ann.theme_ids.length === 0) updated.delete(key);
    });
    saveAnnotations(updated);
  };

  const toggleAnnotation = (responseId: string, themeId: string) => {
    const updated = new Map(annotations);
    const existing = updated.get(responseId) || { response_id: responseId, theme_ids: [] };
    if (existing.theme_ids.includes(themeId)) {
      existing.theme_ids = existing.theme_ids.filter(id => id !== themeId);
    } else {
      existing.theme_ids = [...existing.theme_ids, themeId];
    }
    if (existing.theme_ids.length > 0) {
      updated.set(responseId, existing);
    } else {
      updated.delete(responseId);
    }
    saveAnnotations(updated);
  };

  // Count annotations per theme / 每个主题的标注计数
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    annotations.forEach(ann => {
      ann.theme_ids.forEach(tid => {
        counts[tid] = (counts[tid] || 0) + 1;
      });
    });
    return counts;
  }, [annotations]);

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      if (selectedQuestion !== 'all' && r.question_id !== selectedQuestion) return false;
      if (search && !r.response_text?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterTheme !== 'all') {
        const ann = annotations.get(r.id);
        if (!ann || !ann.theme_ids.includes(filterTheme)) return false;
      }
      return true;
    });
  }, [responses, selectedQuestion, search, filterTheme, annotations]);

  const annotatedCount = annotations.size;
  const totalText = responses.length;
  const progress = totalText > 0 ? Math.round(annotatedCount / totalText * 100) : 0;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Tag size={22} className="text-emerald-600" />
            Theme Annotator / 主题标注器
          </h2>
          <p className="text-sm text-stone-500 mt-1">Tag open-text responses with thematic codes / 为开放文本响应标注主题代码</p>
        </div>
        <div className="text-sm text-stone-500">
          {annotatedCount}/{totalText} coded ({progress}%)
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex justify-between mb-1 text-xs text-stone-500">
          <span>Coding Progress / 编码进度</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2">
          <div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Theme Panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">Themes / 主题 ({themes.length})</h3>
            <div className="flex gap-1 mb-3">
              <input value={newThemeName} onChange={e => setNewThemeName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTheme()} placeholder="New theme / 新主题..." className="flex-1 px-2 py-1.5 rounded border border-stone-200 text-xs" />
              <button onClick={createTheme} disabled={!newThemeName.trim()} className="px-2 py-1.5 rounded bg-emerald-500 text-white text-xs disabled:opacity-50"><Plus size={12} /></button>
            </div>
            <div className="space-y-1.5">
              {themes.map(theme => (
                <div key={theme.id} className="flex items-center gap-2 group">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                  <button onClick={() => setFilterTheme(filterTheme === theme.id ? 'all' : theme.id)} className={`flex-1 text-left text-xs transition-colors ${filterTheme === theme.id ? 'font-semibold text-stone-800' : 'text-stone-600 hover:text-stone-800'}`}>
                    {theme.name}
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">{themeCounts[theme.id] || 0}</span>
                  <button onClick={() => deleteTheme(theme.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Distribution Chart */}
          {themes.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h4 className="text-xs font-semibold text-stone-600 mb-3 flex items-center gap-1"><BarChart3 size={12} /> Distribution / 分布</h4>
              <div className="space-y-1.5">
                {themes.sort((a, b) => (themeCounts[b.id] || 0) - (themeCounts[a.id] || 0)).map(theme => {
                  const count = themeCounts[theme.id] || 0;
                  const maxCount = Math.max(1, ...Object.values(themeCounts));
                  return (
                    <div key={theme.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-500 w-16 truncate">{theme.name}</span>
                      <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: theme.color }} />
                      </div>
                      <span className="text-[10px] text-stone-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Response List */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search responses / 搜索响应..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm" />
            </div>
            <select value={selectedQuestion} onChange={e => setSelectedQuestion(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
              <option value="all">All Questions / 所有问题</option>
              {questions.map(q => <option key={q.id} value={q.id}>{(q.question_text || '').substring(0, 40)}</option>)}
            </select>
            {filterTheme !== 'all' && (
              <button onClick={() => setFilterTheme('all')} className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center gap-1">
                <X size={12} /> Clear filter
              </button>
            )}
          </div>

          {/* Responses */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredResponses.length === 0 && (
              <div className="text-center py-12 text-stone-400"><MessageSquare size={24} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No text responses found / 未找到文本响应</p></div>
            )}
            {filteredResponses.map(r => {
              const ann = annotations.get(r.id);
              const assignedThemes = ann?.theme_ids || [];
              return (
                <div key={r.id} className="bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-sm text-stone-700 mb-3 leading-relaxed">"{r.response_text}"</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {themes.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => toggleAnnotation(r.id, theme.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                          assignedThemes.includes(theme.id)
                            ? 'text-white border-transparent'
                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                        }`}
                        style={assignedThemes.includes(theme.id) ? { backgroundColor: theme.color } : {}}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeAnnotator;
