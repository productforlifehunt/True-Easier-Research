import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Image, Smile, Check, CheckCheck, X, MessageCircle } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';
import { authClient, supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  booking_id?: string;
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_type: 'helper' | 'client';
  last_message: string;
  last_message_time: string;
  unread_count: number;
  online: boolean;
}

const MessagingSystem: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkAuth();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
      markAsRead(selectedConversation.user_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time message subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'care_connector',
          table: 'hfh_messages',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (selectedConversation && newMessage.sender_id === selectedConversation.user_id) {
            setMessages(prev => [...prev, newMessage]);
            markAsRead(selectedConversation.user_id);
          }
          loadConversations(); // Refresh conversation list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedConversation]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        navigate('/humans-for-hire/auth');
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/humans-for-hire/auth');
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Get all messages involving current user
      const { data: messagesData } = await supabase
        .from('hfh_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser?.id},receiver_id.eq.${currentUser?.id}`)
        .order('created_at', { ascending: false });

      if (!messagesData) {
        setConversations([]);
        return;
      }

      // Group by conversation partner
      const conversationMap = new Map<string, any>();
      
      for (const msg of messagesData) {
        const partnerId = msg.sender_id === currentUser?.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(partnerId)) {
          // Get partner info
          const { data: helperData } = await supabase
            .from('hfh_helpers')
            .select('name, user_id')
            .eq('user_id', partnerId)
            .single();
            
          const { data: clientData } = await supabase
            .from('hfh_clients')
            .select('name, user_id')
            .eq('user_id', partnerId)
            .single();

          const partnerName = helperData?.name || clientData?.name || 'Unknown User';
          const userType = helperData ? 'helper' : 'client';

          conversationMap.set(partnerId, {
            user_id: partnerId,
            user_name: partnerName,
            user_type: userType,
            last_message: msg.message_text,
            last_message_time: msg.created_at,
            unread_count: 0,
            online: false // Online status determined by real-time presence
          });
        }
      }

      // Count unread messages
      for (const [partnerId, conv] of conversationMap) {
        const { count } = await supabase
          .from('hfh_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', partnerId)
          .eq('receiver_id', currentUser?.id)
          .eq('is_read', false);
        
        conv.unread_count = count || 0;
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      const { data } = await supabase
        .from('hfh_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (partnerId: string) => {
    try {
      await supabase
        .from('hfh_messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      const { data, error } = await supabase
        .from('hfh_messages')
        .insert([{
          sender_id: currentUser.id,
          receiver_id: selectedConversation.user_id,
          message_text: messageText.trim(),
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setMessageText('');
      loadConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '380px 1fr',
            gap: '24px',
            height: 'calc(100vh - 200px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* Conversations Sidebar */}
            <div style={{
              borderRight: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Sidebar Header */}
              <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
                  Messages
                </h2>
                
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No conversations yet
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.user_id}
                      onClick={() => setSelectedConversation(conv)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: 'none',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        borderLeft: selectedConversation?.user_id === conv.user_id ? '3px solid #10b981' : '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (selectedConversation?.user_id !== conv.user_id) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedConversation?.user_id !== conv.user_id) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: '2px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#10b981'
                          }}>
                            {conv.user_name.charAt(0)}
                          </div>
                          {conv.online && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#10b981',
                              border: '2px solid white',
                              borderRadius: '50%'
                            }} />
                          )}
                        </div>

                        {/* Conversation Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#111827'
                            }}>
                              {conv.user_name}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#9ca3af'
                            }}>
                              {formatMessageTime(conv.last_message_time)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '13px',
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '220px'
                            }}>
                              {conv.last_message}
                            </span>
                            {conv.unread_count > 0 && (
                              <div style={{
                                minWidth: '20px',
                                height: '20px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '0 6px'
                              }}>
                                {conv.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#10b981'
                      }}>
                        {selectedConversation.user_name.charAt(0)}
                      </div>
                      {selectedConversation.online && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#10b981',
                          border: '2px solid white',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        {selectedConversation.user_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {selectedConversation.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <Phone size={18} />
                    </button>
                    <button style={{
                      padding: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <Video size={18} />
                    </button>
                    <button style={{
                      padding: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  backgroundColor: 'white'
                }}>
                  {messages.map((msg, index) => {
                    const isOwn = msg.sender_id === currentUser.id;
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                    
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          marginBottom: '16px'
                        }}
                      >
                        {!isOwn && showAvatar && (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: '2px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#10b981',
                            marginRight: '12px',
                            flexShrink: 0
                          }}>
                            {selectedConversation.user_name.charAt(0)}
                          </div>
                        )}
                        {!isOwn && !showAvatar && <div style={{ width: '44px' }} />}
                        
                        <div style={{
                          maxWidth: '60%',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          backgroundColor: isOwn ? '#10b981' : 'white',
                          color: isOwn ? 'white' : '#374151',
                          fontSize: '14px',
                          lineHeight: 1.5,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}>
                          {msg.message_text}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                            fontSize: '11px',
                            color: isOwn ? 'rgba(255, 255, 255, 0.8)' : '#9ca3af'
                          }}>
                            {formatMessageTime(msg.created_at)}
                            {isOwn && (msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} style={{
                  padding: '20px 24px',
                  borderTop: '1px solid #f3f4f6',
                  backgroundColor: 'white'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <button
                      type="button"
                      style={{
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <Image size={20} />
                    </button>
                    
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '24px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#10b981';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    />

                    <button
                      type="button"
                      style={{
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <Smile size={20} />
                    </button>

                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: messageText.trim() ? '#10b981' : '#e5e7eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (messageText.trim()) {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (messageText.trim()) {
                          e.currentTarget.style.backgroundColor = '#10b981';
                        }
                      }}
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#9ca3af'
              }}>
                <MessageCircle size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Select a conversation
                </div>
                <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
                  Choose a conversation from the sidebar to start messaging
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default MessagingSystem;
