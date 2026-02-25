import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { serviceCategories } from '../lib/serviceCategories';

const ServiceMegaMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/humans-for-hire/browse?category=${categoryId}`);
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    navigate(`/humans-for-hire/browse?category=${categoryId}&subcategory=${subcategoryId}`);
    setIsOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#374151',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#10b981';
        }}
        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#374151';
          }
        }}
      >
        Services
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          onMouseLeave={() => {
            setIsOpen(false);
            setSelectedCategory(null);
          }}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            zIndex: 2000,
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '24px',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          {/* Categories List */}
          <div style={{
            borderRight: '1px solid #f3f4f6',
            paddingRight: '24px'
          }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              All Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {serviceCategories.map((category) => (
                <button
                  key={category.id}
                  onMouseEnter={() => setSelectedCategory(category.id)}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: selectedCategory === category.id ? '#f0fdf4' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{category.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: selectedCategory === category.id ? '#10b981' : '#111827',
                      marginBottom: '2px'
                    }}>
                      {category.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      lineHeight: 1.3
                    }}>
                      {category.subcategories.length} services
                    </div>
                  </div>
                  <ArrowRight 
                    size={16} 
                    style={{ 
                      color: selectedCategory === category.id ? '#10b981' : '#d1d5db',
                      opacity: selectedCategory === category.id ? 1 : 0,
                      transition: 'all 0.15s'
                    }} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories Display */}
          <div>
            {selectedCategory ? (
              <>
                {serviceCategories
                  .filter(cat => cat.id === selectedCategory)
                  .map(category => (
                    <div key={category.id}>
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#111827',
                          marginBottom: '8px'
                        }}>
                          {category.icon} {category.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          lineHeight: 1.5
                        }}>
                          {category.description}
                        </p>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px'
                      }}>
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(category.id, sub.id)}
                            style={{
                              padding: '16px',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.borderColor = '#10b981';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#111827',
                              marginBottom: '6px'
                            }}>
                              {sub.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              marginBottom: '8px',
                              lineHeight: 1.4
                            }}>
                              {sub.description}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#10b981'
                            }}>
                              ${sub.priceRange.min}-${sub.priceRange.max}/hr
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#9ca3af',
                fontSize: '15px'
              }}>
                Hover over a category to see services
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceMegaMenu;
