import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle, Upload, X } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import { createReview } from '../lib/humansForHireService';
import toast from 'react-hot-toast';
import UnifiedLayout from '../components/UnifiedLayout';

const ReviewSubmission: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [helper, setHelper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [ratings, setRatings] = useState({
    overall: 0,
    professionalism: 0,
    communication: 0,
    punctuality: 0,
    quality: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [hoveredRating, setHoveredRating] = useState<{category: string, value: number} | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        navigate('/humans-for-hire/auth');
        return;
      }

      // Get booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('hfh_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError || !bookingData) {
        toast.error('Booking not found');
        navigate('/humans-for-hire/client/dashboard');
        return;
      }

      setBooking(bookingData);

      // Get helper details
      const { data: helperData } = await supabase
        .from('hfh_helpers')
        .select('*')
        .eq('id', bookingData.helper_id)
        .single();

      if (helperData) {
        setHelper(helperData);
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    setPhotos(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratings.overall === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    if (reviewText.trim().length < 20) {
      toast.error('Review must be at least 20 characters');
      return;
    }

    try {
      setSubmitting(true);

      await createReview({
        booking_id: bookingId!,
        helper_id: booking.helper_id,
        client_id: booking.client_id,
        rating: ratings.overall,
        review_text: reviewText,
        professionalism_rating: ratings.professionalism,
        communication_rating: ratings.communication,
        punctuality_rating: ratings.punctuality,
        quality_rating: ratings.quality
      });

      setSubmitted(true);
      toast.success('Review submitted successfully!');
      
      setTimeout(() => {
        navigate('/humans-for-hire/client/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <UnifiedLayout>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading...</p>
        </div>
      </UnifiedLayout>
    );
  }

  if (submitted) {
    return (
      <UnifiedLayout>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'white', 
              border: '3px solid #10b981',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Thank You!</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
              Your review has been submitted successfully. It helps our community make better decisions.
            </p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  const RatingStars = ({ category, value, label }: { category: keyof typeof ratings, value: number, label: string }) => (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(star => {
          const isHovered = hoveredRating?.category === category && hoveredRating.value >= star;
          const isSelected = value >= star;
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(category, star)}
              onMouseEnter={() => setHoveredRating({ category, value: star })}
              onMouseLeave={() => setHoveredRating(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Star
                size={32}
                fill={(isSelected || isHovered) ? '#fbbf24' : 'none'}
                color={(isSelected || isHovered) ? '#fbbf24' : '#d1d5db'}
                style={{ transition: 'all 0.2s' }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <button
            onClick={() => navigate('/humans-for-hire/client/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '24px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', border: '1px solid #e5e7eb' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
              Review Your Experience
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
              Share your experience with {helper?.name} to help future clients
            </p>

            {/* Booking Summary */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '12px', 
              marginBottom: '32px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>Booking Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Service:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600, color: '#374151' }}>{booking?.service_type}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Date:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600, color: '#374151' }}>
                    {new Date(booking?.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Duration:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600, color: '#374151' }}>{booking?.duration_hours} hours</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Amount:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600, color: '#374151' }}>${booking?.total_amount}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Overall Rating */}
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '2px solid #f3f4f6' }}>
                <RatingStars category="overall" value={ratings.overall} label="Overall Rating *" />
              </div>

              {/* Detailed Ratings */}
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>
                Detailed Ratings
              </h3>
              
              <RatingStars category="professionalism" value={ratings.professionalism} label="Professionalism" />
              <RatingStars category="communication" value={ratings.communication} label="Communication" />
              <RatingStars category="punctuality" value={ratings.punctuality} label="Punctuality" />
              <RatingStars category="quality" value={ratings.quality} label="Quality of Service" />

              {/* Written Review */}
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '2px solid #f3f4f6' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
                  Your Review * (minimum 20 characters)
                </label>
                <textarea
                  required
                  minLength={20}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about your experience with this helper..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    lineHeight: 1.6
                  }}
                />
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                  {reviewText.length} characters
                </p>
              </div>

              {/* Photo Upload */}
              <div style={{ marginTop: '32px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
                  Add Photos (Optional)
                </label>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Share photos from your experience (max 5 photos)</p>
                
                {photoPreviews.length < 5 && (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}>
                    <Upload size={32} color="#10b981" style={{ marginBottom: '12px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Click to upload photos</span>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>PNG, JPG up to 10MB each</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}

                {photoPreviews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingTop: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
                        >
                          <X size={16} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  marginTop: '32px',
                  opacity: submitting ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default ReviewSubmission;
