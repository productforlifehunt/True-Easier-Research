import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image as ImageIcon, Smile, Phone, Video, MoreVertical, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
  is_helper: boolean;
}

interface MessagingSystemProps {
  currentUserId: string;
  onClose?: () => void;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ currentUserId, onClose }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations (in real app, fetch from database)
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      // Load real conversations from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConversations([]);
        return;
      }

      const { data: convData, error } = await supabase
        .from('hfh_conversations')
        .select(`
          *,
          messages:hfh_messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
        return;
      }

      // Transform to conversation format
      const formattedConversations = (convData || []).map(conv => {
        const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        const lastMsg = conv.messages?.[0];
        
        return {
          id: conv.id,
          other_user_id: otherId,
          other_user_name: conv.user1_id === user.id ? conv.user2_name : conv.user1_name,
          other_user_avatar: undefined,
          last_message: lastMsg?.content || 'Start a conversation',
          last_message_time: new Date(lastMsg?.created_at || conv.created_at),
          unread_count: conv.unread_count || 0,
          is_helper: conv.user1_id === user.id ? conv.user2_is_helper : conv.user1_is_helper
        };
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error:', error);
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data: msgData, error } = await supabase
        .from('hfh_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
        return;
      }

      const formattedMessages = (msgData || []).map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        sender_name: msg.sender_id === currentUserId ? 'You' : selectedConversation?.other_user_name || 'User',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        read: msg.read || false,
        attachments: msg.attachments || []
      }));

      setMessages(formattedMessages);
    
      // Mark as read
      if (selectedConversation) {
        setConversations(conversations.map(conv => 
          conv.id === selectedConversation.id ? { ...conv, unread_count: 0 } : conv
        ));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      sender_name: 'You',
      content: messageInput,
      timestamp: new Date(),
      read: false
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    // Update conversation preview
    setConversations(conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, last_message: messageInput, last_message_time: new Date() }
        : conv
    ));

    toast.success('Message sent!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1200px',
        height: '80vh',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Conversations List */}
        <div style={{
          width: '360px',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                Messages
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} color="#6b7280" />
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <Search size={18} color="#6b7280" style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
            </div>
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conv.id ? '#f0fdf4' : 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {conv.other_user_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#111827'
                      }}>
                        {conv.other_user_name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {format(conv.last_message_time, 'h:mm a')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{
                        fontSize: '14px',
                        color: conv.unread_count > 0 ? '#374151' : '#6b7280',
                        fontWeight: conv.unread_count > 0 ? 600 : 400,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span style={{
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '10px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 6px',
                          marginLeft: '8px'
                        }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600
                }}>
                  {selectedConversation.other_user_name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {selectedConversation.other_user_name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {selectedConversation.is_helper ? 'Helper' : 'Client'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
              padding: '24px',
              overflow: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {messages.map((message, index) => {
                const isOwn = message.sender_id === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                
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
                      gap: '8px',
                      alignItems: 'flex-end'
                    }}>
                      {!isOwn && showAvatar && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {message.sender_name.charAt(0)}
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div style={{ width: '32px' }} />}
                      
                      <div>
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          backgroundColor: isOwn ? '#10b981' : 'white',
                          color: isOwn ? 'white' : '#111827',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}>
                          {message.content}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginTop: '4px',
                          textAlign: isOwn ? 'right' : 'left'
                        }}>
                          {format(message.timestamp, 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Paperclip size={18} color="#6b7280" />
                </button>
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ImageIcon size={18} color="#6b7280" />
                </button>
                
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    minHeight: '44px',
                    maxHeight: '120px',
                    fontFamily: 'inherit'
                  }}
                  rows={1}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: messageInput.trim() ? '#10b981' : '#e5e7eb',
                    border: 'none',
                    cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} color={messageInput.trim() ? 'white' : '#9ca3af'} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Select a conversation
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
