import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface MessageModalProps {
  helper: any;
  onClose: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: Date;
  read: boolean;
  sender_name?: string;
  sender_type: 'client' | 'helper';
}

const MessageModal: React.FC<MessageModalProps> = ({ helper, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [helper.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Query messages between current user and helper
      const { data, error } = await supabase
        .from('hfh_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${helper.id}),and(sender_id.eq.${helper.id},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform messages for display
      const transformedMessages = data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        read: msg.read || false,
        sender_type: (msg.sender_id === user.id ? 'client' : 'helper') as 'client' | 'helper',
        sender_name: msg.sender_id === user.id ? 'You' : helper.name
      }));

      setMessages(transformedMessages);
      setLoading(false);

      // Mark messages as read
      if (data && data.length > 0) {
        await supabase
          .from('hfh_messages')
          .update({ read: true })
          .eq('recipient_id', user.id)
          .eq('sender_id', helper.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to send messages');
        return;
      }

      // Check if client profile exists
      let { data: clientProfile } = await supabase
        .from('hfh_clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create client profile if doesn't exist
      if (!clientProfile) {
        const { data: newClient } = await supabase
          .from('hfh_clients')
          .insert([{
            user_id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email,
            location: 'Not specified'
          }])
          .select()
          .single();
        clientProfile = newClient;
      }

      // Send message
      const { error } = await supabase
        .from('hfh_messages')
        .insert([{
          sender_id: user.id,
          recipient_id: helper.id,
          client_id: clientProfile.id,
          helper_id: helper.id,
          content: newMessage,
          read: false
        }]);

      if (error) throw error;

      // Add optimistic message to UI
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        content: newMessage,
        timestamp: new Date(),
        read: false,
        sender_type: 'client',
        sender_name: 'You'
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        height: '80vh',
        maxHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={helper.profile_image_url || `https://ui-avatars.com/api/?name=${helper.name}&background=10b981&color=fff`}
              alt={helper.name}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                margin: 0
              }}>
                {helper.name}
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                {helper.services?.[0] || 'Helper'} • ${helper.hourly_rate}/hour
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Voice Call"
            >
              <Phone size={18} color="#6b7280" />
            </button>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Video Call"
            >
              <Video size={18} color="#6b7280" />
            </button>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} color="#6b7280" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: '#f9fafb'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6b7280'
            }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>No messages yet</p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.sender_type === 'client' ? 'flex-end' : 'flex-start',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: message.sender_type === 'client' ? '#10b981' : 'white',
                    color: message.sender_type === 'client' ? 'white' : '#374151',
                    boxShadow: message.sender_type === 'helper' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {message.content}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        opacity: 0.8
                      }}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender_type === 'client' && (
                        message.read ? <CheckCheck size={12} /> : <Check size={12} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <button
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Attach file"
          >
            <Paperclip size={18} color="#6b7280" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: newMessage.trim() && !sending ? '#10b981' : '#e5e7eb',
              border: 'none',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
