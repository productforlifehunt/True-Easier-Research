import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Layers, GitBranch, Globe, Lock, Smartphone, PieChart, Download,
  Wand2, Bot, MessageSquare, Mic, Clock, Users, BarChart3,
  Shield, Bell, FileText, Repeat
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const coreFeatures = [
    { icon: Layers, title: t('features.questionTypes'), desc: t('features.questionTypes.desc') },
    { icon: GitBranch, title: t('features.skipLogic'), desc: t('features.skipLogic.desc') },
    { icon: Clock, title: t('features.longitudinal'), desc: t('features.longitudinal.desc') },
    { icon: Users, title: t('features.participantTypes'), desc: t('features.participantTypes.desc') },
    { icon: Shield, title: t('features.consent'), desc: t('features.consent.desc') },
    { icon: Bell, title: t('features.notifications'), desc: t('features.notifications.desc') },
  ];

  const aiFeatures = [
    { icon: Wand2, title: t('features.aiBuilder'), desc: t('features.aiBuilder.desc') },
    { icon: Bot, title: t('features.aiAutoAnswer'), desc: t('features.aiAutoAnswer.desc') },
    { icon: Mic, title: t('features.voiceInput'), desc: t('features.voiceInput.desc') },
    { icon: MessageSquare, title: t('features.chatbot'), desc: t('features.chatbot.desc') },
  ];

  const platformFeatures = [
    { icon: Globe, title: t('features.webMobile'), desc: t('features.webMobile.desc') },
    { icon: Smartphone, title: t('features.mobileFirst'), desc: t('features.mobileFirst.desc') },
    { icon: PieChart, title: t('features.analytics'), desc: t('features.analytics.desc') },
    { icon: BarChart3, title: t('features.dashboards'), desc: t('features.dashboards.desc') },
    { icon: Download, title: t('features.export'), desc: t('features.export.desc') },
    { icon: Lock, title: t('features.privacy'), desc: t('features.privacy.desc') },
    { icon: Repeat, title: t('features.templatesReuse'), desc: t('features.templatesReuse.desc') },
    { icon: FileText, title: t('features.multiQuestionnaire'), desc: t('features.multiQuestionnaire.desc') },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-emerald-50/60 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-[-0.035em] text-stone-800 mb-5">
            {t('features.hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t('features.hero.title2')}
            </span>
          </h1>
          <p className="text-lg text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
            {t('features.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Core Research Features */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase mb-2">{t('features.research.label')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-stone-800">
              {t('features.research.title')}
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
            <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase mb-3">{t('features.ai.label')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-stone-800 mb-3">
              {t('features.ai.title')}
            </h2>
            <p className="text-[15px] text-stone-400 max-w-md mx-auto font-light">
              {t('features.ai.subtitle')}
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
            <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase mb-2">{t('features.platform.label')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-stone-800">
              {t('features.platform.title')}
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