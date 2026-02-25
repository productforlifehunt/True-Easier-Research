import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Clock, Copy, Eye, ArrowRight,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  Heart, Briefcase, Target, MessageSquare, ThumbsUp, Smile, X, Loader2
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
    { id: 'all', name: 'All Templates', icon: Filter },
    { id: 'academic', name: 'Academic', icon: GraduationCap },
    { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
    { id: 'ux', name: 'UX Research', icon: Palette },
    { id: 'market', name: 'Market Research', icon: ShoppingBag },
    { id: 'hr', name: 'HR & Employee', icon: Building2 },
    { id: 'customer', name: 'Customer Feedback', icon: MessageSquare },
  ];

  const templates: Template[] = [
    {
      id: '1',
      name: 'Customer Satisfaction (CSAT)',
      description: 'Measure customer satisfaction with your product or service.',
      category: 'customer',
      questionCount: 12,
      estimatedTime: 3,
      icon: ThumbsUp,
      color: 'bg-blue-500',
      tags: ['CSAT', 'Customer Experience'],
      preview: ['How satisfied are you with our product?', 'How likely are you to recommend us?', 'What could we improve?']
    },
    {
      id: '2',
      name: 'Net Promoter Score (NPS)',
      description: 'Measure customer loyalty and predict business growth.',
      category: 'customer',
      questionCount: 5,
      estimatedTime: 2,
      icon: Target,
      color: 'bg-emerald-500',
      tags: ['NPS', 'Loyalty'],
      preview: ['How likely are you to recommend us to a friend?', 'What is the primary reason for your score?']
    },
    {
      id: '3',
      name: 'Employee Engagement Survey',
      description: 'Measure employee satisfaction, engagement, and workplace culture.',
      category: 'hr',
      questionCount: 25,
      estimatedTime: 10,
      icon: Smile,
      color: 'bg-purple-500',
      tags: ['HR', 'Engagement'],
      preview: ['I feel valued at work', 'I have the resources I need', 'I see a path for growth here']
    },
    {
      id: '4',
      name: 'Website Usability Study',
      description: 'Evaluate user experience and identify usability issues with your website or app.',
      category: 'ux',
      questionCount: 18,
      estimatedTime: 8,
      icon: Palette,
      color: 'bg-pink-500',
      tags: ['UX', 'Usability'],
      preview: ['How easy was it to find what you were looking for?', 'Rate the overall design', 'What frustrated you?']
    },
    {
      id: '5',
      name: 'Patient Experience Survey',
      description: 'Measure patient satisfaction in healthcare settings.',
      category: 'healthcare',
      questionCount: 20,
      estimatedTime: 7,
      icon: Heart,
      color: 'bg-red-500',
      tags: ['Patient'],
      preview: ['How would you rate your overall care?', 'Did staff explain things clearly?', 'Would you return?']
    },
    {
      id: '6',
      name: 'Academic Research Survey',
      description: 'Template for behavioral research including consent and demographics.',
      category: 'academic',
      questionCount: 5,
      estimatedTime: 3,
      icon: GraduationCap,
      color: 'bg-indigo-500',
      tags: ['Research'],
      preview: ['Consent acknowledgment', 'Demographics section', 'Main study questions']
    },
    {
      id: '7',
      name: 'Product Feedback Survey',
      description: 'Collect detailed feedback on your product features, usability, and future requests.',
      category: 'customer',
      questionCount: 8,
      estimatedTime: 4,
      icon: MessageSquare,
      color: 'bg-cyan-500',
      tags: ['Product', 'Feedback'],
      preview: ['Feature satisfaction', 'Missing features', 'Overall value']
    },
    {
      id: '8',
      name: 'Event Feedback',
      description: 'Collect feedback on an event to improve future sessions.',
      category: 'customer',
      questionCount: 9,
      estimatedTime: 4,
      icon: ThumbsUp,
      color: 'bg-sky-500',
      tags: ['Event', 'Feedback'],
      preview: ['How would you rate the event overall?', 'What did you enjoy most?', 'What could be improved?']
    },
    {
      id: '9',
      name: 'Market Research Survey',
      description: 'Understand consumer behavior and preferences with structured questions.',
      category: 'market',
      questionCount: 7,
      estimatedTime: 3,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      tags: ['Market', 'Consumer'],
      preview: ['Age range', 'Purchase frequency', 'What factors influence purchase decisions?']
    },
    {
      id: '10',
      name: 'Course Evaluation',
      description: 'Collect structured feedback on a course to improve learning outcomes.',
      category: 'academic',
      questionCount: 9,
      estimatedTime: 4,
      icon: GraduationCap,
      color: 'bg-amber-500',
      tags: ['Course', 'Education'],
      preview: ['Rate the course overall', 'What was most valuable?', 'What could be improved?']
    },
    {
      id: '11',
      name: 'Psychology Research (Big Five)',
      description: 'Likert-scale personality questionnaire commonly used in research settings.',
      category: 'academic',
      questionCount: 10,
      estimatedTime: 4,
      icon: Brain,
      color: 'bg-teal-500',
      tags: ['Psychology'],
      preview: ['I see myself as someone who is talkative', 'I see myself as someone who does a thorough job']
    },
    {
      id: '12',
      name: 'Exit Interview',
      description: 'Gather insights from departing employees to improve retention.',
      category: 'hr',
      questionCount: 9,
      estimatedTime: 4,
      icon: Briefcase,
      color: 'bg-slate-500',
      tags: ['HR', 'Exit'],
      preview: ['Reason for leaving', 'Management feedback', 'Would you return?']
    },
    {
      id: '13',
      name: 'Caregiver Wellbeing Study',
      description: 'Longitudinal template for tracking caregiver wellbeing over time.',
      category: 'healthcare',
      questionCount: 12,
      estimatedTime: 5,
      icon: Heart,
      color: 'bg-rose-500',
      tags: ['Caregiver'],
      preview: ['How is your mood today?', 'How stressed do you feel today?', 'How many hours did you provide care?']
    },
    {
      id: '14',
      name: 'System Usability Scale (SUS)',
      description: '10-item questionnaire for measuring perceived usability.',
      category: 'ux',
      questionCount: 10,
      estimatedTime: 3,
      icon: Target,
      color: 'bg-violet-500',
      tags: ['SUS', 'Usability'],
      preview: ['I think I would use this system frequently', 'I found the system unnecessarily complex']
    },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: Template) => {
    // If not logged in, navigate to survey builder with template data in state
    if (!user) {
      try {
        sessionStorage.setItem(
          'easyresearch_pending_template',
          JSON.stringify({
            id: template.id,
            name: template.name,
            description: template.description,
          })
        );
      } catch {
        // ignore
      }
      toast.success('Please sign in to use this template.');
      navigate('/easyresearch/auth?redirectTo=/easyresearch/create-survey&redirect=researcher');
      return;
    }

    setCreating(true);
    try {
      const result = await createSurveyFromTemplate(
        user.id,
        user.email || '',
        template.id,
        template.name,
        template.description
      );

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Survey created from template!');
        navigate(`/easyresearch/project/${result.projectId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="pt-4 lg:pt-8">
        {/* Hero */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Survey Templates
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
              Start with a professionally designed template and customize it for your needs.
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" style={{ border: '1px solid var(--border-medium)' }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border-light)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Categories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'hover:bg-opacity-80'
                      }`}
                      style={selectedCategory === cat.id ? {} : { color: 'var(--text-secondary)', backgroundColor: 'white' }}
                    >
                      <cat.icon className="w-5 h-5 mr-3" />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p style={{ color: 'var(--text-secondary)' }}>
                  {filteredTemplates.length} templates found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-xl hover:shadow-lg transition-all overflow-hidden group" style={{ border: '1px solid var(--border-light)' }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${template.color} rounded-xl flex items-center justify-center`}>
                          <template.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {template.name}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {template.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center mr-4">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {template.questionCount} questions
                        </span>
                        <span className="flex items-center mr-4">
                          <Clock className="w-4 h-4 mr-1" />
                          {template.estimatedTime} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t p-4 flex gap-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Preview
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={creating}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
                        {creating ? 'Creating...' : 'Use'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl" style={{ border: '1px solid var(--border-light)' }}>
                  <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No templates found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center">
                <div className={`w-10 h-10 ${previewTemplate.color} rounded-xl flex items-center justify-center mr-4`}>
                  <previewTemplate.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{previewTemplate.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{previewTemplate.questionCount} questions • {previewTemplate.estimatedTime} min</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-lg"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{previewTemplate.description}</p>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Sample Questions:</h3>
              <div className="space-y-3">
                {previewTemplate.preview?.map((q, i) => (
                  <div key={i} className="flex items-start p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t flex gap-3" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 px-6 py-3 border rounded-xl font-medium"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 flex items-center justify-center"
              >
                Use Template <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
