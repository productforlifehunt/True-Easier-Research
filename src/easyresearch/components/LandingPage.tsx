import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ChevronRight, BarChart3,
  Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download, Sparkles,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  Bot, Wand2, MessageSquare, Mic
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const features = [
    { icon: Layers, titleKey: 'feature.questionTypes', descKey: 'feature.questionTypes.desc' },
    { icon: GitBranch, titleKey: 'feature.skipLogic', descKey: 'feature.skipLogic.desc' },
    { icon: Globe, titleKey: 'feature.webBased', descKey: 'feature.webBased.desc' },
    { icon: Smartphone, titleKey: 'feature.mobileFriendly', descKey: 'feature.mobileFriendly.desc' },
    { icon: Lock, titleKey: 'feature.secure', descKey: 'feature.secure.desc' },
    { icon: PieChart, titleKey: 'feature.analytics', descKey: 'feature.analytics.desc' },
    { icon: Download, titleKey: 'feature.export', descKey: 'feature.export.desc' },
    { icon: Layers, titleKey: 'feature.templates', descKey: 'feature.templates.desc' },
  ];

  const useCases = [
    { icon: GraduationCap, nameKey: 'useCase.academic', descKey: 'useCase.academic.desc' },
    { icon: Stethoscope, nameKey: 'useCase.healthcare', descKey: 'useCase.healthcare.desc' },
    { icon: Palette, nameKey: 'useCase.uxResearch', descKey: 'useCase.uxResearch.desc' },
    { icon: ShoppingBag, nameKey: 'useCase.marketResearch', descKey: 'useCase.marketResearch.desc' },
    { icon: Building2, nameKey: 'useCase.hr', descKey: 'useCase.hr.desc' },
    { icon: Brain, nameKey: 'useCase.psychology', descKey: 'useCase.psychology.desc' },
  ];

  const steps = [
    { n: '01', titleKey: 'step.design', descKey: 'step.design.desc' },
    { n: '02', titleKey: 'step.distribute', descKey: 'step.distribute.desc' },
    { n: '03', titleKey: 'step.analyze', descKey: 'step.analyze.desc' },
  ];

  const aiCapabilities = [
    { icon: Wand2, label: t('landing.ai.cap1') },
    { icon: Mic, label: t('landing.ai.cap2') },
    { icon: Bot, label: t('landing.ai.cap3') },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO ─── */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 lg:pb-12 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-emerald-50/80 via-transparent to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-[-0.03em] text-stone-800 mb-4">
            {t('landing.hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t('landing.hero.title2')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-400 max-w-lg mx-auto mb-8 leading-relaxed font-light tracking-[-0.01em]">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[15px] font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              {t('landing.getStarted')} <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/easyresearch/templates')}
              className="inline-flex items-center justify-center px-7 py-3.5 text-[15px] font-medium text-stone-500 rounded-xl border border-stone-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
            >
              {t('landing.browseTemplates')}
            </button>
          </div>
          <p className="text-[13px] text-stone-300 tracking-wide">
            {t('landing.freeForever')}
          </p>
        </div>

        {/* AI features strip */}
        <div className="relative max-w-3xl mx-auto px-6 mt-10">
          <div className="rounded-2xl border border-stone-100 bg-stone-50/50 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-emerald-600 tracking-tight">{t('landing.ai.title')}</span>
            </div>
            <p className="text-[14px] sm:text-[15px] text-stone-500 leading-relaxed mb-2">
              {t('landing.ai.fullDesc')}
            </p>
            <p className="text-[14px] sm:text-[15px] text-stone-500 leading-relaxed mb-6 flex items-center gap-2">
              <Mic size={14} className="text-emerald-500 shrink-0" />
              <span>{t('landing.ai.voiceDesc')}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiCapabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <cap.icon size={15} className="text-emerald-600" strokeWidth={1.8} />
                  </div>
                  <p className="text-[13px] text-stone-600 leading-snug font-medium">{cap.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-stone-100 text-center">
              <button
                onClick={() => navigate('/easyresearch/auth')}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {t('landing.ai.tryButton')} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-stone-800 mb-3">
              {t('landing.features.title')}
            </h2>
            <p className="text-[15px] text-stone-400 max-w-md mx-auto font-light">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-stone-100 p-6 hover:border-emerald-200 hover:shadow-sm transition-all bg-white">
                <div className="w-9 h-9 rounded-xl bg-stone-50 group-hover:bg-emerald-50 flex items-center justify-center mb-4 transition-colors">
                  <f.icon size={18} className="text-stone-400 group-hover:text-emerald-600 transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-stone-700 mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 lg:py-32 bg-stone-50/60">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-stone-800 text-center mb-16">
            {t('landing.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-[14px] font-bold flex items-center justify-center mx-auto mb-5">
                  {s.n}
                </div>
                <h3 className="text-[15px] font-semibold text-stone-700 mb-2">{t(s.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed">{t(s.descKey)}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] w-[calc(100%-64px)] border-t border-dashed border-stone-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-stone-800 text-center mb-16">
            {t('landing.useCases.title')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => navigate('/easyresearch/templates')}
                className="group rounded-2xl p-6 border border-stone-100 hover:border-emerald-200 hover:shadow-sm transition-all text-left bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-emerald-50 flex items-center justify-center mb-4 transition-colors">
                  <uc.icon size={18} className="text-stone-400 group-hover:text-emerald-600 transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-stone-700 mb-1">{t(uc.nameKey)}</h3>
                <p className="text-[12px] text-stone-400 mb-3">{t(uc.descKey)}</p>
                <span className="text-[12px] text-stone-300 group-hover:text-emerald-500 font-medium inline-flex items-center gap-0.5 transition-colors">
                  {t('nav.templates')} <ChevronRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-stone-50/60">
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

export default LandingPage;
