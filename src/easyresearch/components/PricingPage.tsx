import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') { navigate(user ? '/easyresearch/dashboard' : '/easyresearch/auth'); return; }
    if (planName === 'Enterprise') { window.location.href = 'mailto:sales@easierresearch.com?subject=Enterprise Plan Inquiry'; return; }
    if (!user) { localStorage.setItem('intended_plan', JSON.stringify({ plan: planName.toLowerCase(), billingPeriod })); navigate('/easyresearch/auth'); return; }
    window.location.href = `mailto:support@easierresearch.com?subject=Upgrade to ${planName} Plan&body=Hi, I'd like to upgrade to the ${planName} plan (${billingPeriod} billing). My account email is ${user.email}.`;
    toast.success('Opening email to request your upgrade.');
  };

  const plans = [
    {
      name: 'Free', description: 'Perfect for getting started',
      monthlyPrice: 0, annualPrice: 0,
      features: [
        { name: '3 active surveys', included: true },
        { name: '100 responses/month', included: true },
        { name: '13 question types', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'CSV export', included: true },
        { name: 'Skip logic', included: false },
        { name: 'Longitudinal studies', included: false },
      ],
      cta: 'Start Free', popular: false,
    },
    {
      name: 'Professional', description: 'For serious researchers',
      monthlyPrice: 39, annualPrice: 29,
      features: [
        { name: 'Unlimited surveys', included: true },
        { name: '1,000 responses/month', included: true },
        { name: 'All 13+ question types', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Skip logic & branching', included: true },
        { name: 'All export formats', included: true },
        { name: 'Longitudinal & ESM', included: true },
      ],
      cta: 'Upgrade', popular: true,
    },
    {
      name: 'Enterprise', description: 'For large organizations',
      monthlyPrice: null, annualPrice: null,
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'Unlimited responses', included: true },
        { name: 'Compliance tracking', included: true },
        { name: 'Dedicated manager', included: true },
        { name: 'Custom onboarding', included: true },
        { name: 'Team collaboration', included: true },
        { name: 'Custom contracts', included: true },
      ],
      cta: 'Contact Sales', popular: false,
    },
  ];

  const faqs = [
    { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade at any time.' },
    { q: 'What happens to my data if I downgrade?', a: 'Your data is never deleted. You can still view but can\'t create new surveys past limits.' },
    { q: 'Is my data secure?', a: 'Yes. All data uses row-level security with encrypted connections.' },
    { q: 'How do I upgrade?', a: 'Click Upgrade and we\'ll set you up via email.' },
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <div className="border-b border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[15px] text-neutral-500 mb-8 max-w-md mx-auto">
            Start free and scale as you grow. No hidden fees.
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
                {period}{period === 'annual' && <span className="text-emerald-600 ml-1">-25%</span>}
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
                  Popular
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
                    <span className="text-[13px] text-neutral-400">/mo</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-neutral-900">Custom</span>
                )}
              </div>
              <button
                onClick={() => handleSelectPlan(plan.name)}
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
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-center mb-10">FAQ</h2>
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
          <h2 className="text-2xl font-bold text-white mb-3">Ready to start?</h2>
          <p className="text-neutral-400 mb-8 text-[15px]">Create professional surveys with our free plan today.</p>
          <button
            onClick={() => navigate('/easyresearch/auth')}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 text-white text-[15px] font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Get started <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
