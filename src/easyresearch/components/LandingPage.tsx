import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  ChevronRight, Sparkles
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Layers, title: '13+ Question Types', desc: 'From choice to NPS, Likert, sliders, and more.' },
    { icon: GitBranch, title: 'Skip Logic', desc: 'Dynamic surveys that adapt to each response.' },
    { icon: Globe, title: 'Web-Based', desc: 'Access from anywhere. No installs required.' },
    { icon: Smartphone, title: 'Mobile-First', desc: 'Beautiful on every device, every time.' },
    { icon: Lock, title: 'Secure', desc: 'Encrypted storage with row-level security.' },
    { icon: PieChart, title: 'Real-Time Analytics', desc: 'Live dashboards as responses flow in.' },
    { icon: Download, title: 'Data Export', desc: 'CSV, Excel, and JSON exports.' },
    { icon: Sparkles, title: '14 Templates', desc: 'Start fast with ready-made templates.' },
  ];

  const useCases = [
    { icon: GraduationCap, name: 'Academic', desc: 'Thesis & longitudinal studies' },
    { icon: Stethoscope, name: 'Healthcare', desc: 'Patient outcomes & clinical' },
    { icon: Palette, name: 'UX Research', desc: 'Usability & user feedback' },
    { icon: ShoppingBag, name: 'Market Research', desc: 'Consumer insights & trends' },
    { icon: Building2, name: 'HR & Employee', desc: 'Engagement & satisfaction' },
    { icon: Brain, name: 'Psychology', desc: 'Behavioral & cognitive studies' },
  ];

  const steps = [
    { n: '01', title: 'Design', desc: 'Build your survey with our intuitive drag-and-drop builder.' },
    { n: '02', title: 'Distribute', desc: 'Share via link or survey code. Works on any device.' },
    { n: '03', title: 'Analyze', desc: 'View real-time analytics and export your data.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 lg:pt-44 pb-24 lg:pb-36 relative overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-50/80 via-violet-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[1.05] tracking-[-0.035em] text-slate-900 mb-6">
              Research made
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                easier
              </span>
            </h1>
            <p className="text-lg lg:text-[19px] text-slate-400 max-w-md mx-auto mb-12 leading-relaxed font-light">
              Create surveys, collect quality data, and analyze results — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/easyresearch/auth')}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-slate-900 text-white text-[15px] font-medium rounded-full hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/10"
              >
                Get started <ArrowRight size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => navigate('/easyresearch/templates')}
                className="inline-flex items-center justify-center px-7 py-3.5 text-[15px] font-medium text-slate-500 rounded-full border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition-all"
              >
                Browse templates
              </button>
            </div>
            <p className="text-[13px] text-slate-300 mt-6 font-light">
              Free forever · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-10 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {['Universities', 'Healthcare', 'UX Teams', 'Market Research', 'HR', 'Startups'].map(cat => (
              <span key={cat} className="text-[12px] font-medium text-slate-300 tracking-widest uppercase">{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 lg:py-36">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-slate-900 mb-4">
              Everything you need
            </h2>
            <p className="text-[17px] text-slate-400 max-w-sm mx-auto font-light">
              Powerful tools, zero complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
            {features.map((f, i) => (
              <div key={i} className="rounded-2xl p-6 hover:bg-slate-50/80 transition-all group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-indigo-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 bg-slate-50/60">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-slate-900">
              Three steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[13px] font-semibold flex items-center justify-center mx-auto mb-5">
                  {s.n}
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-28 lg:py-36">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-slate-900 mb-4">
              Built for every field
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => navigate('/easyresearch/templates')}
                className="rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all text-left group bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <uc.icon size={18} className="text-indigo-500" />
                </div>
                <h3 className="text-[14px] font-semibold text-slate-900 mb-0.5">
                  {uc.name}
                </h3>
                <p className="text-[12px] text-slate-400 font-light mb-2">{uc.desc}</p>
                <span className="text-[12px] text-indigo-500 font-medium inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Templates <ChevronRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-slate-50/60">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-slate-900 mb-4">
            Ready to start?
          </h2>
          <p className="text-[17px] text-slate-400 mb-10 font-light">
            Join researchers who trust Easier for their studies.
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-slate-900 text-white text-[15px] font-medium rounded-full hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/10"
          >
            Create your first survey <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">E</span>
            </div>
            <span className="text-[14px] font-semibold text-slate-900">Easier</span>
          </div>
          <p className="text-[12px] text-slate-300">© 2025 Easier. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
