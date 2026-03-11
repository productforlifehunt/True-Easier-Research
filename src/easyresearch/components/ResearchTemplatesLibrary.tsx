import React, { useState, useMemo } from 'react';
import { BookTemplate, Search, Star, Clock, Users, Copy, Eye, Filter, Sparkles } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
interface Template {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  description: string;
  descriptionZh: string;
  questionCount: number;
  estimatedTime: string;
  popularity: number;
  tags: string[];
  methodology: string;
  sections: { name: string; questionCount: number }[];
}

interface Props {
  projectId: string;
  onApplyTemplate?: (template: Template) => void;
}

// Comprehensive template library covering all major research methodologies
// 覆盖所有主要研究方法论的综合模板库
const TEMPLATES: Template[] = [
  {
    id: 'sus', name: 'System Usability Scale (SUS)', nameZh: '系统可用性量表',
    category: 'UX Metrics', description: 'Standard 10-item SUS questionnaire with automated scoring',
    descriptionZh: '标准10题SUS问卷，含自动评分', questionCount: 10, estimatedTime: '3 min',
    popularity: 98, tags: ['usability', 'standardized', 'quantitative'], methodology: 'Survey',
    sections: [{ name: 'SUS Items', questionCount: 10 }],
  },
  {
    id: 'nps', name: 'Net Promoter Score (NPS)', nameZh: '净推荐值',
    category: 'UX Metrics', description: 'NPS with follow-up open-ended questions',
    descriptionZh: 'NPS含后续开放式问题', questionCount: 4, estimatedTime: '2 min',
    popularity: 95, tags: ['loyalty', 'benchmark', 'quick'], methodology: 'Survey',
    sections: [{ name: 'NPS Core', questionCount: 2 }, { name: 'Follow-up', questionCount: 2 }],
  },
  {
    id: 'csat', name: 'Customer Satisfaction (CSAT)', nameZh: '客户满意度',
    category: 'UX Metrics', description: 'Multi-dimensional CSAT with touchpoint analysis',
    descriptionZh: '多维CSAT含接触点分析', questionCount: 12, estimatedTime: '5 min',
    popularity: 90, tags: ['satisfaction', 'touchpoints'], methodology: 'Survey',
    sections: [{ name: 'Overall', questionCount: 3 }, { name: 'Touchpoints', questionCount: 6 }, { name: 'Open', questionCount: 3 }],
  },
  {
    id: 'usability_test', name: 'Moderated Usability Test', nameZh: '有主持人的可用性测试',
    category: 'Usability Testing', description: 'Task-based usability test with pre/post questionnaires',
    descriptionZh: '基于任务的可用性测试含前后问卷', questionCount: 20, estimatedTime: '30 min',
    popularity: 88, tags: ['tasks', 'think-aloud', 'moderated'], methodology: 'Usability Test',
    sections: [{ name: 'Pre-test', questionCount: 5 }, { name: 'Tasks', questionCount: 8 }, { name: 'Post-test', questionCount: 7 }],
  },
  {
    id: 'card_sort', name: 'Open Card Sort Study', nameZh: '开放式卡片分类研究',
    category: 'Information Architecture', description: 'Card sorting with similarity matrix analysis',
    descriptionZh: '含相似性矩阵分析的卡片分类', questionCount: 5, estimatedTime: '15 min',
    popularity: 72, tags: ['IA', 'navigation', 'categories'], methodology: 'Card Sort',
    sections: [{ name: 'Instructions', questionCount: 1 }, { name: 'Card Sort', questionCount: 1 }, { name: 'Debrief', questionCount: 3 }],
  },
  {
    id: 'tree_test', name: 'Tree Test (Reverse Card Sort)', nameZh: '树状测试（反向卡片分类）',
    category: 'Information Architecture', description: 'Navigation findability testing',
    descriptionZh: '导航可发现性测试', questionCount: 12, estimatedTime: '10 min',
    popularity: 68, tags: ['IA', 'findability', 'navigation'], methodology: 'Tree Test',
    sections: [{ name: 'Tasks', questionCount: 10 }, { name: 'Feedback', questionCount: 2 }],
  },
  {
    id: 'diary_study', name: 'Longitudinal Diary Study', nameZh: '纵向日记研究',
    category: 'Longitudinal', description: '14-day diary study with daily check-ins and weekly reflections',
    descriptionZh: '14天日记研究含每日签到和每周反思', questionCount: 25, estimatedTime: '5 min/day',
    popularity: 65, tags: ['longitudinal', 'daily', 'contextual'], methodology: 'Diary Study',
    sections: [{ name: 'Daily Entry', questionCount: 8 }, { name: 'Weekly Reflection', questionCount: 10 }, { name: 'Final', questionCount: 7 }],
  },
  {
    id: 'kano', name: 'Kano Model Analysis', nameZh: 'Kano模型分析',
    category: 'Product Strategy', description: 'Feature prioritization using Kano classification',
    descriptionZh: '使用Kano分类进行功能优先级排序', questionCount: 20, estimatedTime: '8 min',
    popularity: 70, tags: ['features', 'prioritization', 'strategy'], methodology: 'Survey',
    sections: [{ name: 'Functional', questionCount: 10 }, { name: 'Dysfunctional', questionCount: 10 }],
  },
  {
    id: 'conjoint', name: 'Conjoint Analysis', nameZh: '联合分析',
    category: 'Product Strategy', description: 'Choice-based conjoint for feature trade-off analysis',
    descriptionZh: '基于选择的联合分析用于功能权衡', questionCount: 15, estimatedTime: '10 min',
    popularity: 60, tags: ['pricing', 'features', 'trade-offs'], methodology: 'Conjoint',
    sections: [{ name: 'Screener', questionCount: 3 }, { name: 'Choice Tasks', questionCount: 10 }, { name: 'Demographics', questionCount: 2 }],
  },
  {
    id: 'ux_audit', name: 'Heuristic Evaluation', nameZh: '启发式评估',
    category: 'Expert Review', description: 'Nielsen\'s 10 heuristics evaluation framework',
    descriptionZh: 'Nielsen 10条启发式评估框架', questionCount: 30, estimatedTime: '45 min',
    popularity: 75, tags: ['heuristics', 'expert', 'audit'], methodology: 'Expert Review',
    sections: [{ name: 'Visibility', questionCount: 3 }, { name: 'Match', questionCount: 3 }, { name: 'Control', questionCount: 3 }, { name: 'Consistency', questionCount: 3 }, { name: 'Error Prevention', questionCount: 3 }, { name: 'Recognition', questionCount: 3 }, { name: 'Flexibility', questionCount: 3 }, { name: 'Aesthetics', questionCount: 3 }, { name: 'Error Recovery', questionCount: 3 }, { name: 'Help', questionCount: 3 }],
  },
  {
    id: 'a11y_audit', name: 'Accessibility Audit (WCAG 2.1)', nameZh: '无障碍审计 (WCAG 2.1)',
    category: 'Accessibility', description: 'Comprehensive WCAG 2.1 AA compliance checklist',
    descriptionZh: '全面的WCAG 2.1 AA合规检查清单', questionCount: 40, estimatedTime: '60 min',
    popularity: 55, tags: ['a11y', 'WCAG', 'compliance'], methodology: 'Audit',
    sections: [{ name: 'Perceivable', questionCount: 12 }, { name: 'Operable', questionCount: 10 }, { name: 'Understandable', questionCount: 10 }, { name: 'Robust', questionCount: 8 }],
  },
  {
    id: 'maxdiff', name: 'MaxDiff (Best-Worst Scaling)', nameZh: 'MaxDiff（最/最不偏好缩放）',
    category: 'Prioritization', description: 'Best-worst scaling for feature/message prioritization',
    descriptionZh: '用于功能/消息优先级的最/最不偏好缩放', questionCount: 12, estimatedTime: '6 min',
    popularity: 62, tags: ['prioritization', 'ranking', 'preferences'], methodology: 'MaxDiff',
    sections: [{ name: 'Instructions', questionCount: 1 }, { name: 'Choice Sets', questionCount: 10 }, { name: 'Demographics', questionCount: 1 }],
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

const ResearchTemplatesLibrary: React.FC<Props> = ({ projectId, onApplyTemplate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'questions'>('popularity');

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (selectedCategory !== 'All') list = list.filter(t => t.category === selectedCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.nameZh.includes(q) || t.tags.some(tag => tag.includes(q)));
    }
    if (sortBy === 'popularity') list = [...list].sort((a, b) => b.popularity - a.popularity);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => b.questionCount - a.questionCount);
    return list;
  }, [search, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookTemplate size={22} className="text-emerald-600" />
        <div>
          <h2 className="text-lg font-bold text-stone-800">Research Templates Library / 研究模板库</h2>
          <p className="text-xs text-stone-500">{TEMPLATES.length} professional templates across {CATEGORIES.length - 1} categories / {TEMPLATES.length}个专业模板覆盖{CATEGORIES.length - 1}个类别</p>
        </div>
      </div>

      {/* Search & Filters / 搜索和筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates... / 搜索模板..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white">
          <option value="popularity">Popular / 热门</option>
          <option value="name">Name / 名称</option>
          <option value="questions">Questions / 题数</option>
        </select>
      </div>

      {/* Category pills / 类别标签 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid / 模板网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tmpl => (
          <div key={tmpl.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700">{tmpl.category}</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={12} fill="currentColor" />
                <span className="text-[10px] font-medium">{tmpl.popularity}%</span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-stone-800 mb-0.5">{tmpl.name}</h3>
            <p className="text-[10px] text-stone-400 mb-2">{tmpl.nameZh}</p>
            <p className="text-xs text-stone-500 mb-3 line-clamp-2">{tmpl.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-stone-400 mb-3">
              <span className="flex items-center gap-1"><Users size={10} />{tmpl.questionCount} Q</span>
              <span className="flex items-center gap-1"><Clock size={10} />{tmpl.estimatedTime}</span>
              <span className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500">{tmpl.methodology}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {tmpl.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-[9px] bg-stone-50 text-stone-400 rounded">{tag}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreviewTemplate(tmpl)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors">
                <Eye size={12} /> Preview / 预览
              </button>
              <button onClick={() => onApplyTemplate?.(tmpl)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Copy size={12} /> Use / 使用
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone-400">
          <BookTemplate size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No templates match your search / 没有匹配的模板</p>
        </div>
      )}

      {/* Preview Modal / 预览弹窗 */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-stone-800 mb-1">{previewTemplate.name}</h3>
            <p className="text-xs text-stone-400 mb-4">{previewTemplate.nameZh}</p>
            <p className="text-sm text-stone-600 mb-4">{previewTemplate.description}</p>
            <h4 className="text-xs font-semibold text-stone-500 uppercase mb-2">Sections / 章节</h4>
            <div className="space-y-2 mb-4">
              {previewTemplate.sections.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-lg">
                  <span className="text-sm text-stone-700">{s.name}</span>
                  <span className="text-xs text-stone-400">{s.questionCount} questions</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreviewTemplate(null)} className="flex-1 px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-lg">Close / 关闭</button>
              <button onClick={() => { onApplyTemplate?.(previewTemplate); setPreviewTemplate(null); }}
                className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Apply Template / 应用模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchTemplatesLibrary;
