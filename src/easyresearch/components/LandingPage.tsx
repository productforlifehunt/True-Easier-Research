import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check,
  Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  ChevronRight
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
    { icon: Layers, title: '14 Templates', desc: 'Start fast with professional templates.' },
  ];

  const useCases = [
    { icon: GraduationCap, name: 'Academic', color: 'bg-blue-500' },
    { icon: Stethoscope, name: 'Healthcare', color: 'bg-rose-500' },
    { icon: Palette, name: 'UX Research', color: 'bg-violet-500' },
    { icon: ShoppingBag, name: 'Market Research', color: 'bg-amber-500' },
    { icon: Building2, name: 'HR & Employee', color: 'bg-teal-500' },
    { icon: Brain, name: 'Psychology', color: 'bg-pink-500' },
  ];

  const steps = [
    { n: '01', title: 'Design', desc: 'Build your survey with our intuitive drag-and-drop builder.' },
    { n: '02', title: 'Distribute', desc: 'Share via link or survey code. Works on any device.' },
    { n: '03', title: 'Analyze', desc: 'View real-time analytics and export your data.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-28 lg:pt-40 pb-20 lg:pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[13px] font-medium mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Professional survey platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.08] tracking-tight text-neutral-900 mb-6">
              Research made
              <br />
              <span className="text-emerald-600">remarkably simple</span>
            </h1>
            <p className="text-lg lg:text-xl text-neutral-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Create surveys, collect quality data, and analyze results — all in one elegant platform designed for serious research.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/easyresearch/auth')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-neutral-900 text-white text-[15px] font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Start for free <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/easyresearch/templates')}
                className="inline-flex items-center justify-center px-7 py-3.5 text-[15px] font-semibold text-neutral-600 rounded-xl border border-black/[0.08] hover:bg-neutral-50 transition-colors"
              >
                Browse templates
              </button>
            </div>
            <p className="text-[13px] text-neutral-400 mt-5">
              No credit card required · Free plan forever
            </p>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-black/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {['Universities', 'Healthcare', 'UX Teams', 'Market Research', 'HR', 'Startups'].map(cat => (
              <span key={cat} className="text-[14px] font-medium text-neutral-300 tracking-wide uppercase">{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-neutral-500 max-w-lg mx-auto">
              Professional tools without the complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl p-5 border border-black/[0.04] hover:border-emerald-200 hover:shadow-sm transition-all group">
                <f.icon size={20} className="text-emerald-600 mb-3" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold text-neutral-900 mb-1">{f.title}</h3>
                <p className="text-[13px] text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-neutral-50/50 border-y border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              Three simple steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white text-[15px] font-bold flex items-center justify-center mx-auto mb-5">
                  {s.n}
                </div>
                <h3 className="text-[16px] font-semibold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-[14px] text-neutral-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              Built for every field
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => navigate('/easyresearch/templates')}
                className="rounded-xl p-6 border border-black/[0.04] hover:border-emerald-200 hover:shadow-sm transition-all text-left group"
              >
                <div className={`w-11 h-11 ${uc.color} rounded-xl flex items-center justify-center mb-4`}>
                  <uc.icon size={20} className="text-white" />
                </div>
                <h3 className="text-[15px] font-semibold text-neutral-900 group-hover:text-emerald-600 transition-colors mb-1">
                  {uc.name}
                </h3>
                <span className="text-[13px] text-emerald-600 font-medium inline-flex items-center gap-1">
                  Templates <ChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 bg-neutral-50/50 border-y border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-neutral-500">Start free, upgrade when ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '$0', sub: 'forever', features: ['3 surveys', '100 responses/mo', '13 question types', 'CSV export'] },
              { name: 'Professional', price: '$29', sub: '/month', features: ['Unlimited surveys', '1,000 responses/mo', 'Skip logic', 'All exports'], popular: true },
              { name: 'Enterprise', price: 'Custom', sub: '', features: ['Unlimited everything', 'Compliance tracking', 'Team collaboration', 'Dedicated support'] },
            ].map((plan, i) => (
              <div key={i} className={`rounded-xl p-6 border-2 ${plan.popular ? 'border-emerald-500 shadow-lg' : 'border-black/[0.04]'} relative`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold">
                    Popular
                  </div>
                )}
                <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-neutral-900">{plan.price}</span>
                  <span className="text-[13px] text-neutral-400">{plan.sub}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px] text-neutral-600">
                      <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.name === 'Enterprise' ? '/easyresearch/pricing' : '/easyresearch/auth')}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Ready to start?
          </h2>
          <p className="text-lg text-neutral-500 mb-8">
            Join researchers who trust EasierResearch for their studies.
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white text-[15px] font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Create your first survey <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Er</span>
            </div>
            <span className="text-[14px] font-semibold text-neutral-900">EasierResearch</span>
          </div>
          <p className="text-[12px] text-neutral-400">© 2025 EasierResearch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
