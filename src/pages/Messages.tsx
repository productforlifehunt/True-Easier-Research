import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { supabase, authClient as publicClient } from '../lib/supabase';
import { authClient } from '../lib/supabase';
import UnifiedLayout from '../components/UnifiedLayout';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  client_id: string;
  helper_id: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  client_name?: string;
  helper_name?: string;
  client_avatar?: string;
  helper_avatar?: string;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'client' | 'helper' | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await authClient.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // Check if user is client or helper
      const [clientResult, helperResult] = await Promise.all([
        supabase.from('hfh_clients').select('id').eq('user_id', user.id).single(),
        supabase.from('hfh_helpers').select('id').eq('user_id', user.id).single()
      ]);

      if (clientResult.data) {
        setUserType('client');
        await loadConversationsForClient(clientResult.data.id);
      } else if (helperResult.data) {
        setUserType('helper');
        await loadConversationsForHelper(helperResult.data.id);
      } else {
        // No profile found, create demo conversations for testing
        setUserType('client');
        setConversations([
          {
            id: '1',
            client_id: 'demo-client',
            helper_id: 'helper1',
            last_message: 'Hi! I can help you with errands this weekend.',
            last_message_time: new Date().toISOString(),
            unread_count: 2,
            helper_name: 'Sarah Thompson',
            helper_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
          },
          {
            id: '2',
            client_id: 'demo-client',
            helper_id: 'helper2',
            last_message: 'Your booking is confirmed for tomorrow.',
            last_message_time: new Date(Date.now() - 3600000).toISOString(),
            unread_count: 0,
            helper_name: 'Michael Chen',
            helper_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadConversationsForClient = async (clientId: string) => {
    try {
      // Use supabase client with care_connector schema
      const { data, error } = await supabase
        .from('hfh_conversations')
        .select('*')
        .eq('client_id', clientId)
        .order('last_message_time', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        // Return demo data if no conversations found
        setConversations([
          {
            id: '1',
            client_id: clientId,
            helper_id: 'helper1',
            last_message: 'Hi! I can help you with errands this weekend.',
            last_message_time: new Date().toISOString(),
            unread_count: 2,
            helper_name: 'Sarah Thompson',
            helper_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
          }
        ]);
        return;
      }
      
      // Load helper details for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: helperData } = await supabase
            .from('hfh_helpers')
            .select('name, profile_image_url')
            .eq('id', conv.helper_id)
            .single();
          
          return {
            ...conv,
            helper_name: helperData?.name || 'Unknown Helper',
            helper_avatar: helperData?.profile_image_url
          };
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversationsForHelper = async (helperId: string) => {
    try {
      // Use supabase client with care_connector schema
      const { data, error } = await supabase
        .from('hfh_conversations')
        .select('*')
        .eq('helper_id', helperId)
        .order('last_message_time', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }
      
      // Load client details for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: clientData } = await supabase
            .from('hfh_clients')
            .select('name')
            .eq('id', conv.client_id)
            .single();
          
          return {
            ...conv,
            client_name: clientData?.name || 'Unknown Client'
          };
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Load messages for the conversation
      const { data: messagesData, error } = await supabase
        .from('hfh_messages')
        .select('*')
        .or(`sender_id.eq.${selectedConversation.client_id},sender_id.eq.${selectedConversation.helper_id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);

      // Mark messages as read
      await publicClient
        .from('hfh_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Use publicClient for public schema tables
      const { error } = await publicClient.from('hfh_messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
        read: false
      });

      if (error) throw error;

      // Update conversation last message
      await publicClient
        .from('hfh_conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_time: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      await loadMessages(selectedConversation.id);
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const name = userType === 'client' ? conv.helper_name : conv.client_name;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <UnifiedLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading messages...</div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div style={{ 
        display: 'flex',
        height: 'calc(100vh - 60px)',
        backgroundColor: 'white',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex',
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.08)',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            
            {/* macOS Style Sidebar */}
            <div style={{ 
              width: '320px',
              backgroundColor: 'white',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ 
                padding: '20px 20px 16px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <h1 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  marginBottom: '12px', 
                  color: '#1d1d1f',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>Messages</h1>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#86868b' 
                  }} />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                    }}
                  />
                </div>
              </div>

              {/* Conversations */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <MessageCircle size={48} color="#e5e7eb" style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '14px', color: '#86868b' }}>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map(conv => {
                    const name = userType === 'client' ? conv.helper_name : conv.client_name;
                    const isSelected = selectedConversation?.id === conv.id;
                    
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setSelectedConversation(conv);
                          loadMessages(conv.id);
                        }}
                        style={{
                          padding: '12px 16px',
                          margin: '0 8px 2px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f0fdf4' : 'white',
                          borderRadius: '8px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)')}
                        onMouseOut={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'white',
                            flexShrink: 0
                          }}>
                            {name?.charAt(0) || '?'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <h3 style={{ 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                color: '#1d1d1f', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                              }}>
                                {name || 'Unknown'}
                              </h3>
                              <span style={{ fontSize: '11px', color: '#86868b', flexShrink: 0, marginLeft: '8px' }}>
                                {new Date(conv.last_message_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#86868b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.last_message || 'No messages yet'}
                            </p>
                          </div>
                          {conv.unread_count > 0 && (
                            <div style={{
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
                              padding: '0 6px'
                            }}>
                              {conv.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Messages Area */}
            {selectedConversation ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                {/* macOS Style Chat Header */}
                <div style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'white'
                    }}>
                      {(userType === 'client' ? selectedConversation.helper_name : selectedConversation.client_name)?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h2 style={{ 
                        fontSize: '15px', 
                        fontWeight: 600, 
                        color: '#1d1d1f',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                      }}>
                        {userType === 'client' ? selectedConversation.helper_name : selectedConversation.client_name}
                      </h2>
                      <p style={{ fontSize: '12px', color: '#86868b' }}>Active now</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ 
                      width: '32px',
                      height: '32px',
                      border: 'none', 
                      backgroundColor: 'white', 
                      borderRadius: '50%', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <Phone size={18} color="#86868b" />
                    </button>
                    <button style={{ 
                      width: '32px',
                      height: '32px',
                      border: 'none', 
                      backgroundColor: 'white', 
                      borderRadius: '50%', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <Video size={18} color="#86868b" />
                    </button>
                    <button style={{ 
                      width: '32px',
                      height: '32px',
                      border: 'none', 
                      backgroundColor: 'white', 
                      borderRadius: '50%', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <MoreVertical size={18} color="#86868b" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: 'white', overflowX: 'hidden' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                      <p>Start a conversation</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {messages.map((message) => {
                        const isSender = message.sender_id === currentUserId;
                        return (
                          <div key={message.id} style={{ display: 'flex', justifyContent: isSender ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '60%',
                              padding: '12px 16px',
                              borderRadius: '16px',
                              backgroundColor: isSender ? '#10b981' : 'white',
                              color: isSender ? 'white' : '#111827',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                              <p style={{ fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{message.content}</p>
                              <p style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7, margin: 0 }}>
                                {new Date(message.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.06)', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <button style={{ 
                      width: '36px',
                      height: '36px',
                      border: 'none', 
                      backgroundColor: 'white', 
                      borderRadius: '50%', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <Paperclip size={18} color="#86868b" />
                    </button>
                    <button style={{ 
                      width: '36px',
                      height: '36px',
                      border: 'none', 
                      backgroundColor: 'white', 
                      borderRadius: '50%', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <ImageIcon size={18} color="#86868b" />
                    </button>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Message"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        backgroundColor: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '20px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                        minHeight: '40px',
                        maxHeight: '120px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: newMessage.trim() ? '#10b981' : 'white',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                      onMouseOver={(e) => newMessage.trim() && (e.currentTarget.style.backgroundColor = '#059669')}
                      onMouseOut={(e) => newMessage.trim() && (e.currentTarget.style.backgroundColor = '#10b981')}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'white', flex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <MessageCircle size={64} color="#e5e7eb" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    marginBottom: '8px', 
                    color: '#1d1d1f',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                  }}>Select a conversation</h3>
                  <p style={{ color: '#86868b', fontSize: '14px' }}>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default Messages;
