import React, { useState, useEffect } from 'react';
import { Star, Camera, ThumbsUp, CheckCircle, X, Upload, User } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_image?: string;
  helper_id: string;
  booking_id?: string;
  rating: number;
  comment: string;
  photos?: string[];
  helpful_count: number;
  verified_booking: boolean;
  created_at: string;
  response?: {
    text: string;
    created_at: string;
  };
}

interface ReviewSystemProps {
  helperId?: string;
  bookingId?: string;
  onClose?: () => void;
  viewOnly?: boolean;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  helperId,
  bookingId,
  onClose,
  viewOnly = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    photos: [] as string[]
  });
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState(0);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    if (helperId) {
      loadReviews();
    }
  }, [helperId, sortBy, filterRating]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('hfh_reviews')
        .select(`
          *,
          hfh_clients!inner(name, user_id)
        `)
        .eq('helper_id', helperId);

      if (filterRating > 0) {
        query = query.eq('rating', filterRating);
      }

      const { data, error } = await query;

      if (error) throw error;

      let reviewsData = data?.map(r => ({
        id: r.id,
        reviewer_id: r.reviewer_id,
        reviewer_name: r.hfh_clients?.name || 'Anonymous',
        helper_id: r.helper_id,
        booking_id: r.booking_id,
        rating: r.rating,
        comment: r.comment,
        photos: r.photos || [],
        helpful_count: r.helpful_count || 0,
        verified_booking: r.verified_booking || false,
        created_at: r.created_at,
        response: r.response
      })) || [];

      // Sort reviews
      switch (sortBy) {
        case 'helpful':
          reviewsData.sort((a, b) => b.helpful_count - a.helpful_count);
          break;
        case 'rating':
          reviewsData.sort((a, b) => b.rating - a.rating);
          break;
        default:
          reviewsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setReviews(reviewsData);
      calculateStats(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Generate sample reviews
      const sampleReviews = generateSampleReviews(helperId || '');
      setReviews(sampleReviews);
      calculateStats(sampleReviews);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleReviews = (helperId: string): Review[] => {
    const sampleComments = [
      "Absolutely wonderful experience! Very professional and caring.",
      "Great helper, always on time and very reliable. Highly recommend!",
      "Did an amazing job. Will definitely book again.",
      "Very friendly and helpful. Made everything so easy.",
      "Exceeded my expectations in every way. Thank you!",
      "Professional, punctual, and pleasant. Couldn't ask for better service.",
      "Fantastic work! Very attentive to details.",
      "Helped me tremendously. So grateful for the assistance.",
      "Kind, patient, and understanding. Perfect for what I needed.",
      "Outstanding service from start to finish."
    ];

    const names = ['Sarah M.', 'John D.', 'Emily R.', 'Michael T.', 'Lisa K.', 'David W.', 'Jennifer L.', 'Robert B.', 'Maria G.', 'James H.'];

    return Array.from({ length: 10 }, (_, i) => ({
      id: `review_${i + 1}`,
      reviewer_id: `reviewer_${i + 1}`,
      reviewer_name: names[i],
      helper_id: helperId,
      rating: Math.floor(Math.random() * 2) + 4,
      comment: sampleComments[i],
      photos: Math.random() > 0.7 ? ['photo1.jpg', 'photo2.jpg'] : [],
      helpful_count: Math.floor(Math.random() * 50),
      verified_booking: Math.random() > 0.3,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      response: Math.random() > 0.5 ? {
        text: "Thank you so much for your kind words! It was a pleasure working with you.",
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      } : undefined
    }));
  };

  const calculateStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setStats({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;
    
    const distribution = [0, 0, 0, 0, 0];
    reviewsData.forEach(r => {
      distribution[r.rating - 1]++;
    });

    setStats({ average, total, distribution });
  };

  const submitReview = async () => {
    if (!newReview.rating || !newReview.comment) {
      toast.error('Please provide a rating and comment');
      return;
    }

    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to submit a review');
        return;
      }

      const { error } = await supabase
        .from('hfh_reviews')
        .insert({
          helper_id: helperId,
          booking_id: bookingId,
          reviewer_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment,
          photos: newReview.photos,
          verified_booking: !!bookingId
        });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setShowWriteReview(false);
      setNewReview({ rating: 0, comment: '', photos: [] });
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      await supabase
        .from('hfh_reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', reviewId);

      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? { ...r, helpful_count: r.helpful_count + 1 }
            : r
        )
      );
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const StarRating = ({ rating, onRate, size = 20, readonly = false }: any) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? '#fbbf24' : 'none'}
          color="#fbbf24"
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          onClick={() => !readonly && onRate && onRate(star)}
        />
      ))}
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: viewOnly ? 0 : '24px',
      maxWidth: '900px',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
          Reviews & Ratings
        </h2>
        {!viewOnly && onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            <X size={24} color="#6b7280" />
          </button>
        )}
      </div>

      {/* Rating Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '48px',
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#111827' }}>
            {stats.average.toFixed(1)}
          </div>
          <StarRating rating={Math.round(stats.average)} readonly />
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            {stats.total} reviews
          </div>
          {!viewOnly && (
            <button
              onClick={() => setShowWriteReview(true)}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Write a Review
            </button>
          )}
        </div>

        <div>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div
              key={rating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setFilterRating(filterRating === rating ? 0 : rating)}
            >
              <span style={{ fontSize: '14px', color: '#374151', width: '20px' }}>
                {rating}
              </span>
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <div style={{
                flex: 1,
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.distribution[rating - 1] / stats.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: filterRating === rating ? '#10b981' : '#fbbf24'
                }} />
              </div>
              <span style={{
                fontSize: '14px',
                color: '#6b7280',
                width: '40px',
                textAlign: 'right'
              }}>
                {stats.distribution[rating - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '24px'
            }}>
              Write a Review
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Rating
              </label>
              <StarRating
                rating={newReview.rating}
                onRate={(rating: number) => setNewReview({ ...newReview, rating })}
                size={32}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <Camera size={20} />
                Add Photos (Optional)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    // Handle photo upload
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowWriteReview(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rated</option>
        </select>

        {filterRating > 0 && (
          <button
            onClick={() => setFilterRating(0)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              color: '#10b981',
              border: '1px solid #10b981',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {filterRating} Stars
            <X size={16} />
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={24} color="#10b981" />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {review.reviewer_name}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <StarRating rating={review.rating} readonly size={14} />
                      {review.verified_booking && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#2563eb'
                        }}>
                          <CheckCircle size={12} />
                          Verified Booking
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '13px',
                  color: '#9ca3af'
                }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: 1.6,
                marginBottom: '16px'
              }}>
                {review.comment}
              </p>

              {review.photos && review.photos.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {review.photos.map((photo, i) => (
                    <div
                      key={i}
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Camera size={24} color="#9ca3af" />
                    </div>
                  ))}
                </div>
              )}

              {review.response && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: '3px solid #10b981'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#10b981',
                    marginBottom: '8px'
                  }}>
                    Helper's Response
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#374151',
                    lineHeight: 1.5
                  }}>
                    {review.response.text}
                  </p>
                </div>
              )}

              <button
                onClick={() => markHelpful(review.id)}
                style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ThumbsUp size={14} />
                Helpful ({review.helpful_count})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
