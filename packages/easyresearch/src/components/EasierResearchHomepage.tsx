import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Mic, 
  BarChart3, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Bell,
  Shield
} from 'lucide-react';

const EasierResearchHomepage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'ESM & EMA Studies',
      description: 'Capture real-time experiences with hourly prompts and timeline-based assessments'
    },
    {
      icon: Mic,
      title: 'Voice & AI Analysis',
      description: 'Natural voice responses with AI-powered sentiment and theme analysis'
    },
    {
      icon: BarChart3,
      title: 'Timeline Analytics',
      description: 'Visualize patterns across time with compliance tracking and progress monitoring'
    },
    {
      icon: Users,
      title: 'Smart Notifications',
      description: 'Automated reminders with fixed or random sampling schedules'
    },
    {
      icon: Shield,
      title: 'Clinical-Grade Security',
      description: 'HIPAA-compliant infrastructure with enterprise-level data protection'
    },
    {
      icon: Zap,
      title: 'Adaptive Questioning',
      description: 'Context-aware follow-ups and conditional branching based on responses'
    }
  ];

  const questionTypes = [
    'Single Choice',
    'Multiple Choice',
    'Text Response',
    'Rating Scale',
    'Date & Time',
    'File Upload',
    'Voice Recording',
    'Likert Scale',
    'Matrix Questions'
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <BarChart3 size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              EasierResearch
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ color: 'var(--color-green)', border: '2px solid var(--color-green)' }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="px-6 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          <span className="block">Capture Real-Life</span>
          <span className="block">Experiences in</span>
          <span className="block">the Moment</span>
        </h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          The advanced research platform for Experience Sampling (ESM), Ecological Momentary Assessment (EMA), 
          and traditional surveys. Capture hourly insights, track behaviors over time, and understand real-world experiences.
        </p>
        <button
          onClick={() => navigate('/easyresearch/auth')}
          className="px-8 py-4 rounded-lg font-semibold text-white text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-green)' }}
        >
          Start Creating Surveys
          <ArrowRight size={20} />
        </button>
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Free forever. No credit card required.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
          Everything You Need to Collect Insights
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="p-6 rounded-2xl border hover:shadow-lg transition-all"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'var(--border-light)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#f0fdf4' }}
                >
                  <Icon size={24} style={{ color: 'var(--color-green)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Question Types */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          9 Powerful Question Types
        </h2>
        <p className="text-center mb-12 text-lg" style={{ color: 'var(--text-secondary)' }}>
          From simple multiple choice to advanced voice recording
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {questionTypes.map((type, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border flex items-center gap-2"
              style={{ 
                backgroundColor: 'white',
                borderColor: 'var(--border-light)'
              }}
            >
              <CheckCircle size={20} style={{ color: 'var(--color-green)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {type}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div 
          className="rounded-3xl p-12 text-center"
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Easier-research
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Advanced ESM/EMA Survey Platform for Real-Time Experience Research
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="px-8 py-4 rounded-lg font-semibold text-white text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            Create Your First Survey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border-light)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            2024 EasierResearch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EasierResearchHomepage;
