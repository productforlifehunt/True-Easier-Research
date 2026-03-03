import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Clock, Copy, Eye, X, Loader2,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  Heart, Briefcase, Target, MessageSquare, ThumbsUp, Smile, Filter,
  Layers, FileText, Package, Globe, Lock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  fetchProjectTemplates,
  fetchQuestionnaireTemplates,
  createProjectFromTemplate,
  type ProjectTemplate,
  type QuestionnaireTemplate,
} from '../services/templateService';

type TemplateType = 'research' | 'questionnaire';

interface DisplayTemplate {
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
  isPublic: boolean;
  questionnaireCount?: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  academic: GraduationCap,
  healthcare: Stethoscope,
  market: ShoppingBag,
  ux: Palette,
  hr: Building2,
  customer: MessageSquare,
  custom: FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'from-indigo-400 to-blue-500',
  healthcare: 'from-rose-400 to-red-500',
  market: 'from-orange-400 to-amber-500',
  ux: 'from-pink-400 to-rose-500',
  hr: 'from-violet-400 to-purple-500',
  customer: 'from-sky-400 to-blue-500',
  custom: 'from-stone-400 to-stone-500',
};

const TemplateLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | TemplateType>('all');
  const [previewTemplate, setPreviewTemplate] = useState<DisplayTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<DisplayTemplate[]>([]);

  const categories = [
    { id: 'all', name: 'All', icon: Filter },
    { id: 'academic', name: 'Academic', icon: GraduationCap },
    { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
    { id: 'ux', name: 'UX', icon: Palette },
    { id: 'market', name: 'Market', icon: ShoppingBag },
    { id: 'hr', name: 'HR', icon: Building2 },
    { id: 'customer', name: 'Customer', icon: MessageSquare },
  ];

  const typeFilters: { id: 'all' | TemplateType; name: string; icon: any; description: string }[] = [
    { id: 'all', name: 'All Types', icon: Layers, description: 'Show all templates' },
    { id: 'research', name: 'Research Project', icon: Package, description: 'Complete project with questionnaires, settings & layout' },
    { id: 'questionnaire', name: 'Questionnaire', icon: FileText, description: 'Single questionnaire to import into an existing project' },
  ];

  // Load templates from DB
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projects, questionnaires] = await Promise.all([
          fetchProjectTemplates(user?.id),
          fetchQuestionnaireTemplates(user?.id),
        ]);

        const projectDisplays: DisplayTemplate[] = projects.map((p: ProjectTemplate) => ({
          id: p.id,
          name: p.title,
          description: p.description || '',
          category: p.template_category || 'custom',
          templateType: 'research' as TemplateType,
          questionCount: 0,
          estimatedTime: 5,
          icon: CATEGORY_ICONS[p.template_category] || Package,
          color: CATEGORY_COLORS[p.template_category] || 'from-emerald-400 to-teal-500',
          tags: [p.project_type || 'survey'],
          isPublic: p.template_is_public_or_private,
        }));

        const questionnaireDisplays: DisplayTemplate[] = questionnaires.map((q: QuestionnaireTemplate) => ({
          id: q.id,
          name: q.title,
          description: q.description || '',
          category: q.template_category || 'custom',
          templateType: 'questionnaire' as TemplateType,
          questionCount: 0,
          estimatedTime: q.estimated_duration || 3,
          icon: CATEGORY_ICONS[q.template_category] || FileText,
          color: CATEGORY_COLORS[q.template_category] || 'from-sky-400 to-blue-500',
          tags: [q.questionnaire_type || 'survey'],
          isPublic: q.template_is_public_or_private,
        }));

        setTemplates([...projectDisplays, ...questionnaireDisplays]);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesType = selectedType === 'all' || t.templateType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleUseTemplate = async (template: DisplayTemplate) => {
    if (!user) {
      toast.success('Please sign in to use this template.');
      navigate('/easyresearch/auth?redirectTo=/easyresearch/templates&redirect=researcher');
      return;
    }

    setCreating(true);
    try {
      if (template.templateType === 'research') {
        const result = await createProjectFromTemplate(template.id, user.id, user.email || '');
        if ('error' in result) {
          toast.error(result.error);
        } else {
          toast.success('Project created from template!');
          navigate(`/easyresearch/project/${result.projectId}`);
        }
      } else {
        // For questionnaire templates, navigate to create a new project first
        // then import the questionnaire template
        toast.success('Create a project first, then import this questionnaire from the template marketplace.');
        navigate('/easyresearch/create-survey');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const researchCount = filteredTemplates.filter(t => t.templateType === 'research').length;
  const questionnaireCount = filteredTemplates.filter(t => t.templateType === 'questionnaire').length;

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#f9faf8' }}>
        <Loader2 size={24} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#f9faf8' }}>
      {/* Hero */}
      <div className="bg-white" style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800 mb-3">Templates</h1>
          <p className="text-[15px] text-stone-400 mb-6 max-w-lg font-light">
            Start with a professionally designed template and customize it.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Type filter pills */}
        <div className="flex gap-2 mb-5">
          {typeFilters.map(tf => (
            <button
              key={tf.id}
              onClick={() => setSelectedType(tf.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${
                selectedType === tf.id
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'text-stone-400 hover:bg-stone-50 border-stone-100 hover:border-stone-200'
              }`}
            >
              <tf.icon size={15} />
              <span>{tf.name}</span>
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-stone-400 hover:bg-stone-100 border border-transparent'
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-stone-300 mb-5">
          {filteredTemplates.length} templates
          {selectedType === 'all' && filteredTemplates.length > 0 && (
            <span className="ml-2">· {researchCount} research, {questionnaireCount} questionnaires</span>
          )}
        </p>

        {/* Research Projects Section */}
        {(selectedType === 'all' || selectedType === 'research') && filteredTemplates.filter(t => t.templateType === 'research').length > 0 && (
          <>
            {selectedType === 'all' && (
              <div className="flex items-center gap-2 mb-4 mt-2">
                <Package size={16} className="text-emerald-600" />
                <h2 className="text-[14px] font-semibold text-stone-700">Research Projects</h2>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredTemplates.filter(t => t.templateType === 'research').map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => setPreviewTemplate(template)}
                  onUse={() => handleUseTemplate(template)}
                  creating={creating}
                />
              ))}
            </div>
          </>
        )}

        {/* Questionnaire Templates Section */}
        {(selectedType === 'all' || selectedType === 'questionnaire') && filteredTemplates.filter(t => t.templateType === 'questionnaire').length > 0 && (
          <>
            {selectedType === 'all' && (
              <div className="flex items-center gap-2 mb-4 mt-2">
                <FileText size={16} className="text-blue-600" />
                <h2 className="text-[14px] font-semibold text-stone-700">Questionnaires</h2>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.filter(t => t.templateType === 'questionnaire').map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => setPreviewTemplate(template)}
                  onUse={() => handleUseTemplate(template)}
                  creating={creating}
                />
              ))}
            </div>
          </>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
            <Search className="w-8 h-8 mx-auto mb-3 text-stone-200" />
            <p className="text-[14px] font-medium text-stone-800 mb-1">No templates found</p>
            <p className="text-[13px] text-stone-400 font-light">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-stone-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 bg-gradient-to-br ${previewTemplate.color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <previewTemplate.icon size={16} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-stone-800">{previewTemplate.name}</h2>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      previewTemplate.templateType === 'research'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {previewTemplate.templateType === 'research' ? 'Research Project' : 'Questionnaire'}
                    </span>
                    {previewTemplate.isPublic
                      ? <Globe size={12} className="text-emerald-400" />
                      : <Lock size={12} className="text-stone-300" />
                    }
                  </div>
                  <p className="text-[12px] text-stone-400">
                    {previewTemplate.estimatedTime} min
                  </p>
                </div>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1.5 rounded-lg hover:bg-stone-50">
                <X size={16} className="text-stone-400" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-stone-500 font-light">{previewTemplate.description}</p>
            </div>
            <div className="border-t border-stone-100 p-4 flex gap-2">
              <button onClick={() => setPreviewTemplate(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
                Close
              </button>
              <button
                onClick={() => { setPreviewTemplate(null); handleUseTemplate(previewTemplate); }}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-sm shadow-emerald-200"
              >
                {previewTemplate.templateType === 'research' ? 'Create Project' : 'Use Questionnaire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted card component
const TemplateCard: React.FC<{
  template: DisplayTemplate;
  onPreview: () => void;
  onUse: () => void;
  creating: boolean;
}> = ({ template, onPreview, onUse, creating }) => (
  <div className="bg-white rounded-2xl border border-stone-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all overflow-hidden group">
    <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center shadow-sm`}>
          <template.icon size={18} className="text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          {template.isPublic
            ? <Globe size={11} className="text-emerald-400" />
            : <Lock size={11} className="text-stone-300" />
          }
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            template.templateType === 'research'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {template.templateType === 'research' ? 'Project' : 'Questionnaire'}
          </span>
        </div>
      </div>
      <h3 className="text-[14px] font-semibold text-stone-800 mb-1 group-hover:text-emerald-600 transition-colors">
        {template.name}
      </h3>
      <p className="text-[13px] text-stone-400 mb-3 line-clamp-2 leading-relaxed font-light">{template.description}</p>
      <div className="flex items-center gap-3 text-[12px] text-stone-300">
        <span>{template.estimatedTime} min</span>
      </div>
    </div>
    <div className="border-t border-stone-100 p-3 flex gap-2" style={{ backgroundColor: 'rgba(16,185,129,0.02)' }}>
      <button
        onClick={onPreview}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium text-stone-400 hover:bg-white hover:text-stone-600 transition-colors"
      >
        <Eye size={13} /> Preview
      </button>
      <button
        onClick={onUse}
        disabled={creating}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-sm shadow-emerald-200"
      >
        {creating ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
        {creating ? 'Creating...' : template.templateType === 'research' ? 'Use' : 'Import'}
      </button>
    </div>
  </div>
);

export default TemplateLibrary;
