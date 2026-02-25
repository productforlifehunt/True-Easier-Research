import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import UnifiedLayout from '../components/UnifiedLayout';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, ArrowRight, ArrowLeft, User, MessageSquare, Shield, Star, ChevronDown, Info, Zap, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingFormData {
  date: string;
  time: string;
  duration: number;
  service: string;
  location: string;
  message: string;
  instantBook: boolean;
  paymentMethod: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  recurringDuration?: string;
}

const BookingFlow: React.FC = () => {
  const { helperId } = useParams();
  const navigate = useNavigate();
  const [helper, setHelper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    duration: 2,
    service: '',
    location: '',
    message: '',
    instantBook: false,
    paymentMethod: 'card'
  });

  useEffect(() => {
    loadHelperDetails();
  }, [helperId]);

  const loadHelperDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_helpers')
        .select('*')
        .eq('id', helperId)
        .single();

      if (error) throw error;
      setHelper(data);
      setFormData(prev => ({
        ...prev,
        instantBook: data?.instant_book || false
      }));
    } catch (error) {
      console.error('Error loading helper:', error);
      toast.error('Failed to load helper details');
      navigate('/humans-for-hire/browse');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!helper) return 0;
    const baseAmount = helper.hourly_rate * formData.duration;
    const serviceFee = baseAmount * 0.15; // 15% service fee
    return baseAmount + serviceFee;
  };

  const handleBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/humans-for-hire/auth');
        return;
      }

      const bookingData = {
        helper_id: helperId,
        client_id: user.id,
        date: formData.date,
        time: formData.time,
        duration_hours: formData.duration,
        service_type: formData.service,
        location: formData.location,
        message: formData.message,
        total_amount: calculateTotal(),
        status: formData.instantBook ? 'confirmed' : 'pending',
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('hfh_bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast.success(formData.instantBook ? 'Booking confirmed!' : 'Booking request sent!');
      navigate('/humans-for-hire/client/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    }
  };

  if (loading) {
    return (
      <UnifiedLayout>
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>Loading...</div>
        </div>
      </UnifiedLayout>
    );
  }

  if (!helper) {
    return (
      <UnifiedLayout>
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>Helper not found</div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: step >= s ? '#10b981' : '#f3f4f6',
                    color: step >= s ? 'white' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div style={{
                      width: '60px',
                      height: '2px',
                      backgroundColor: step > s ? '#10b981' : '#e5e7eb'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
              <span style={{ fontSize: '12px', color: step >= 1 ? '#111827' : '#9ca3af' }}>Service</span>
              <span style={{ fontSize: '12px', color: step >= 2 ? '#111827' : '#9ca3af' }}>Schedule</span>
              <span style={{ fontSize: '12px', color: step >= 3 ? '#111827' : '#9ca3af' }}>Details</span>
              <span style={{ fontSize: '12px', color: step >= 4 ? '#111827' : '#9ca3af' }}>Payment</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
            {/* Left: Form */}
            <div>
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
                    Select Service
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {helper.services?.map((service: string) => (
                      <label key={service} style={{
                        padding: '20px',
                        border: formData.service === service ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: 'white'
                      }}>
                        <input
                          type="radio"
                          name="service"
                          value={service}
                          checked={formData.service === service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
                    Choose Date & Time
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                        Duration (hours)
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: 'white'
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                          <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
                    Booking Details
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter address or meeting location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                        Message to Helper (Optional)
                      </label>
                      <textarea
                        placeholder="Any special requests or information..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
                    Payment Method
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{
                      padding: '20px',
                      border: formData.paymentMethod === 'card' ? '2px solid #10b981' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      />
                      <CreditCard size={20} />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label style={{
                      padding: '20px',
                      border: formData.paymentMethod === 'cash' ? '2px solid #10b981' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      />
                      <DollarSign size={20} />
                      <span>Cash</span>
                    </label>
                  </div>

                  <div style={{
                    marginTop: '32px',
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                      Booking Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Service:</span>
                        <span style={{ fontWeight: 600 }}>{formData.service}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Date:</span>
                        <span style={{ fontWeight: 600 }}>{formData.date}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Time:</span>
                        <span style={{ fontWeight: 600 }}>{formData.time}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Duration:</span>
                        <span style={{ fontWeight: 600 }}>{formData.duration} hours</span>
                      </div>
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Hourly Rate:</span>
                          <span>${helper.hourly_rate}/hr</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Service ({formData.duration}hrs):</span>
                          <span>${helper.hourly_rate * formData.duration}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Platform Fee (15%):</span>
                          <span>${(helper.hourly_rate * formData.duration * 0.15).toFixed(2)}</span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e5e7eb',
                          fontSize: '18px',
                          fontWeight: 600
                        }}>
                          <span>Total:</span>
                          <span style={{ color: '#10b981' }}>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '40px'
              }}>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                )}
                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && !formData.service) ||
                      (step === 2 && (!formData.date || !formData.time)) ||
                      (step === 3 && !formData.location)
                    }
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginLeft: 'auto',
                      opacity: (
                        (step === 1 && !formData.service) ||
                        (step === 2 && (!formData.date || !formData.time)) ||
                        (step === 3 && !formData.location)
                      ) ? 0.5 : 1
                    }}
                  >
                    Continue
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleBooking}
                    style={{
                      padding: '14px 32px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 'auto'
                    }}
                  >
                    {formData.instantBook ? 'Confirm Booking' : 'Request Booking'}
                  </button>
                )}  
              </div>
            </div>

            {/* Right: Helper Card */}
            <div style={{
              position: 'sticky',
              top: '100px',
              height: 'fit-content'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <img
                    src={helper.avatar_url || `https://i.pravatar.cc/150?img=${helper.id?.slice(-1)}`}
                    alt={helper.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                      {helper.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{helper.rating}</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        ({helper.total_reviews} reviews)
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#10b981' }}>
                      ${helper.hourly_rate}/hr
                    </div>
                  </div>
                </div>

                {helper.instant_book && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Zap size={16} color="#10b981" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      Instant Booking Available
                    </span>
                  </div>
                )}

                {helper.background_check_status === 'approved' && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Shield size={16} color="#f59e0b" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      Background Check Verified
                    </span>
                  </div>
                )}

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Cancellation Policy
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
                    Free cancellation up to 24 hours before the booking. 50% refund for cancellations within 24 hours.
                  </p>
                </div>

                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Safety Guarantee
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
                    All helpers are vetted and insured. Your booking is protected by our satisfaction guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default BookingFlow;
