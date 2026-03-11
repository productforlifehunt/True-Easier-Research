import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

const ConversationView: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserEmail, setOtherUserEmail] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  }, [conversationId]);

  const fetchConversation = useCallback(async () => {
    if (!conversationId || !user) return;
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();
    if (data) {
      const otherId = data.researcher_user_id === user.id ? data.participant_user_id : data.researcher_user_id;
      // Try to get the other user's email from profile
      const { data: profile } = await supabase
        .from('profile')
        .select('email, full_name')
        .eq('user_id', otherId)
        .maybeSingle();
      setOtherUserEmail(profile?.full_name || profile?.email || 'User');
    }
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
    fetchConversation();
  }, [fetchMessages, fetchConversation]);

  // Mark messages as read
  useEffect(() => {
    if (!user || !conversationId || messages.length === 0) return;
    const unread = messages.filter(m => m.sender_id !== user.id && !m.read_at);
    if (unread.length > 0) {
      supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unread.map(m => m.id))
        .then(() => {
          setMessages(prev => prev.map(m =>
            unread.find(u => u.id === m.id) ? { ...m, read_at: new Date().toISOString() } : m
          ));
        });
    }
  }, [messages, user, conversationId]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'care_connector',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !conversationId || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
      });
      if (error) throw error;

      // Update conversation last_message_at
      await supabase.from('conversations').update({
        last_message_at: new Date().toISOString(),
        last_message_preview: newMessage.trim().slice(0, 100),
      }).eq('id', conversationId);

      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const date = new Date(msg.created_at).toDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-56px-56px)] lg:h-[calc(100vh-56px)] max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => navigate('/easyresearch/inbox')} className="p-1 rounded-lg hover:bg-stone-100 transition-colors">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{otherUserEmail[0]?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">{otherUserEmail}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex justify-center mb-3">
              <span className="text-[11px] text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                {formatDate(group.messages[0].created_at)}
              </span>
            </div>
            <div className="space-y-1.5">
              {group.messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-emerald-500 text-white rounded-br-md'
                          : 'bg-stone-100 text-stone-800 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200' : 'text-stone-400'} text-right`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-stone-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-stone-100 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all max-h-32"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
