import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bToast } from '../utils/bilingualToast';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') { navigate(user ? '/easyresearch/dashboard' : '/easyresearch/auth'); return; }
    if (planName === 'Enterprise') { window.location.href = 'mailto:sales@easierresearch.com?subject=Enterprise Plan Inquiry'; return; }
    if (!user) { localStorage.setItem('intended_plan', JSON.stringify({ plan: planName.toLowerCase(), billingPeriod })); navigate('/easyresearch/auth'); return; }
    window.location.href = `mailto:support@easierresearch.com?subject=Upgrade to ${planName} Plan&body=Hi, I'd like to upgrade to the ${planName} plan (${billingPeriod} billing). My account email is ${user.email}.`;
    bToast.success('Request sent!', '请求已发送！');
  };

  const plans = [
    {
      name: t('pricing.free'), description: t('pricing.free.desc'),
      monthlyPrice: 0, annualPrice: 0,
      features: [
        { name: t('pricing.feat.3surveys'), included: true },
        { name: t('pricing.feat.100resp'), included: true },
        { name: t('pricing.feat.13types'), included: true },
        { name: t('pricing.feat.basicAnalytics'), included: true },
        { name: t('pricing.feat.csvExport'), included: true },
        { name: t('pricing.feat.skipLogic'), included: false },
        { name: t('pricing.feat.longitudinal'), included: false },
      ],
      cta: t('pricing.free.cta'), popular: false, rawName: 'Free',
    },
    {
      name: t('pricing.pro'), description: t('pricing.pro.desc'),
      monthlyPrice: 39, annualPrice: 29,
      features: [
        { name: t('pricing.feat.unlimited'), included: true },
        { name: t('pricing.feat.1000resp'), included: true },
        { name: t('pricing.feat.allTypes'), included: true },
        { name: t('pricing.feat.advancedAnalytics'), included: true },
        { name: t('pricing.feat.skipBranch'), included: true },
        { name: t('pricing.feat.allExports'), included: true },
        { name: t('pricing.feat.longESM'), included: true },
      ],
      cta: t('pricing.pro.cta'), popular: true, rawName: 'Professional',
    },
    {
      name: t('pricing.enterprise'), description: t('pricing.enterprise.desc'),
      monthlyPrice: null, annualPrice: null,
      features: [
        { name: t('pricing.feat.everythingPro'), included: true },
        { name: t('pricing.feat.unlimitedResp'), included: true },
        { name: t('pricing.feat.compliance'), included: true },
        { name: t('pricing.feat.manager'), included: true },
        { name: t('pricing.feat.onboarding'), included: true },
        { name: t('pricing.feat.teamCollab'), included: true },
        { name: t('pricing.feat.contracts'), included: true },
      ],
      cta: t('pricing.enterprise.cta'), popular: false, rawName: 'Enterprise',
    },
  ];

  const faqs = [
    { q: t('pricing.faq1.q'), a: t('pricing.faq1.a') },
    { q: t('pricing.faq2.q'), a: t('pricing.faq2.a') },
    { q: t('pricing.faq3.q'), a: t('pricing.faq3.a') },
    { q: t('pricing.faq4.q'), a: t('pricing.faq4.a') },
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <div className="border-b border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-[15px] text-neutral-500 mb-8 max-w-md mx-auto">
            {t('pricing.subtitle')}
          </p>
          <div className="inline-flex items-center rounded-lg bg-neutral-100 p-0.5">
            {(['monthly', 'annual'] as const).map(period => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-4 py-1.5 rounded-md text-[13px] font-medium capitalize transition-all ${
                  billingPeriod === period ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                }`}
              >
                {t(`pricing.${period}`)}{period === 'annual' && <span className="text-emerald-600 ml-1">-25%</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-xl p-6 border-2 relative ${plan.popular ? 'border-emerald-500 shadow-lg' : 'border-black/[0.04]'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold">
                  {t('pricing.popular')}
                </div>
              )}
              <h3 className="text-[15px] font-semibold text-neutral-900 mb-0.5">{plan.name}</h3>
              <p className="text-[12px] text-neutral-400 mb-4">{plan.description}</p>
              <div className="mb-5">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-3xl font-bold text-neutral-900">
                      ${billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-[13px] text-neutral-400">{t('pricing.mo')}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-neutral-900">{t('pricing.custom')}</span>
                )}
              </div>
              <button
                onClick={() => handleSelectPlan(plan.rawName)}
                className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-5 ${
                  plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {plan.cta}
              </button>
              <ul className="space-y-2.5">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[13px]">
                    {f.included
                      ? <Check size={14} className="text-emerald-500 shrink-0" />
                      : <X size={14} className="text-neutral-300 shrink-0" />
                    }
                    <span className={f.included ? 'text-neutral-700' : 'text-neutral-400'}>{f.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="border-t border-black/[0.04]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-center mb-10">{t('pricing.faq')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl p-5 border border-black/[0.04]">
                <h3 className="text-[14px] font-semibold text-neutral-900 mb-1.5 flex items-start gap-2">
                  <HelpCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-[13px] text-neutral-500 ml-[23px] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-neutral-900 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{t('pricing.readyToStart')}</h2>
          <p className="text-neutral-400 mb-8 text-[15px]">{t('pricing.readySubtitle')}</p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 text-white text-[15px] font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            {t('landing.getStarted')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
