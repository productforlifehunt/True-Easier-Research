import React from 'react';
import { Shield, DollarSign, CheckCircle, FileText, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UnifiedLayout from '../components/UnifiedLayout';

const Insurance: React.FC = () => {
  const navigate = useNavigate();

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        {/* Hero */}
        <section style={{ padding: '80px 24px', backgroundColor: 'white', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Shield size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
              Insurance & Protection
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Every booking is covered by comprehensive insurance and backed by our 100% Satisfaction Guarantee
            </p>
          </div>
        </section>

        {/* Coverage Overview */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              What's Covered
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {[
                {
                  icon: Shield,
                  title: 'Liability Coverage',
                  amount: '$1,000,000',
                  description: 'Comprehensive general liability insurance covering accidents and injuries during services.',
                  includes: [
                    'Bodily injury protection',
                    'Property damage coverage',
                    'Medical expenses',
                    'Legal defense costs'
                  ]
                },
                {
                  icon: DollarSign,
                  title: 'Property Protection',
                  amount: 'Up to $500,000',
                  description: 'Coverage for damage to your property during helper services.',
                  includes: [
                    'Accidental damage',
                    'Theft or loss',
                    'Replacement costs',
                    'Repair expenses'
                  ]
                },
                {
                  icon: Award,
                  title: 'Professional Coverage',
                  amount: '$250,000',
                  description: 'Professional liability for specialized services and advice.',
                  includes: [
                    'Errors & omissions',
                    'Professional negligence',
                    'Malpractice coverage',
                    'Breach of duty'
                  ]
                }
              ].map((coverage, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'white',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <coverage.icon size={28} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                    {coverage.title}
                  </h3>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>
                    {coverage.amount}
                  </div>
                  <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' }}>
                    {coverage.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {coverage.includes.map((item, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        <CheckCircle size={16} color="#10b981" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 100% Satisfaction Guarantee */}
        <section style={{ padding: '80px 24px', backgroundColor: '#fef3c7' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
                100% Satisfaction Guarantee
              </h2>
              <p style={{ fontSize: '18px', color: '#92400e', maxWidth: '700px', margin: '0 auto' }}>
                We stand behind every service. If you're not completely satisfied, we'll make it right.
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
                {[
                  {
                    icon: Clock,
                    title: '48-Hour Resolution',
                    description: 'Report any issues within 48 hours and we\'ll resolve them immediately'
                  },
                  {
                    icon: DollarSign,
                    title: 'Full Refund Option',
                    description: 'If we can\'t resolve the issue, receive a full refund, no questions asked'
                  },
                  {
                    icon: Award,
                    title: 'Re-Service Guarantee',
                    description: 'Get the service redone by a different helper at no extra cost'
                  }
                ].map((guarantee, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <guarantee.icon size={28} color="#f59e0b" />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                      {guarantee.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                      {guarantee.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How to File a Claim */}
        <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              How to File a Claim
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                {
                  step: '1',
                  title: 'Report the Issue',
                  description: 'Contact us within 48 hours through the app, email, or phone with details of the issue.'
                },
                {
                  step: '2',
                  title: 'Provide Documentation',
                  description: 'Submit photos, videos, receipts, or any relevant evidence to support your claim.'
                },
                {
                  step: '3',
                  title: 'Claim Review',
                  description: 'Our team reviews your claim within 24 hours and contacts both parties for details.'
                },
                {
                  step: '4',
                  title: 'Resolution',
                  description: 'Receive your refund, re-service, or other resolution within 3-5 business days.'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  gap: '20px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Coverage Options */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Additional Coverage Options
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px', textAlign: 'center' }}>
              Upgrade your protection for complete peace of mind
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                {
                  title: 'Premium Protection',
                  price: '+5%',
                  features: [
                    'Extended damage coverage',
                    'Zero deductible',
                    'Priority claim processing',
                    'Replacement guarantee'
                  ]
                },
                {
                  title: 'Cancellation Insurance',
                  price: '+3%',
                  features: [
                    'Free cancellation anytime',
                    'Full refund guarantee',
                    'No cancellation fees',
                    'Flexible rescheduling'
                  ]
                },
                {
                  title: 'Complete Care',
                  price: '+8%',
                  features: [
                    'All premium features',
                    'Concierge support',
                    'Unlimited modifications',
                    'VIP customer service'
                  ]
                }
              ].map((plan, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  border: index === 2 ? '3px solid #10b981' : '2px solid #e5e7eb',
                  position: 'relative'
                }}>
                  {index === 2 && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                    {plan.title}
                  </h4>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '20px' }}>
                    {plan.price}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        <CheckCircle size={16} color="#10b981" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                {
                  question: 'Is insurance included in every booking?',
                  answer: 'Yes, all bookings automatically include our standard insurance coverage at no extra cost. You can upgrade to premium coverage options for additional protection.'
                },
                {
                  question: 'What\'s not covered by insurance?',
                  answer: 'Pre-existing damage, intentional harm, and issues outside the scope of the booked service are not covered. Review our full policy for complete exclusions.'
                },
                {
                  question: 'How long does claim processing take?',
                  answer: 'Most claims are reviewed within 24 hours and resolved within 3-5 business days. Premium protection members get priority processing.'
                },
                {
                  question: 'Can I get a refund if I\'m not satisfied?',
                  answer: 'Yes, our 100% Satisfaction Guarantee ensures you receive a full refund if we cannot resolve your issue to your satisfaction.'
                }
              ].map((faq, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '2px solid #e5e7eb'
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                    {faq.question}
                  </h4>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Book with Confidence
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              Every service is protected. Start your booking today.
            </p>
            <button
              onClick={() => navigate('/humans-for-hire/browse')}
              style={{
                padding: '16px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Find a Helper
            </button>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default Insurance;
