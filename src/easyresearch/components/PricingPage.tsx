import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, HelpCircle, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planName: string) => {
    // Free plan - just go to auth/dashboard
    if (planName === 'Free') {
      navigate(user ? '/easyresearch/dashboard' : '/easyresearch/auth');
      return;
    }
    
    // Enterprise - contact sales
    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@easierresearch.com?subject=Enterprise Plan Inquiry';
      return;
    }
    
    // Paid plans - redirect to Stripe checkout
    if (!user) {
      // Save intended plan and redirect to auth
      localStorage.setItem('intended_plan', JSON.stringify({ plan: planName.toLowerCase(), billingPeriod }));
      navigate('/easyresearch/auth');
      return;
    }
    
    // Paid plan upgrade — contact via email
    window.location.href = `mailto:support@easierresearch.com?subject=Upgrade to ${planName} Plan&body=Hi, I'd like to upgrade to the ${planName} plan (${billingPeriod} billing). My account email is ${user.email}.`;
    toast.success('Opening email to request your upgrade.');
  };

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { name: '3 active surveys', included: true },
        { name: '100 responses/month', included: true },
        { name: '10 question types', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'CSV export', included: true },
        { name: 'Skip logic & branching', included: false },
        { name: 'Longitudinal studies', included: false },
        { name: 'Priority support', included: false },
      ],
      cta: 'Start Free',
      popular: false,
      color: 'gray',
    },
    {
      name: 'Professional',
      description: 'For serious researchers',
      monthlyPrice: 39,
      annualPrice: 29,
      features: [
        { name: 'Unlimited surveys', included: true },
        { name: '1,000 responses/month', included: true },
        { name: 'All 10+ question types', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Skip logic & branching', included: true },
        { name: 'CSV, Excel & JSON export', included: true },
        { name: 'Longitudinal & ESM studies', included: true },
        { name: 'Priority support', included: true },
      ],
      cta: 'Upgrade',
      popular: true,
      color: 'emerald',
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      monthlyPrice: null,
      annualPrice: null,
      features: [
        { name: 'Everything in Professional', included: true },
        { name: 'Unlimited responses', included: true },
        { name: 'Advanced compliance tracking', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom onboarding', included: true },
        { name: 'Priority feature requests', included: true },
        { name: 'Team collaboration', included: true },
        { name: 'Custom contracts', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple',
    },
  ];

  const faqs = [
    {
      q: 'Can I change plans later?',
      a: 'Yes, you can upgrade or downgrade your plan at any time by contacting our support team.',
    },
    {
      q: 'How do I upgrade?',
      a: 'Click the Upgrade button for your desired plan and we\'ll get you set up via email.',
    },
    {
      q: 'What happens to my data if I downgrade?',
      a: 'Your data is never deleted. If you exceed the free plan limits, you can still view existing data but cannot create new surveys.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. All data is stored securely using Supabase with row-level security and encrypted connections.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="pt-4 lg:pt-8">
        {/* Hero */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center rounded-full p-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white shadow-sm'
                    : 'hover:opacity-80'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-white shadow-sm'
                    : 'hover:opacity-80'
                }`}
              >
                Annual <span className="text-emerald-600 ml-1">Save 25%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border-2 ${
                  plan.popular ? 'border-emerald-500 shadow-xl' : ''
                } overflow-hidden relative`}
                style={{ borderColor: plan.popular ? undefined : 'var(--border-light)' }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center text-sm font-medium py-1">
                    Most Popular
                  </div>
                )}
                <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                  <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.monthlyPrice !== null ? (
                      <>
                        <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          ${billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>/month</span>
                        {billingPeriod === 'annual' && plan.monthlyPrice > 0 && (
                          <div className="text-sm line-through" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                            ${plan.monthlyPrice}/month
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Custom</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors mb-6 flex items-center justify-center gap-2 disabled:opacity-70 ${
                      plan.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'hover:opacity-80'
                    }`}
                    style={plan.popular ? {} : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {loadingPlan === plan.name && <Loader2 className="w-4 h-4 animate-spin" />}
                    {plan.cta}
                  </button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start text-sm">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                        )}
                        <span style={{ color: feature.included ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: feature.included ? 1 : 0.6 }}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white border-t border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
              Compare All Features
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Feature</th>
                    <th className="text-center py-4 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Free</th>
                    <th className="text-center py-4 px-4 font-semibold text-emerald-600">Professional</th>
                    <th className="text-center py-4 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Team</th>
                    <th className="text-center py-4 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Active Surveys', '3', 'Unlimited', 'Unlimited', 'Unlimited'],
                    ['Responses/month', '100', '1,000', '10,000', 'Unlimited'],
                    ['Question Types', '10', '20+', '20+', '20+'],
                    ['Skip Logic', false, true, true, true],
                    ['Custom Branding', false, true, true, true],
                    ['Team Members', '1', '1', '10', 'Unlimited'],
                    ['API Access', false, false, true, true],
                    ['Enhanced Security', false, false, false, true],
                    ['SSO/SAML', false, false, false, true],
                    ['Dedicated Support', false, false, true, true],
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>{row[0]}</td>
                      {[1, 2, 3, 4].map((col) => (
                        <td key={col} className="py-4 px-4 text-center">
                          {typeof row[col] === 'boolean' ? (
                            row[col] ? (
                              <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 mx-auto" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                            )
                          ) : (
                            <span
                              className={col === 2 ? 'font-semibold text-emerald-600' : ''}
                              style={col === 2 ? {} : { color: 'var(--text-secondary)' }}
                            >
                              {row[col]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border" style={{ borderColor: 'var(--border-light)' }}>
                <h3 className="font-semibold mb-2 flex items-start" style={{ color: 'var(--text-primary)' }}>
                  <HelpCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-sm ml-7" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-emerald-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Zap className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-emerald-100 mb-8">
              Start creating professional surveys with our free plan today.
            </p>
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
