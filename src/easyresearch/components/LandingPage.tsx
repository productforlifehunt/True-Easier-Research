import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Check, ArrowRight,
  Globe, Lock, Smartphone, PieChart, Download, QrCode,
  Brain, Stethoscope, ShoppingBag, Palette, Building2, GraduationCap,
  ChevronRight, Layers, GitBranch
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const questionTypes = [
    { name: 'Multiple Choice', icon: '○' },
    { name: 'Single Choice', icon: '◉' },
    { name: 'Short Text', icon: 'Aa' },
    { name: 'Long Text', icon: '¶' },
    { name: 'Number Input', icon: '#' },
    { name: 'Date/Time', icon: '📅' },
    { name: 'Dropdown', icon: '▼' },
    { name: 'Rating Scale', icon: '★' },
    { name: 'Slider', icon: '○━' },
    { name: 'Likert Scale', icon: '━' },
    // Removed unimplemented types: Matrix Grid, File Upload, Ranking, NPS, Image Choice, Signature, Payment
  ];

  const features = [
    {
      icon: Layers,
      title: '10+ Question Types',
      description: 'From simple multiple choice to rating scales, sliders, and text inputs.',
    },
    {
      icon: GitBranch,
      title: 'Skip Logic & Branching',
      description: 'Create dynamic surveys that adapt based on respondent answers.',
    },
    {
      icon: Layers,
      title: 'Template Library',
      description: 'Start quickly with professionally designed survey templates for any use case.',
    },
    {
      icon: Globe,
      title: 'Web-Based Platform',
      description: 'Access your surveys from anywhere with our responsive web interface.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Surveys that look beautiful and work perfectly on any device.',
    },
    {
      icon: Lock,
      title: 'Security Focused',
      description: 'Enterprise-grade security with encrypted data storage and transfer.'
    },
    {
      icon: PieChart,
      title: 'Real-Time Analytics',
      description: 'Watch responses flow in with live dashboards and visualizations.',
    },
    {
      icon: Download,
      title: 'Data Export',
      description: 'Download response data as CSV or JSON for further analysis.',
    },
  ];

  const distributionMethods = [
    { icon: Globe, name: 'Web Link', desc: 'Share a direct link anywhere online' },
    { icon: QrCode, name: 'QR Code', desc: 'Perfect for in-person events' },
    { icon: Smartphone, name: 'Mobile Web', desc: 'Responsive design works on all devices' },
    { icon: Lock, name: 'Access Control', desc: 'Control who can take your survey' },
  ];

  const useCases = [
    { icon: GraduationCap, name: 'Academic Research', color: 'bg-blue-500' },
    { icon: Stethoscope, name: 'Healthcare & Clinical', color: 'bg-red-500' },
    { icon: Palette, name: 'UX Research', color: 'bg-purple-500' },
    { icon: ShoppingBag, name: 'Market Research', color: 'bg-orange-500' },
    { icon: Building2, name: 'Employee Engagement', color: 'bg-teal-500' },
    { icon: Brain, name: 'Psychology Studies', color: 'bg-pink-500' },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Survey',
      description: 'Use our intuitive builder with 10+ question types, skip logic, and templates to design your study.',
    },
    {
      step: '2',
      title: 'Share & Collect',
      description: 'Distribute via web link or QR code. Participants respond on any device with a mobile-friendly experience.',
    },
    {
      step: '3',
      title: 'Analyze & Export',
      description: 'View real-time analytics dashboards and export data as CSV, Excel, or JSON for further analysis.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['3 active surveys', '100 responses/month', '10 question types', 'Basic analytics', 'Email support'],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      features: ['Unlimited surveys', '1,000 responses/month', 'All question types', 'Advanced analytics', 'Skip logic & branching', 'Data export (CSV, Excel, JSON)', 'Priority support'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Unlimited everything', 'Longitudinal & ESM studies', 'Advanced compliance tracking', 'Dedicated support', 'Custom onboarding', 'Priority feature requests', 'Team collaboration'],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <Check className="w-4 h-4 mr-2" />
              Professional survey platform for researchers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              The Survey Platform for
              <span className="text-emerald-600"> Serious Research</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Create professional surveys, collect quality responses, and analyze data with powerful tools designed for serious research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/easyresearch/auth')}
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start for Free <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/easyresearch/templates')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-lg font-semibold rounded-xl border-2 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-light)' }}
              >
                Browse Templates
              </button>
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
              No credit card required • Free plan available forever
            </p>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
              <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>EasierResearch Survey Builder</div>
              </div>
              <div className="p-6 min-h-[300px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #ffffff 100%)' }}>
                <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
                  {questionTypes.slice(0, 8).map((qt, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border text-center hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="text-2xl mb-2">{qt.icon}</div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{qt.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              10+ Question Types Available
            </div>
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-12 border-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium mb-8" style={{ color: 'var(--text-secondary)' }}>BUILT FOR</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
            {['Universities', 'Healthcare', 'UX Teams', 'Market Research', 'HR Departments', 'Startups'].map((category) => (
              <div key={category} className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{category}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to Create World-Class Surveys
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Professional features without the complexity. Built for researchers who demand more.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border hover:border-emerald-300 hover:shadow-lg transition-all group" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                  <feature.icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Distribution Methods */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Distribute Surveys Your Way
            </h2>
            <p className="text-xl text-emerald-100">
              Reach your audience wherever they are
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {distributionMethods.map((method, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/20 transition-colors">
                <method.icon className="w-10 h-10 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">{method.name}</h3>
                <p className="text-emerald-100 text-sm">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-28" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Built for Every Research Need
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Specialized features for your industry
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 border hover:shadow-xl transition-all cursor-pointer"
                style={{ borderColor: 'var(--border-light)' }}
                onClick={() => navigate('/easyresearch/templates')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
              >
                <div className={`w-14 h-14 ${useCase.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {useCase.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Purpose-built tools and templates for {useCase.name.toLowerCase()}.
                </p>
                <span className="text-emerald-600 font-medium text-sm inline-flex items-center">
                  View Templates <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Get from idea to insights in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm text-center" style={{ border: '1px solid var(--border-light)' }}>
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-28" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Start free, upgrade when you're ready
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                className={`bg-white rounded-2xl p-8 border-2 ${
                  plan.popular ? 'border-emerald-500 shadow-xl relative' : ''
                }`}
                style={{ border: plan.popular ? undefined : '2px solid var(--border-light)' }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate('/easyresearch/auth')}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'hover:opacity-80'
                  }`}
                  style={plan.popular ? {} : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Start creating professional surveys today with our free plan.
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ backgroundColor: '#111827', color: 'rgba(229, 231, 235, 0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-xl font-bold text-white">EasierResearch</span>
              </div>
              <p className="text-sm">The modern survey platform for serious research.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link to="/easyresearch/templates" className="hover:text-white">Templates</Link></li>
                <li><Link to="/easyresearch/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/easyresearch/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/easyresearch/templates" className="hover:text-white">Academic Research</Link></li>
                <li><Link to="/easyresearch/templates" className="hover:text-white">Healthcare</Link></li>
                <li><Link to="/easyresearch/templates" className="hover:text-white">UX Research</Link></li>
                <li><Link to="/easyresearch/templates" className="hover:text-white">Market Research</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/easyresearch" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/easyresearch" className="hover:text-white">Getting Started</Link></li>
                <li><Link to="/easyresearch/templates" className="hover:text-white">Templates</Link></li>
                <li><a href="mailto:support@easierresearch.io" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/easyresearch" className="hover:text-white">About</Link></li>
                <li><a href="mailto:careers@easierresearch.io" className="hover:text-white">Careers</a></li>
                <li><Link to="/easyresearch" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/easyresearch" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: 'rgba(55, 65, 81, 0.7)' }}>
            <p className="text-sm">© {new Date().getFullYear()} EasierResearch. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="mailto:support@easierresearch.io" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
