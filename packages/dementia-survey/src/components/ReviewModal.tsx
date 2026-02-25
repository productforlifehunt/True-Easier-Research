import React, { useState } from 'react';
import { X, Star, Camera, ThumbsUp, Award, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  helper: any;
  booking?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ helper, booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    punctuality: 5,
    professionalism: 5,
    communication: 5,
    quality: 5
  });
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to leave a review');
        return;
      }

      // Get client profile
      const { data: clientProfile } = await supabase
        .from('hfh_clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!clientProfile) {
        toast.error('Client profile not found');
        return;
      }

      // Submit review
      const { error: reviewError } = await supabase
        .from('hfh_reviews')
        .insert([{
          client_id: clientProfile.id,
          helper_id: helper.id,
          booking_id: booking?.id,
          rating: rating,
          review: review,
          punctuality_rating: categories.punctuality,
          professionalism_rating: categories.professionalism,
          communication_rating: categories.communication,
          quality_rating: categories.quality,
          would_recommend: wouldRecommend
        }]);

      if (reviewError) throw reviewError;

      // Update helper's average rating
      const { data: allReviews } = await supabase
        .from('hfh_reviews')
        .select('rating')
        .eq('helper_id', helper.id);

      if (allReviews) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await supabase
          .from('hfh_helpers')
          .update({ 
            rating: avgRating,
            total_reviews: allReviews.length
          })
          .eq('id', helper.id);
      }

      toast.success('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const CategoryRating = ({ label, icon: Icon, category }: { label: string; icon: any; category: keyof typeof categories }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Icon size={16} color="#10b981" />
          <span style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151'
          }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setCategories({ ...categories, [category]: value })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Star
                size={20}
                fill={value <= categories[category] ? '#fbbf24' : 'none'}
                color={value <= categories[category] ? '#fbbf24' : '#e5e7eb'}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              Rate Your Experience
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Help others by sharing your experience with {helper.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Overall Rating */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '12px'
            }}>
              Overall Experience
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <Star
                    size={36}
                    fill={value <= (hoveredRating || rating) ? '#fbbf24' : 'none'}
                    color={value <= (hoveredRating || rating) ? '#fbbf24' : '#e5e7eb'}
                  />
                </button>
              ))}
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '8px'
            }}>
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </p>
          </div>

          {/* Category Ratings */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <CategoryRating label="Punctuality" icon={Clock} category="punctuality" />
            <CategoryRating label="Professionalism" icon={Award} category="professionalism" />
            <CategoryRating label="Communication" icon={MessageSquare} category="communication" />
            <CategoryRating label="Quality of Service" icon={ThumbsUp} category="quality" />
          </div>

          {/* Written Review */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Tell us more about your experience
            </label>
            <textarea
              placeholder="What did you like? What could be improved? Your feedback helps others make informed decisions..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Minimum 50 characters ({review.length}/50)
            </p>
          </div>

          {/* Would Recommend */}
          <div style={{
            padding: '16px',
            backgroundColor: wouldRecommend ? '#ecfdf5' : '#fef2f2',
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${wouldRecommend ? '#10b981' : '#ef4444'}`
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                style={{
                  marginRight: '12px',
                  width: '20px',
                  height: '20px',
                  accentColor: '#10b981'
                }}
              />
              <span style={{
                fontSize: '15px',
                fontWeight: 500,
                color: wouldRecommend ? '#059669' : '#dc2626'
              }}>
                I would recommend {helper.name} to others
              </span>
            </label>
          </div>

          {/* Photo Upload Button */}
          <button
            style={{
              width: '100%',
              padding: '12px',
              border: '1px dashed #10b981',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#10b981',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}
          >
            <Camera size={18} />
            Add Photos (Optional)
          </button>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={loading || review.length < 50}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: loading || review.length < 50 ? '#e5e7eb' : '#10b981',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                cursor: loading || review.length < 50 ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
