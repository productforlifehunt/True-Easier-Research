import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download,
  Sparkles, Wand2, Bot, MessageSquare, Mic, Clock, Users, BarChart3,
  Zap, Shield, Bell, FileText, Brain, Repeat
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const coreFeatures = [
    { icon: Layers, title: 'Multiple Question Types', desc: 'Likert scales, multiple choice, open-ended, matrix, ranking, and more — all optimized for research.' },
    { icon: GitBranch, title: 'Skip Logic & Branching', desc: 'Create intelligent survey paths that adapt based on participant responses.' },
    { icon: Clock, title: 'Longitudinal & ESM Studies', desc: 'Run multi-day experience sampling with hourly, daily, or event-triggered questionnaires.' },
    { icon: Users, title: 'Participant Types', desc: 'Define participant roles (e.g. caregiver, patient) and assign tailored questionnaires to each.' },
    { icon: Shield, title: 'Consent & Screening', desc: 'Built-in consent forms and screening questionnaires with automatic eligibility filtering.' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Per-questionnaire notification schedules with participant Do Not Disturb periods.' },
  ];

  const aiFeatures = [
    { icon: Wand2, title: 'AI Survey Builder', desc: 'Describe your research goals and let AI generate a complete questionnaire in seconds.' },
    { icon: Bot, title: 'AI Auto-Answer', desc: 'Participants can let AI draft responses from voice or text, reducing survey fatigue.' },
    { icon: Mic, title: 'Voice Input', desc: 'Complete surveys without typing a single word — speak your answers naturally.' },
    { icon: MessageSquare, title: 'AI Chatbot Assistance', desc: 'Built-in chatbot helps participants understand questions and navigate studies.' },
  ];

  const platformFeatures = [
    { icon: Globe, title: 'Web & Mobile', desc: 'Responsive design works everywhere. Native push notifications via Capacitor.' },
    { icon: Smartphone, title: 'Mobile-First Design', desc: 'Optimized for phone participation with native app-like feel and bottom navigation.' },
    { icon: PieChart, title: 'Real-Time Analytics', desc: 'Monitor response rates, completion times, and data quality as they happen.' },
    { icon: BarChart3, title: 'Visual Dashboards', desc: 'Charts, summaries, and exportable reports for every study.' },
    { icon: Download, title: 'Data Export', desc: 'Export raw data in CSV or JSON for analysis in SPSS, R, or Python.' },
    { icon: Lock, title: 'Privacy & Security', desc: 'End-to-end encryption, GDPR-ready, with granular access controls.' },
    { icon: Repeat, title: 'Templates & Reuse', desc: 'Save projects, questionnaires, or individual questions as reusable templates.' },
    { icon: FileText, title: 'Multi-Questionnaire Projects', desc: 'Combine daily logs, hourly check-ins, and one-time surveys in a single study.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-emerald-50/60 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
            <Zap size={13} className="text-emerald-600" />
            <span className="text-[12px] font-semibold text-emerald-700 tracking-tight">Platform Features</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-[-0.035em] text-stone-800 mb-5">
            Everything you need for
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              serious research
            </span>
          </h1>
          <p className="text-lg text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
            From one-time surveys to multi-week longitudinal studies — designed for researchers who need reliability and flexibility.
          </p>
        </div>
      </section>

      {/* Core Research Features */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase mb-2">Research Tools</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-stone-800">
              Built for rigorous research
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-stone-100 p-6 hover:border-emerald-200 hover:shadow-sm transition-all bg-white">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-emerald-600" strokeWidth={1.6} />
                </div>
                <h3 className="text-[15px] font-semibold text-stone-700 mb-2">{f.title}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 lg:py-28 bg-stone-50/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase">AI-Powered</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-stone-800 mb-3">
              Research meets artificial intelligence
            </h2>
            <p className="text-[15px] text-stone-400 max-w-md mx-auto font-light">
              AI assists both researchers and participants — from survey creation to response collection.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {aiFeatures.map((f, i) => (
              <div key={i} className="rounded-2xl border border-stone-200/60 bg-white p-6 hover:border-emerald-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-emerald-600" strokeWidth={1.6} />
                </div>
                <h3 className="text-[15px] font-semibold text-stone-700 mb-2">{f.title}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase mb-2">Platform</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-stone-800">
              Reliable infrastructure
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformFeatures.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-stone-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all bg-white">
                <div className="w-9 h-9 rounded-xl bg-stone-50 group-hover:bg-emerald-50 flex items-center justify-center mb-3 transition-colors">
                  <f.icon size={17} className="text-stone-400 group-hover:text-emerald-600 transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-stone-700 mb-1">{f.title}</h3>
                <p className="text-[12px] text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-stone-50/60">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-stone-800 mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-[15px] text-stone-400 mb-10 font-light">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[15px] font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            {t('landing.cta.button')} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
