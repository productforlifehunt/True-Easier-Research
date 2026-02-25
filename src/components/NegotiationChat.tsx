import React, { useState, useEffect, useRef } from 'react';
import { Send, DollarSign, Clock, Check, X } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface NegotiationChatProps {
  helperId: string;
  helperName: string;
  helperRate: number;
  clientId: string;
  onClose: () => void;
  onAcceptOffer: (offer: any) => void;
}

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'client' | 'helper';
  content: string;
  offer_details?: {
    hourly_rate: number;
    hours: number;
    total: number;
    status: 'pending' | 'accepted' | 'rejected';
  };
  created_at: string;
}

const NegotiationChat: React.FC<NegotiationChatProps> = ({
  helperId,
  helperName,
  helperRate,
  clientId,
  onClose,
  onAcceptOffer
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState(helperRate);
  const [offerHours, setOfferHours] = useState(1);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Subscribe to real-time messages
    const subscription = supabase
      .channel(`negotiation-${helperId}-${clientId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'hfh_negotiations',
          filter: `helper_id=eq.${helperId},client_id=eq.${clientId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [helperId, clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_negotiations')
        .select('*')
        .or(`helper_id.eq.${helperId},client_id.eq.${clientId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('hfh_negotiations')
        .insert([{
          helper_id: helperId,
          client_id: clientId,
          sender_id: user.id,
          sender_role: 'client',
          content: newMessage
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const sendOffer = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      const offerDetails = {
        hourly_rate: offerAmount,
        hours: offerHours,
        total: offerAmount * offerHours,
        status: 'pending'
      };

      const { error } = await supabase
        .from('hfh_negotiations')
        .insert([{
          helper_id: helperId,
          client_id: clientId,
          sender_id: user.id,
          sender_role: 'client',
          content: `Offer: $${offerAmount}/hr for ${offerHours} hours (Total: $${offerAmount * offerHours})`,
          offer_details: offerDetails
        }]);

      if (error) throw error;
      setShowOfferForm(false);
      toast.success('Offer sent!');
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error('Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      width: '380px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Negotiate with {helperName}
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Standard rate: ${helperRate}/hr
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px'
          }}
        >
          <X size={18} color="#6b7280" />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender_role === 'client' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '10px 14px',
              backgroundColor: message.sender_role === 'client' ? '#10b981' : '#f3f4f6',
              color: message.sender_role === 'client' ? 'white' : '#374151',
              borderRadius: '12px',
              fontSize: '14px'
            }}>
              {message.offer_details ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <DollarSign size={14} />
                    <span style={{ fontWeight: 600 }}>Offer</span>
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    ${message.offer_details.hourly_rate}/hr × {message.offer_details.hours}hrs
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>
                    Total: ${message.offer_details.total}
                  </div>
                  {message.offer_details.status === 'pending' && message.sender_role === 'helper' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => onAcceptOffer(message.offer_details)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: 'white',
                          color: '#10b981',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Accept
                      </button>
                      <button
                        style={{
                          padding: '4px 12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Counter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>{message.content}</div>
              )}
              <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.8 }}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Offer Form */}
      {showOfferForm && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                Rate/hr
              </label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                Hours
              </label>
              <input
                type="number"
                value={offerHours}
                onChange={(e) => setOfferHours(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Total: ${offerAmount * offerHours}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowOfferForm(false)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendOffer}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setShowOfferForm(!showOfferForm)}
          style={{
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #10b981',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Make an offer"
        >
          <DollarSign size={18} color="#10b981" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          style={{
            padding: '8px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading || !newMessage.trim() ? 0.5 : 1
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default NegotiationChat;
