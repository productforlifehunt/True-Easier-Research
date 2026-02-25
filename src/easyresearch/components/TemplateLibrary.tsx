import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Clock, Copy, Eye, X, Loader2,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  Heart, Briefcase, Target, MessageSquare, ThumbsUp, Smile, Filter
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { createSurveyFromTemplate } from '../services/templateService';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  questionCount: number;
  estimatedTime: number;
  icon: any;
  color: string;
  tags: string[];
  preview?: string[];
}

const TemplateLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: Filter },
    { id: 'academic', name: 'Academic', icon: GraduationCap },
    { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
    { id: 'ux', name: 'UX', icon: Palette },
    { id: 'market', name: 'Market', icon: ShoppingBag },
    { id: 'hr', name: 'HR', icon: Building2 },
    { id: 'customer', name: 'Customer', icon: MessageSquare },
  ];

  const templates: Template[] = [
    { id: '1', name: 'Customer Satisfaction (CSAT)', description: 'Measure customer satisfaction with your product or service.', category: 'customer', questionCount: 12, estimatedTime: 3, icon: ThumbsUp, color: 'bg-blue-500', tags: ['CSAT'], preview: ['How satisfied are you with our product?', 'How likely are you to recommend us?', 'What could we improve?'] },
    { id: '2', name: 'Net Promoter Score (NPS)', description: 'Measure customer loyalty and predict business growth.', category: 'customer', questionCount: 5, estimatedTime: 2, icon: Target, color: 'bg-emerald-500', tags: ['NPS'], preview: ['How likely are you to recommend us to a friend?', 'What is the primary reason for your score?'] },
    { id: '3', name: 'Employee Engagement', description: 'Measure employee satisfaction and workplace culture.', category: 'hr', questionCount: 25, estimatedTime: 10, icon: Smile, color: 'bg-violet-500', tags: ['HR'], preview: ['I feel valued at work', 'I have the resources I need', 'I see a path for growth here'] },
    { id: '4', name: 'Website Usability', description: 'Evaluate UX and identify usability issues.', category: 'ux', questionCount: 18, estimatedTime: 8, icon: Palette, color: 'bg-pink-500', tags: ['UX'], preview: ['How easy was it to find what you were looking for?', 'Rate the overall design', 'What frustrated you?'] },
    { id: '5', name: 'Patient Experience', description: 'Measure patient satisfaction in healthcare settings.', category: 'healthcare', questionCount: 20, estimatedTime: 7, icon: Heart, color: 'bg-rose-500', tags: ['Patient'], preview: ['How would you rate your overall care?', 'Did staff explain things clearly?', 'Would you return?'] },
    { id: '6', name: 'Academic Research', description: 'Template for behavioral research with consent and demographics.', category: 'academic', questionCount: 5, estimatedTime: 3, icon: GraduationCap, color: 'bg-indigo-500', tags: ['Research'], preview: ['Consent acknowledgment', 'Demographics section', 'Main study questions'] },
    { id: '7', name: 'Product Feedback', description: 'Collect feedback on product features and usability.', category: 'customer', questionCount: 8, estimatedTime: 4, icon: MessageSquare, color: 'bg-cyan-500', tags: ['Product'], preview: ['Feature satisfaction', 'Missing features', 'Overall value'] },
    { id: '8', name: 'Event Feedback', description: 'Collect feedback to improve future events.', category: 'customer', questionCount: 9, estimatedTime: 4, icon: ThumbsUp, color: 'bg-sky-500', tags: ['Event'], preview: ['How would you rate the event overall?', 'What did you enjoy most?', 'What could be improved?'] },
    { id: '9', name: 'Market Research', description: 'Understand consumer behavior and preferences.', category: 'market', questionCount: 7, estimatedTime: 3, icon: ShoppingBag, color: 'bg-orange-500', tags: ['Market'], preview: ['Age range', 'Purchase frequency', 'What factors influence decisions?'] },
    { id: '10', name: 'Course Evaluation', description: 'Collect structured course feedback.', category: 'academic', questionCount: 9, estimatedTime: 4, icon: GraduationCap, color: 'bg-amber-500', tags: ['Education'], preview: ['Rate the course overall', 'What was most valuable?', 'What could be improved?'] },
    { id: '11', name: 'Big Five Personality', description: 'Likert-scale personality questionnaire for research.', category: 'academic', questionCount: 10, estimatedTime: 4, icon: Brain, color: 'bg-teal-500', tags: ['Psychology'], preview: ['I see myself as someone who is talkative', 'I see myself as someone who does a thorough job'] },
    { id: '12', name: 'Exit Interview', description: 'Gather insights from departing employees.', category: 'hr', questionCount: 9, estimatedTime: 4, icon: Briefcase, color: 'bg-slate-500', tags: ['HR'], preview: ['Reason for leaving', 'Management feedback', 'Would you return?'] },
    { id: '13', name: 'Caregiver Wellbeing', description: 'Longitudinal template for tracking caregiver wellbeing.', category: 'healthcare', questionCount: 12, estimatedTime: 5, icon: Heart, color: 'bg-rose-400', tags: ['Caregiver'], preview: ['How is your mood today?', 'How stressed do you feel?', 'How many hours did you provide care?'] },
    { id: '14', name: 'System Usability Scale', description: '10-item SUS questionnaire for usability.', category: 'ux', questionCount: 10, estimatedTime: 3, icon: Target, color: 'bg-violet-400', tags: ['SUS'], preview: ['I would use this system frequently', 'I found the system unnecessarily complex'] },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: Template) => {
    if (!user) {
      try { sessionStorage.setItem('easyresearch_pending_template', JSON.stringify({ id: template.id, name: template.name, description: template.description })); } catch {}
      toast.success('Please sign in to use this template.');
      navigate('/easyresearch/auth?redirectTo=/easyresearch/create-survey&redirect=researcher');
      return;
    }

    setCreating(true);
    try {
      const result = await createSurveyFromTemplate(user.id, user.email || '', template.id, template.name, template.description);
      if ('error' in result) { toast.error(result.error); }
      else { toast.success('Survey created from template!'); navigate(`/easyresearch/project/${result.projectId}`); }
    } catch (error: any) { toast.error(error.message || 'Failed to create project'); }
    finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-neutral-50/30 pt-16">
      {/* Hero */}
      <div className="bg-white border-b border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3">Templates</h1>
          <p className="text-[15px] text-neutral-500 mb-6 max-w-lg">
            Start with a professionally designed template and customize it.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[14px] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Category pills */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-neutral-400 mb-5">{filteredTemplates.length} templates</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-black/[0.04] hover:border-emerald-200 hover:shadow-sm transition-all overflow-hidden group">
              <div className="p-5">
                <div className={`w-10 h-10 ${template.color} rounded-xl flex items-center justify-center mb-4`}>
                  <template.icon size={18} className="text-white" />
                </div>
                <h3 className="text-[14px] font-semibold text-neutral-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-[13px] text-neutral-500 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                <div className="flex items-center gap-3 text-[12px] text-neutral-400">
                  <span>{template.questionCount} questions</span>
                  <span>·</span>
                  <span>{template.estimatedTime} min</span>
                </div>
              </div>
              <div className="border-t border-black/[0.04] p-3 flex gap-2 bg-neutral-50/50">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium text-neutral-500 hover:bg-white hover:text-neutral-700 transition-colors"
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {creating ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
                  {creating ? 'Creating...' : 'Use'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-black/[0.04]">
            <Search className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
            <p className="text-[14px] font-medium text-neutral-900 mb-1">No templates found</p>
            <p className="text-[13px] text-neutral-400">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-black/[0.04]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${previewTemplate.color} rounded-xl flex items-center justify-center`}>
                  <previewTemplate.icon size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-neutral-900">{previewTemplate.name}</h2>
                  <p className="text-[12px] text-neutral-400">{previewTemplate.questionCount} questions · {previewTemplate.estimatedTime} min</p>
                </div>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1.5 rounded-lg hover:bg-neutral-50">
                <X size={16} className="text-neutral-400" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-neutral-600 mb-4">{previewTemplate.description}</p>
              {previewTemplate.preview && (
                <div className="space-y-2.5">
                  <p className="text-[12px] font-medium text-neutral-500">Sample questions:</p>
                  {previewTemplate.preview.map((q, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50">
                      <span className="text-[11px] font-semibold text-emerald-600 mt-0.5">Q{i + 1}</span>
                      <span className="text-[13px] text-neutral-700">{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-black/[0.04] p-4 flex gap-2">
              <button onClick={() => setPreviewTemplate(null)} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-neutral-600 border border-black/[0.08] hover:bg-neutral-50 transition-colors">
                Close
              </button>
              <button
                onClick={() => { setPreviewTemplate(null); handleUseTemplate(previewTemplate); }}
                disabled={creating}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
