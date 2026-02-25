import React from 'react';
import { Shield, CheckCircle, Lock, Award, Users, Heart, FileCheck, UserCheck } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';

const Trust: React.FC = () => {
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
              Trust & Safety
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Your safety and trust are our top priorities. Learn about the measures we take to ensure a secure platform.
            </p>
          </div>
        </section>

        {/* Verification Process */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Multi-Step Verification Process
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {[
                {
                  icon: UserCheck,
                  title: 'Identity Verification',
                  description: 'Government-issued ID verification for all helpers to confirm identity.'
                },
                {
                  icon: FileCheck,
                  title: 'Background Checks',
                  description: 'Comprehensive criminal background checks through trusted third-party services.'
                },
                {
                  icon: Award,
                  title: 'Skills Verification',
                  description: 'Verification of qualifications, certifications, and professional experience.'
                },
                {
                  icon: Users,
                  title: 'Reference Checks',
                  description: 'Contact and verification of professional and personal references.'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'white',
                    border: '2px solid #10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <item.icon size={32} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Platform Safety Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px', textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
              Multiple layers of protection to keep you safe
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {[
                {
                  icon: Lock,
                  title: 'Secure Payments',
                  description: 'All payments processed through secure, encrypted payment gateways. Funds held in escrow until service completion.',
                  features: ['256-bit SSL encryption', 'PCI DSS compliant', 'Escrow protection', 'Fraud detection']
                },
                {
                  icon: Shield,
                  title: 'Insurance Coverage',
                  description: 'Comprehensive liability insurance covering all services booked through our platform.',
                  features: ['$1M liability coverage', 'Property damage protection', 'Accident coverage', 'Legal protection']
                },
                {
                  icon: Heart,
                  title: 'Safety Guidelines',
                  description: 'Comprehensive safety protocols and best practices for both helpers and clients.',
                  features: ['Safety training', 'Emergency protocols', 'Communication guidelines', '24/7 support']
                }
              ].map((item, index) => (
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
                    <item.icon size={28} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' }}>
                    {item.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {item.features.map((feature, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
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

        {/* Dispute Resolution */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Dispute Resolution
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px', textAlign: 'center' }}>
              Fair and transparent resolution process
            </p>
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              padding: '40px',
              border: '2px solid #e5e7eb'
            }}>
              {[
                {
                  step: '1',
                  title: 'Report Issue',
                  description: 'Submit a detailed report through our platform with relevant evidence and documentation.'
                },
                {
                  step: '2',
                  title: 'Investigation',
                  description: 'Our trust & safety team reviews all evidence and contacts both parties for their account.'
                },
                {
                  step: '3',
                  title: 'Mediation',
                  description: 'We facilitate communication between parties to reach a fair resolution.'
                },
                {
                  step: '4',
                  title: 'Resolution',
                  description: 'Final decision made based on platform policies, with appropriate actions taken (refund, account suspension, etc.).'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '24px',
                  marginBottom: index < 3 ? '32px' : '0'
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

        {/* Community Guidelines */}
        <section style={{ padding: '80px 24px', backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Community Guidelines
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              We maintain a respectful, professional community
            </p>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'left'
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Treat everyone with respect and professionalism',
                  'Communicate clearly and honestly',
                  'Honor commitments and show up on time',
                  'Respect privacy and confidentiality',
                  'Report inappropriate behavior immediately',
                  'Follow all local laws and regulations',
                  'Maintain accurate profiles and information',
                  'Use the platform for legitimate services only'
                ].map((guideline, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '16px',
                    fontSize: '16px',
                    color: '#374151'
                  }}>
                    <CheckCircle size={20} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: '80px 24px', backgroundColor: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Questions or Concerns?
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              Our trust & safety team is here to help 24/7
            </p>
            <button style={{
              padding: '16px 32px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Contact Trust & Safety Team
            </button>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default Trust;
