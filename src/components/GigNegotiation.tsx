import React, { useState } from 'react';
import { DollarSign, Clock, Calendar, MessageSquare, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface GigNegotiationProps {
  helper: any;
  gigDetails: {
    service: string;
    description: string;
    estimatedHours: number;
    suggestedBudget: number;
    deadline: string;
    location: string;
  };
  onClose: () => void;
  onAccept: (finalTerms: any) => void;
}

const GigNegotiation: React.FC<GigNegotiationProps> = ({ helper, gigDetails, onClose, onAccept }) => {
  const [negotiationStep, setNegotiationStep] = useState<'initial' | 'counter' | 'final'>('initial');
  const [clientOffer, setClientOffer] = useState(gigDetails.suggestedBudget);
  const [helperCounter, setHelperCounter] = useState<number | null>(null);
  const [finalOffer, setFinalOffer] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [negotiationHistory, setNegotiationHistory] = useState<any[]>([]);
  const [estimatedHours, setEstimatedHours] = useState(gigDetails.estimatedHours);
  const [deadline, setDeadline] = useState(gigDetails.deadline);
  const [includesMaterials, setIncludesMaterials] = useState(false);
  const [rushFee, setRushFee] = useState(0);

  // Calculate suggested counteroffer based on market rates
  const generateHelperCounter = () => {
    const marketRate = helper.hourly_rate || 50;
    const minAcceptable = marketRate * estimatedHours * 0.9; // 10% below market
    const ideal = marketRate * estimatedHours * 1.15; // 15% above market
    
    if (clientOffer < minAcceptable) {
      return Math.round(minAcceptable);
    } else if (clientOffer < ideal) {
      return Math.round((clientOffer + ideal) / 2);
    }
    return null; // Client offer is already good
  };

  const handleInitialOffer = () => {
    const counter = generateHelperCounter();
    
    const historyItem = {
      type: 'client_offer',
      amount: clientOffer,
      hours: estimatedHours,
      message: message,
      timestamp: new Date()
    };
    
    setNegotiationHistory([...negotiationHistory, historyItem]);
    
    if (counter) {
      setHelperCounter(counter);
      setNegotiationStep('counter');
      
      const counterHistory = {
        type: 'helper_counter',
        amount: counter,
        hours: estimatedHours,
        message: `Based on my experience and the market rate for this service, I'd like to propose $${counter}.`,
        timestamp: new Date()
      };
      setNegotiationHistory(prev => [...prev, counterHistory]);
    } else {
      // Helper accepts immediately
      handleAcceptTerms(clientOffer);
    }
  };

  const handleCounterResponse = (accept: boolean) => {
    if (accept && helperCounter) {
      handleAcceptTerms(helperCounter);
    } else {
      setNegotiationStep('final');
    }
  };

  const handleFinalOffer = () => {
    if (!finalOffer) return;
    
    const historyItem = {
      type: 'final_offer',
      amount: finalOffer,
      hours: estimatedHours,
      message: message,
      timestamp: new Date()
    };
    
    setNegotiationHistory([...negotiationHistory, historyItem]);
    
    // In real app, this would go to helper for final decision
    // For now, we'll auto-accept if within reasonable range
    const marketRate = helper.hourly_rate || 50;
    const minAcceptable = marketRate * estimatedHours * 0.85;
    
    if (finalOffer >= minAcceptable) {
      handleAcceptTerms(finalOffer);
    } else {
      toast.error('Offer is below helper\'s minimum. Please increase your budget or choose a different helper.');
    }
  };

  const handleAcceptTerms = (agreedAmount: number) => {
    const finalTerms = {
      service: gigDetails.service,
      description: gigDetails.description,
      agreedAmount,
      estimatedHours,
      deadline,
      location: gigDetails.location,
      includesMaterials,
      rushFee,
      totalAmount: agreedAmount + rushFee,
      negotiationHistory
    };
    
    toast.success('Terms agreed! Proceeding to payment...');
    onAccept(finalTerms);
  };

  const calculateHourlyRate = (amount: number) => {
    return estimatedHours > 0 ? (amount / estimatedHours).toFixed(2) : '0.00';
  };

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Negotiate Terms with {helper.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {gigDetails.service}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Job Details Summary */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Job Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Service</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{gigDetails.service}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{gigDetails.location}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Estimated Hours</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{estimatedHours} hours</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deadline</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{deadline}</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Description</div>
              <div style={{ fontSize: '14px', color: '#374151' }}>{gigDetails.description}</div>
            </div>
          </div>

          {/* Helper's Market Rate Info */}
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #10b981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={18} color="#10b981" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Helper's Market Rate</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
              ${helper.hourly_rate}/hour
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Estimated total for this job: ${(helper.hourly_rate * estimatedHours).toFixed(2)}
            </div>
          </div>

          {/* Negotiation Steps */}
          {negotiationStep === 'initial' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Make Your Offer
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  <DollarSign size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Your Budget
                </label>
                <input
                  type="number"
                  value={clientOffer}
                  onChange={(e) => setClientOffer(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                />
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  = ${calculateHourlyRate(clientOffer)}/hour
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Add a Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your budget, timeline, or any special requirements..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Additional Options */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Additional Options
                </h4>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={includesMaterials}
                    onChange={(e) => setIncludesMaterials(e.target.checked)}
                  />
                  <span style={{ fontSize: '14px' }}>Helper provides materials/supplies</span>
                </label>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
                    Rush Fee (if needed urgently)
                  </label>
                  <select
                    value={rushFee}
                    onChange={(e) => setRushFee(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={0}>No rush fee</option>
                    <option value={clientOffer * 0.1}>10% rush fee (+${(clientOffer * 0.1).toFixed(2)})</option>
                    <option value={clientOffer * 0.25}>25% rush fee (+${(clientOffer * 0.25).toFixed(2)})</option>
                    <option value={clientOffer * 0.5}>50% rush fee (+${(clientOffer * 0.5).toFixed(2)})</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleInitialOffer}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Send Offer to {helper.name}
              </button>
            </div>
          )}

          {negotiationStep === 'counter' && helperCounter && (
            <div>
              <div style={{
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #f59e0b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <MessageSquare size={20} color="#f59e0b" />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    {helper.name}'s Counteroffer
                  </span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                  ${helperCounter.toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#92400e' }}>
                  = ${calculateHourlyRate(helperCounter)}/hour
                </div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fde68a' }}>
                  <p style={{ fontSize: '14px', color: '#374151', fontStyle: 'italic' }}>
                    "Based on my experience and the market rate for this service, I'd like to propose ${helperCounter}."
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Your Offer</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#6b7280' }}>${clientOffer}</div>
                  <TrendingDown size={16} color="#6b7280" style={{ marginTop: '4px' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Counter Offer</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#f59e0b' }}>${helperCounter}</div>
                  <TrendingUp size={16} color="#f59e0b" style={{ marginTop: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleCounterResponse(true)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle size={20} />
                  Accept ${helperCounter}
                </button>
                <button
                  onClick={() => handleCounterResponse(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <XCircle size={20} />
                  Make Final Offer
                </button>
              </div>
            </div>
          )}

          {negotiationStep === 'final' && (
            <div>
              <div style={{
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #fca5a5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    Final Offer - Make it count!
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                  This is your last chance to negotiate. The helper will make a final decision to accept or decline.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Your Final Offer
                </label>
                <input
                  type="number"
                  value={finalOffer || ''}
                  onChange={(e) => setFinalOffer(Number(e.target.value))}
                  placeholder="Enter your best and final offer"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                />
                {finalOffer && (
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    = ${calculateHourlyRate(finalOffer)}/hour
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Final Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why this is your best offer..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '80px'
                  }}
                />
              </div>

              <button
                onClick={handleFinalOffer}
                disabled={!finalOffer}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: finalOffer ? '#10b981' : '#e5e7eb',
                  color: finalOffer ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: finalOffer ? 'pointer' : 'not-allowed'
                }}
              >
                Submit Final Offer
              </button>
            </div>
          )}

          {/* Negotiation History */}
          {negotiationHistory.length > 0 && (
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Negotiation History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {negotiationHistory.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: item.type === 'client_offer' || item.type === 'final_offer' ? '#f9fafb' : '#fef3c7',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${item.type === 'client_offer' || item.type === 'final_offer' ? '#10b981' : '#f59e0b'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        {item.type === 'client_offer' ? 'Your Offer' : item.type === 'helper_counter' ? `${helper.name}'s Counter` : 'Your Final Offer'}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: item.type === 'client_offer' || item.type === 'final_offer' ? '#10b981' : '#f59e0b' }}>
                        ${item.amount}
                      </span>
                    </div>
                    {item.message && (
                      <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                        "{item.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigNegotiation;
