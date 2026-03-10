import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Lock, Globe, Clock, FileText, Package, Layers, Filter, Loader2, Trash2,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Lightbulb, Heart, Briefcase, Target, MessageSquare, ThumbsUp, Smile
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import {
  fetchQuestionnaireTemplates,
  fetchProjectTemplates,
  importQuestionnaireTemplate,
  deleteTemplate,
  type QuestionnaireTemplate,
  type ProjectTemplate,
} from '../services/templateService';
import toast from 'react-hot-toast';

type TemplateType = 'research' | 'questionnaire';

interface DisplayTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templateType: TemplateType;
  estimatedTime: number;
  icon: any;
  color: string;
  isPublic: boolean;
  createdBy: string | null;
}

interface Props {
  mode: 'browse' | 'my_templates';
  projectId?: string;
  onAddTemplate?: (questions: any[], title: string) => void;
  onClose?: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  academic: GraduationCap, healthcare: Stethoscope, market: ShoppingBag,
  ux: Palette, hr: Building2, customer: MessageSquare, custom: FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'from-indigo-400 to-blue-500', healthcare: 'from-rose-400 to-red-500',
  market: 'from-orange-400 to-amber-500', ux: 'from-pink-400 to-rose-500',
  hr: 'from-violet-400 to-purple-500', customer: 'from-sky-400 to-blue-500',
  custom: 'from-stone-400 to-stone-500',
};

const categories = [
  { id: 'all', name: 'All' },
  { id: 'academic', name: 'Academic' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'ux', name: 'UX' },
  { id: 'customer', name: 'Customer' },
  { id: 'hr', name: 'HR' },
  { id: 'market', name: 'Market' },
];

const TemplateMarketplaceEmbed: React.FC<Props> = ({ mode, projectId, onAddTemplate, onClose }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [templates, setTemplates] = useState<DisplayTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projects, questionnaires] = await Promise.all([
          fetchProjectTemplates(user?.id),
          fetchQuestionnaireTemplates(user?.id),
        ]);

        const all: DisplayTemplate[] = [
          ...projects.map((p: ProjectTemplate) => ({
            id: p.id,
            name: p.title,
            description: p.description || '',
            category: p.template_category || 'custom',
            templateType: 'research' as TemplateType,
            estimatedTime: 5,
            icon: CATEGORY_ICONS[p.template_category] || Package,
            color: CATEGORY_COLORS[p.template_category] || 'from-emerald-400 to-teal-500',
            isPublic: p.template_is_public_or_private,
            createdBy: p.researcher_id,
          })),
          ...questionnaires.map((q: QuestionnaireTemplate) => ({
            id: q.id,
            name: q.title,
            description: q.description || '',
            category: q.template_category || 'custom',
            templateType: 'questionnaire' as TemplateType,
            estimatedTime: q.estimated_duration || 3,
            icon: CATEGORY_ICONS[q.template_category] || FileText,
            color: CATEGORY_COLORS[q.template_category] || 'from-sky-400 to-blue-500',
            isPublic: q.template_is_public_or_private,
            createdBy: q.created_by,
          })),
        ];

        if (mode === 'my_templates') {
          setTemplates(all.filter(t => t.createdBy === user?.id));
        } else {
          setTemplates(all);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, mode]);

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || t.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = async (template: DisplayTemplate) => {
    if (!projectId || !onAddTemplate) return;
    setAdding(template.id);
    try {
      if (template.templateType === 'questionnaire') {
        const result = await importQuestionnaireTemplate(template.id, projectId);
        if ('error' in result) {
          toast.error(result.error);
        } else {
          onAddTemplate(result.questions, template.name);
          toast.success(`Added "${template.name}" template`);
        }
      } else {
        toast('Project templates must be used from the Templates page', { icon: 'i' });
      }
    } catch (err) {
      toast.error('Failed to add template');
    } finally {
      setAdding(null);
    }
  };

  const handleDelete = async (template: DisplayTemplate) => {
    if (!user) return;
    const type = template.templateType === 'research' ? 'project' : 'questionnaire';
    const result = await deleteTemplate(type, template.id, user.id);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      toast.success('Template deleted');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-stone-800">
            {mode === 'my_templates' ? t('project.myTemplates') : t('project.templateMarketplace')}
          </h3>
          <p className="text-[12px] text-stone-400 mt-0.5">
            {mode === 'my_templates'
              ? 'Your saved questionnaire and project templates'
              : 'Browse and add pre-built questionnaires to your project'}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
            <X size={18} className="text-stone-400" />
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all border ${
                category === cat.id
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'text-stone-400 border-stone-100 hover:border-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="text-stone-300 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
          <Search className="w-8 h-8 mx-auto mb-3 text-stone-200" />
          <p className="text-[14px] font-medium text-stone-700 mb-1">No templates found</p>
          <p className="text-[12px] text-stone-400">
            {mode === 'my_templates'
              ? 'Save a project or questionnaire as a template to see it here'
              : 'Try different search terms or categories'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-stone-100 p-4 hover:shadow-md hover:border-stone-200 transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                  <template.icon size={16} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[13px] font-semibold text-stone-800 truncate">{template.name}</h4>
                    {template.isPublic
                      ? <Globe size={11} className="text-emerald-400 shrink-0" />
                      : <Lock size={11} className="text-stone-300 shrink-0" />
                    }
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">{template.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-3">
                <span className="flex items-center gap-1"><Clock size={11} /> {template.estimatedTime} min</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  template.templateType === 'research' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {template.templateType === 'research' ? 'Project' : 'Questionnaire'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onAddTemplate && template.templateType === 'questionnaire' && (
                  <button
                    onClick={() => handleAdd(template)}
                    disabled={adding === template.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    {adding === template.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Add
                  </button>
                )}
                {template.createdBy === user?.id && (
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateMarketplaceEmbed;
