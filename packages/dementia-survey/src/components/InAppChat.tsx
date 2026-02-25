import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Image, Paperclip, Smile, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  helper_id: string;
  helper_name: string;
  helper_image?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface InAppChatProps {
  conversationId?: string;
  helperId?: string;
  helperName?: string;
  onClose?: () => void;
}

const InAppChat: React.FC<InAppChatProps> = ({
  conversationId,
  helperId,
  helperName,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await authClient.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const messagesData = data?.map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        sender_name: m.sender_name,
        content: m.content,
        timestamp: m.timestamp,
        read: m.read || false,
        type: m.type || 'text'
      })) || [];

      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(generateSampleMessages());
    }
  };

  const generateSampleMessages = (): Message[] => {
    const now = new Date();
    return [
      {
        id: '1',
        sender_id: helperId || 'helper_1',
        sender_name: helperName || 'Helper',
        content: "Hi! Thanks for reaching out. I'd be happy to help you!",
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        read: true,
        type: 'text'
      },
      {
        id: '2',
        sender_id: currentUserId,
        sender_name: 'You',
        content: 'Great! I need help with organizing my home.',
        timestamp: new Date(now.getTime() - 3000000).toISOString(),
        read: true,
        type: 'text'
      },
      {
        id: '3',
        sender_id: helperId || 'helper_1',
        sender_name: helperName || 'Helper',
        content: "That sounds perfect! I have experience with home organization. When would you like to schedule?",
        timestamp: new Date(now.getTime() - 1800000).toISOString(),
        read: true,
        type: 'text'
      }
    ];
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      const message: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        sender_name: 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      };

      await supabase.from('hfh_messages').insert({
        conversation_id: conversationId,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        content: message.content,
        timestamp: message.timestamp,
        read: message.read,
        type: message.type
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'white'
      }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#6b7280" />
          </button>
        )}
        
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          {helperName?.[0] || '👤'}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '2px'
          }}>
            {helperName || 'Helper'}
          </h3>
          <div style={{
            fontSize: '13px',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }} />
            Active now
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Phone size={18} color="#6b7280" />
          </button>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Video size={18} color="#6b7280" />
          </button>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MoreVertical size={18} color="#6b7280" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f9fafb'
      }}>
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}
            >
              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: isOwn ? '#10b981' : 'white',
                  color: isOwn ? 'white' : '#111827',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  boxShadow: isOwn ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}>
                  {message.content}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {isOwn && (
                    message.read ? (
                      <CheckCheck size={14} color="#10b981" />
                    ) : (
                      <Check size={14} color="#9ca3af" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image size={18} color="#6b7280" />
          </button>
          
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '24px',
            padding: '8px 16px'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}>
              <Smile size={18} color="#6b7280" />
            </button>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}>
              <Paperclip size={18} color="#6b7280" />
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: newMessage.trim() ? '#10b981' : '#e5e7eb',
              border: 'none',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
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

export default InAppChat;
