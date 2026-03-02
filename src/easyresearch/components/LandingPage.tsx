import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ChevronRight, BarChart3,
  Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download, Sparkles,
  GraduationCap, Stethoscope, ShoppingBag, Palette, Building2, Brain
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
    { icon: Sparkles, titleKey: 'feature.templates', descKey: 'feature.templates.desc' },
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

  return (
    <div className="min-h-screen bg-[#fafbf9]">
      {/* Hero — clean, modern, no gradients or blobs */}
      <section className="pt-28 sm:pt-36 lg:pt-44 pb-20 lg:pb-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white mb-8">
            <Sparkles size={12} className="text-emerald-500" />
            <span className="text-[12px] font-medium text-stone-500">{t('landing.ai.fullDesc')?.slice(0, 50) || 'AI-powered research platform'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-[-0.04em] text-stone-900 mb-5">
            {t('landing.hero.title1')}
            <br />
            <span className="text-emerald-500">
              {t('landing.hero.title2')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-400 max-w-md mx-auto mb-10 leading-relaxed font-light">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white text-[14px] font-medium rounded-lg hover:bg-stone-800 transition-colors"
            >
              {t('landing.getStarted')} <ArrowRight size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => navigate('/easyresearch/templates')}
              className="inline-flex items-center justify-center px-6 py-3 text-[14px] font-medium text-stone-600 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-white transition-colors"
            >
              {t('landing.browseTemplates')}
            </button>
          </div>
          <p className="text-[12px] text-stone-300 mt-5">
            {t('landing.freeForever')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-3">
              {t('landing.features.title')}
            </h2>
            <p className="text-[15px] text-stone-400 max-w-sm mx-auto font-light">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-100 rounded-2xl overflow-hidden border border-stone-100">
            {features.map((f, i) => (
              <div key={i} className="bg-[#fafbf9] p-6 hover:bg-white transition-colors">
                <f.icon size={20} className="text-emerald-500 mb-4" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold text-stone-800 mb-1">{t(f.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed font-light">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 text-center mb-14">
            {t('landing.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-stone-900 text-white text-[13px] font-semibold flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="text-[14px] font-semibold text-stone-800 mb-1.5">{t(s.titleKey)}</h3>
                <p className="text-[13px] text-stone-400 leading-relaxed font-light">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 lg:py-28 border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 text-center mb-14">
            {t('landing.useCases.title')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => navigate('/easyresearch/templates')}
                className="rounded-xl p-5 border border-stone-100 hover:border-stone-200 hover:bg-white transition-all text-left group"
              >
                <uc.icon size={20} className="text-emerald-500 mb-3" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold text-stone-800 mb-0.5">{t(uc.nameKey)}</h3>
                <p className="text-[12px] text-stone-400 font-light mb-2">{t(uc.descKey)}</p>
                <span className="text-[12px] text-stone-400 group-hover:text-emerald-500 font-medium inline-flex items-center gap-0.5 transition-colors">
                  {t('nav.templates')} <ChevronRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-[15px] text-stone-400 mb-8 font-light">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-[14px] font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            {t('landing.cta.button')} <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-stone-900 flex items-center justify-center">
              <BarChart3 size={13} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-stone-800">{t('brand.name')}</span>
          </div>
          <p className="text-[11px] text-stone-300">{t('brand.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
