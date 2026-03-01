import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain,
  ChevronRight, Sparkles, Bot, Mic, Wand2, MessageCircle
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
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
    { icon: Sparkles, titleKey: 'feature.templates', descKey: 'feature.templates.desc' },
  ];

  const aiFeatures = [
    { icon: Sparkles, titleKey: 'ai.projectBuilder', descKey: 'ai.projectBuilder.desc' },
    { icon: Wand2, titleKey: 'ai.autoAnswer', descKey: 'ai.autoAnswer.desc' },
    { icon: Bot, titleKey: 'ai.chatbot', descKey: 'ai.chatbot.desc' },
    { icon: Mic, titleKey: 'ai.voiceInput', descKey: 'ai.voiceInput.desc' },
    { icon: MessageCircle, titleKey: 'ai.assist', descKey: 'ai.assist.desc' },
    { icon: PieChart, titleKey: 'feature.analytics', descKey: 'feature.analytics.desc' },
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

  const trustedKeys = ['trusted.universities', 'trusted.healthcare', 'trusted.uxTeams', 'trusted.marketResearch', 'trusted.hr', 'trusted.startups'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafbf9' }}>
      {/* Hero */}
      <section className="pt-32 lg:pt-44 pb-24 lg:pb-36 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-emerald-50/80 via-teal-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="absolute top-6 right-6">
          <LanguageSelector />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[1.05] tracking-[-0.035em] text-stone-800 mb-6">
              {t('landing.hero.title1')}
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {t('landing.hero.title2')}
              </span>
            </h1>
            <p className="text-lg lg:text-[19px] text-stone-400 max-w-md mx-auto mb-12 leading-relaxed font-light">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/easyresearch/auth')}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[15px] font-medium rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200/50"
              >
                {t('landing.getStarted')} <ArrowRight size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => navigate('/easyresearch/templates')}
                className="inline-flex items-center justify-center px-7 py-3.5 text-[15px] font-medium text-stone-500 rounded-full border border-stone-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
              >
                {t('landing.browseTemplates')}
              </button>
            </div>
            <p className="text-[13px] text-stone-300 mt-6 font-light">
              {t('landing.freeForever')}
            </p>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-10" style={{ borderTop: '1px solid rgba(16,185,129,0.06)', borderBottom: '1px solid rgba(16,185,129,0.06)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {trustedKeys.map(key => (
              <span key={key} className="text-[12px] font-medium text-stone-300 tracking-widest uppercase">{t(key)}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 lg:py-36">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-stone-800 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-[17px] text-stone-400 max-w-sm mx-auto font-light">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f, i) => (
              <div key={i} className="rounded-2xl p-6 bg-white/70 border border-stone-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                  <f.icon size={18} className="text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-stone-800 mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed font-light">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'rgba(139,92,246,0.03)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-[12px] font-semibold mb-4">
              <Sparkles size={12} /> {t('landing.ai.title')}
            </div>
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-stone-800 mb-4">
              {t('landing.ai.cta')}
            </h2>
            <p className="text-[17px] text-stone-400 max-w-lg mx-auto font-light">
              {t('landing.ai.fullDesc')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiFeatures.map((f, i) => (
              <div key={i} className="rounded-2xl p-6 bg-white/80 border border-stone-100 hover:border-violet-200 hover:shadow-md hover:shadow-violet-50 transition-all group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center mb-4 group-hover:from-violet-100 group-hover:to-purple-100 transition-colors">
                  <f.icon size={18} className="text-violet-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-semibold text-stone-800 mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed font-light">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[14px] font-medium rounded-full hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-200/50"
            >
              <Sparkles size={14} /> {t('landing.ai.tryButton')}
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28" style={{ backgroundColor: 'rgba(16,185,129,0.03)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-stone-800">
              {t('landing.howItWorks')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-[13px] font-semibold flex items-center justify-center mx-auto mb-5 shadow-md shadow-emerald-200/50">
                  {s.n}
                </div>
                <h3 className="text-[15px] font-semibold text-stone-800 mb-2">{t(s.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed font-light">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-28 lg:py-36">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-stone-800 mb-4">
              {t('landing.useCases.title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => navigate('/easyresearch/templates')}
                className="rounded-2xl p-6 border border-stone-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all text-left group bg-white/70"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                  <uc.icon size={18} className="text-emerald-600" />
                </div>
                <h3 className="text-[14px] font-semibold text-stone-800 mb-0.5">{t(uc.nameKey)}</h3>
                <p className="text-[12px] text-stone-400 font-light mb-2">{t(uc.descKey)}</p>
                <span className="text-[12px] text-emerald-500 font-medium inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('nav.templates')} <ChevronRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28" style={{ backgroundColor: 'rgba(16,185,129,0.03)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-[40px] font-bold tracking-tight text-stone-800 mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-[17px] text-stone-400 mb-10 font-light">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[15px] font-medium rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200/50"
          >
            {t('landing.cta.button')} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: '1px solid rgba(16,185,129,0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Easier Research" className="w-6 h-6" />
            <span className="text-[14px] font-semibold text-stone-800">Easier Research</span>
          </div>
          <p className="text-[12px] text-stone-300">© 2026 Easier Research. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
