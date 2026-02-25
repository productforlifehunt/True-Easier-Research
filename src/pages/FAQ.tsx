import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle, Shield, CreditCard, Calendar, Users, Award, HelpCircle } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', label: 'Getting Started', icon: Users },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'helpers', label: 'For Helpers', icon: Award }
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How does Humans for Hire work?',
      answer: 'Humans for Hire connects you with verified local helpers for various services. Simply browse helpers, check their profiles and reviews, book a service, and pay securely through our platform.',
      icon: Users
    },
    {
      id: '2',
      category: 'booking',
      question: 'How do I book a helper?',
      answer: 'Browse our helpers, select one that matches your needs, choose a date and time, and confirm your booking. You can message the helper before booking to discuss details.',
      icon: Calendar
    },
    {
      id: '3',
      category: 'payment',
      question: 'How does payment work?',
      answer: 'We use a secure escrow system. Your payment is held safely until the service is completed. Once you confirm satisfaction, the payment is released to the helper.',
      icon: CreditCard
    },
    {
      id: '4',
      category: 'safety',
      question: 'Are helpers background checked?',
      answer: 'Yes, all helpers undergo comprehensive background checks including criminal records, identity verification, and reference checks before being approved on our platform.',
      icon: Shield
    },
    {
      id: '5',
      category: 'booking',
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel up to 24 hours before the scheduled service for a full refund. Cancellations within 24 hours may incur a fee.',
      icon: Calendar
    },
    {
      id: '6',
      category: 'helpers',
      question: 'How do I become a helper?',
      answer: 'Click "Become a Helper" to start the application process. You\'ll need to provide information, pass a background check, and complete our onboarding process.',
      icon: Award
    },
    {
      id: '7',
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our encrypted payment system.',
      icon: CreditCard
    },
    {
      id: '8',
      category: 'safety',
      question: 'What if I have an issue with a helper?',
      answer: 'Contact our support team immediately. We have a dispute resolution process and will work to resolve any issues. Your satisfaction and safety are our top priorities.',
      icon: Shield
    },
    {
      id: '9',
      category: 'booking',
      question: 'Can I book recurring services?',
      answer: 'Yes! You can set up recurring bookings for regular services like cleaning, childcare, or companionship. Save time with automatic scheduling.',
      icon: Calendar
    },
    {
      id: '10',
      category: 'helpers',
      question: 'How do helpers set their rates?',
      answer: 'Helpers set their own hourly rates based on their experience, skills, and local market rates. You can filter by price to find helpers within your budget.',
      icon: Award
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '60px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#1d1d1f',
              marginBottom: '16px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              Help Center
            </h1>
            <p style={{ fontSize: '20px', color: '#86868b', maxWidth: '600px', margin: '0 auto' }}>
              Find answers to common questions about using Humans for Hire
            </p>
          </div>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            marginBottom: '32px'
          }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#86868b'
            }} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                fontSize: '16px',
                border: '1px solid #d2d2d7',
                borderRadius: '12px',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d2d2d7'}
            />
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedCategory === cat.id ? '#10b981' : 'white',
                    color: selectedCategory === cat.id ? 'white' : '#1d1d1f',
                    border: `1px solid ${selectedCategory === cat.id ? '#10b981' : '#d2d2d7'}`,
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.backgroundColor = '#f5f5f7';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ Items */}
          <div style={{ marginBottom: '48px' }}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(item => {
                const Icon = item.icon;
                const isExpanded = expandedItems.has(item.id);
                
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #d2d2d7',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                  >
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      style={{
                        width: '100%',
                        padding: '24px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={20} color="#10b981" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '17px',
                          fontWeight: 600,
                          color: '#1d1d1f',
                          margin: 0
                        }}>
                          {item.question}
                        </h3>
                      </div>
                      <ChevronDown
                        size={20}
                        style={{
                          color: '#86868b',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </button>
                    {isExpanded && (
                      <div style={{
                        padding: '0 24px 24px 80px',
                        color: '#424245',
                        fontSize: '15px',
                        lineHeight: 1.6
                      }}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#86868b'
              }}>
                <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px' }}>No results found</p>
                <p style={{ fontSize: '15px' }}>Try searching with different keywords</p>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div style={{
            backgroundColor: '#f5f5f7',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <MessageCircle size={32} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#1d1d1f',
              marginBottom: '8px'
            }}>
              Still need help?
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#86868b',
              marginBottom: '24px'
            }}>
              Our support team is here to assist you
            </p>
            <button
              style={{
                padding: '12px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default FAQ;
