import React, { useState, useEffect } from 'react';
import { Search, X, Eye, Plus, Lock, Globe, Clock, FileText, Package, Layers, Filter, Loader2, Bookmark, Trash2,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain, Heart, Briefcase, Target, MessageSquare, ThumbsUp, Smile
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getTemplateQuestions } from '../services/templateService';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import toast from 'react-hot-toast';

type TemplateType = 'research' | 'questionnaire';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  templateType: TemplateType;
  questionCount: number;
  estimatedTime: number;
  icon: any;
  color: string;
  tags: string[];
  preview?: string[];
  questionnaireCount?: number;
  isUserTemplate?: boolean;
  isPublic?: boolean;
  userId?: string;
}

interface Props {
  mode: 'browse' | 'my_templates';
  onAddTemplate?: (questions: any[], title: string) => void;
  onClose?: () => void;
}

const ICON_MAP: Record<string, any> = {
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain, Heart, Briefcase, Target, MessageSquare, ThumbsUp, Smile, FileText, Package
};

// Built-in templates (same as TemplateLibrary but for embedding)
const BUILTIN_TEMPLATES: Template[] = [
  { id: '1', name: 'Customer Satisfaction (CSAT)', description: 'Measure customer satisfaction with your product or service.', category: 'customer', templateType: 'questionnaire', questionCount: 10, estimatedTime: 3, icon: ThumbsUp, color: 'from-sky-400 to-blue-500', tags: ['CSAT'] },
  { id: '2', name: 'Net Promoter Score (NPS)', description: 'Measure customer loyalty and predict business growth.', category: 'customer', templateType: 'questionnaire', questionCount: 4, estimatedTime: 2, icon: Target, color: 'from-emerald-400 to-teal-500', tags: ['NPS'] },
  { id: '3', name: 'Employee Engagement', description: 'Measure employee satisfaction and workplace culture.', category: 'hr', templateType: 'questionnaire', questionCount: 11, estimatedTime: 6, icon: Smile, color: 'from-violet-400 to-purple-500', tags: ['HR'] },
  { id: '4', name: 'Website Usability', description: 'Evaluate UX and identify usability issues.', category: 'ux', templateType: 'questionnaire', questionCount: 9, estimatedTime: 5, icon: Palette, color: 'from-pink-400 to-rose-500', tags: ['UX'] },
  { id: '5', name: 'Patient Experience', description: 'Measure patient satisfaction in healthcare settings.', category: 'healthcare', templateType: 'questionnaire', questionCount: 9, estimatedTime: 5, icon: Heart, color: 'from-rose-400 to-red-500', tags: ['Patient'] },
  { id: '6', name: 'Academic Research', description: 'Template for behavioral research with consent and demographics.', category: 'academic', templateType: 'questionnaire', questionCount: 5, estimatedTime: 3, icon: GraduationCap, color: 'from-indigo-400 to-blue-500', tags: ['Research'] },
  { id: '7', name: 'Product Feedback', description: 'Collect feedback on product features and usability.', category: 'customer', templateType: 'questionnaire', questionCount: 8, estimatedTime: 4, icon: MessageSquare, color: 'from-cyan-400 to-teal-500', tags: ['Product'] },
  { id: '11', name: 'Big Five Personality', description: 'Likert-scale personality questionnaire for research.', category: 'academic', templateType: 'questionnaire', questionCount: 10, estimatedTime: 4, icon: Brain, color: 'from-teal-400 to-emerald-500', tags: ['Psychology'] },
  { id: '14', name: 'System Usability Scale', description: '10-item SUS questionnaire for usability.', category: 'ux', templateType: 'questionnaire', questionCount: 10, estimatedTime: 3, icon: Target, color: 'from-violet-300 to-purple-500', tags: ['SUS'] },
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'academic', name: 'Academic' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'ux', name: 'UX' },
  { id: 'customer', name: 'Customer' },
  { id: 'hr', name: 'HR' },
  { id: 'market', name: 'Market' },
];

const TemplateMarketplaceEmbed: React.FC<Props> = ({ mode, onAddTemplate, onClose }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  // Load user templates from DB
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        let query = supabase.from('user_template').select('*');
        if (mode === 'my_templates') {
          query = query.eq('user_id', user.id);
        } else {
          // Browse: show public + own
          query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
        }
        const { data } = await query.order('created_at', { ascending: false });
        if (data) {
          setUserTemplates(data.map((t: any) => ({
            id: `user_${t.id}`,
            name: t.title,
            description: t.description || '',
            category: t.category || 'custom',
            templateType: t.template_type as TemplateType || 'questionnaire',
            questionCount: (t.template_data?.questions || []).length,
            estimatedTime: Math.ceil((t.template_data?.questions || []).length * 0.5),
            icon: Bookmark,
            color: 'from-amber-400 to-orange-500',
            tags: t.tags || [],
            isUserTemplate: true,
            isPublic: t.is_public,
            userId: t.user_id,
          })));
        }
      } catch (err) {
        console.error('Failed to load user templates:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, mode]);

  const allTemplates = mode === 'my_templates'
    ? userTemplates
    : [...userTemplates, ...BUILTIN_TEMPLATES.filter(bt => !userTemplates.some(ut => ut.name === bt.name))];

  const filtered = allTemplates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || t.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = async (template: Template) => {
    if (!onAddTemplate) return;
    setAdding(template.id);
    try {
      if (template.isUserTemplate) {
        // Load from DB
        const dbId = template.id.replace('user_', '');
        const { data } = await supabase.from('user_template').select('template_data').eq('id', dbId).single();
        if (data?.template_data?.questions) {
          const questions = data.template_data.questions.map((q: any, i: number) => ({
            id: crypto.randomUUID(),
            question_type: normalizeLegacyQuestionType(q.type || q.question_type || 'text_short'),
            question_text: q.text || q.question_text || '',
            question_description: q.question_description || '',
            question_config: q.config || q.question_config || {},
            validation_rule: {},
            logic_rule: {},
            ai_config: {},
            order_index: i,
            required: q.required ?? false,
            allow_voice: false,
            allow_ai_assist: false,
            options: (q.options || []).map((opt: any, oi: number) => ({
              id: crypto.randomUUID(),
              option_text: typeof opt === 'string' ? opt : opt.option_text || opt.text || '',
              option_value: '',
              order_index: oi,
              is_other: false,
            })),
          }));
          onAddTemplate(questions, template.name);
          toast.success(`Added "${template.name}" template`);
        }
      } else {
        // Built-in template
        const rawQuestions = getTemplateQuestions(template.id);
        if (rawQuestions) {
          const questions = rawQuestions.map((q: any, i: number) => ({
            id: crypto.randomUUID(),
            question_type: normalizeLegacyQuestionType(q.type || 'text_short'),
            question_text: q.text || '',
            question_description: '',
            question_config: q.config || {},
            validation_rule: {},
            logic_rule: {},
            ai_config: {},
            order_index: i,
            required: q.required ?? false,
            allow_voice: false,
            allow_ai_assist: false,
            options: (q.options || []).map((opt: string, oi: number) => ({
              id: crypto.randomUUID(),
              option_text: opt,
              option_value: '',
              order_index: oi,
              is_other: false,
            })),
          }));
          onAddTemplate(questions, template.name);
          toast.success(`Added "${template.name}" template`);
        }
      }
    } catch (err) {
      toast.error('Failed to add template');
    } finally {
      setAdding(null);
    }
  };

  const handleDeleteUserTemplate = async (template: Template) => {
    if (!template.isUserTemplate) return;
    const dbId = template.id.replace('user_', '');
    const { error } = await supabase.from('user_template').delete().eq('id', dbId);
    if (error) { toast.error('Failed to delete'); return; }
    setUserTemplates(prev => prev.filter(t => t.id !== template.id));
    toast.success('Template deleted');
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
          <p className="text-[12px] text-stone-400">Try different search terms or categories</p>
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
                    {template.isUserTemplate && (
                      template.isPublic
                        ? <Globe size={11} className="text-emerald-400 shrink-0" />
                        : <Lock size={11} className="text-stone-300 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">{template.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-3">
                <span className="flex items-center gap-1"><FileText size={11} /> {template.questionCount} q</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {template.estimatedTime} min</span>
              </div>

              <div className="flex items-center gap-2">
                {onAddTemplate && (
                  <button
                    onClick={() => handleAdd(template)}
                    disabled={adding === template.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    {adding === template.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Add
                  </button>
                )}
                {template.isUserTemplate && template.userId === user?.id && (
                  <button
                    onClick={() => handleDeleteUserTemplate(template)}
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
