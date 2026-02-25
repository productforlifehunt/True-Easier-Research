import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, BarChart3, Clock, Shield, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Easier-research
          </h1>
          <p className="text-xl md:text-2xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Modern research platform for seamless data collection
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/easyresearch')}
              className="px-8 py-4 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-md transition-shadow"
              style={{ 
                backgroundColor: 'white',
                color: 'var(--color-green)',
                border: '2px solid var(--color-green)'
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex justify-center mb-4">
              <FileText size={48} style={{ color: 'var(--color-green)' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Easy Survey Creation
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Build surveys with our intuitive drag-and-drop interface. No technical skills required.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex justify-center mb-4">
              <Users size={48} style={{ color: 'var(--color-green)' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Participant Management
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Track enrollments, monitor compliance, and manage participants effortlessly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex justify-center mb-4">
              <BarChart3 size={48} style={{ color: 'var(--color-green)' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Real-time Analytics
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Get instant insights from your data with powerful analytics and visualizations.
            </p>
          </div>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Clock size={24} style={{ color: 'var(--color-green)' }} />
              <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Longitudinal Studies
              </h4>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Support for ESM and daily diary studies with flexible scheduling
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Shield size={24} style={{ color: 'var(--color-green)' }} />
              <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Secure & Private
              </h4>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your research data is encrypted and stored securely
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Zap size={24} style={{ color: 'var(--color-green)' }} />
              <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Fast & Responsive
              </h4>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Optimized for both desktop and mobile experiences
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white rounded-2xl p-12 mb-16" style={{ border: '1px solid var(--border-light)' }}>
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Perfect for Every Research Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-green)' }}>
                Academic Research
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Ideal for university researchers conducting behavioral studies, psychological research, and social science investigations.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-green)' }}>
                Healthcare Studies
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Perfect for patient experience surveys, caregiver studies, and longitudinal health tracking.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-green)' }}>
                Market Research
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Collect customer feedback, conduct product testing, and gather consumer insights efficiently.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-green)' }}>
                User Experience
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Run usability studies, gather user feedback, and improve product experiences with real data.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12" style={{ border: '2px solid var(--color-green)' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to Start Your Research?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join researchers using Easier-research for their studies
          </p>
          <button
            onClick={() => navigate('/easyresearch')}
            className="px-8 py-4 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
