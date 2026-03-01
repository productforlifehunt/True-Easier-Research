import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bell, ChevronRight, Circle, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

type Tab = 'messages' | 'notifications';

interface Conversation {
  id: string;
  project_id: string;
  participant_user_id: string;
  researcher_user_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  other_user_email?: string;
  project_title?: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

const InboxPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_user_id.eq.${user.id},researcher_user_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([fetchConversations(), fetchNotifications()]).finally(() => setLoading(false));
  }, [user, fetchConversations, fetchNotifications]);

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="text-emerald-500" />;
      default: return <Bell size={16} className="text-amber-500" />;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <MessageSquare size={48} className="text-stone-300 mb-4" />
        <p className="text-stone-500 text-sm">Sign in to view your inbox</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-stone-800 mb-4">{t('nav.inbox')}</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setTab('messages')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'messages' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'
          }`}
        >
          <MessageSquare size={16} />
          Messages
        </button>
        <button
          onClick={() => setTab('notifications')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'notifications' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'
          }`}
        >
          <Bell size={16} />
          Notifications
          {unreadNotifCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-stone-100 rounded-xl h-16" />
          ))}
        </div>
      ) : tab === 'messages' ? (
        /* Messages list */
        conversations.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <MessageSquare size={40} className="text-stone-200 mb-3" />
            <p className="text-stone-400 text-sm">No conversations yet</p>
            <p className="text-stone-300 text-xs mt-1">Messages from researchers and participants will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(conv => {
              const isResearcher = conv.researcher_user_id === user.id;
              const otherLabel = conv.other_user_email || (isResearcher ? 'Participant' : 'Researcher');
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/easyresearch/inbox/${conv.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">{otherLabel[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-800 truncate">{otherLabel}</span>
                      <span className="text-[11px] text-stone-400 flex-shrink-0 ml-2">{formatTime(conv.last_message_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-stone-400 truncate">{conv.last_message_preview || 'Start a conversation'}</p>
                      {conv.unread_count > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )
      ) : (
        /* Notifications list */
        <>
          {unreadNotifCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-emerald-600 font-medium mb-3 hover:underline"
            >
              Mark all as read
            </button>
          )}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Bell size={40} className="text-stone-200 mb-3" />
              <p className="text-stone-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) markNotificationRead(notif.id);
                    if (notif.reference_type === 'conversation' && notif.reference_id) {
                      navigate(`/easyresearch/inbox/${notif.reference_id}`);
                    }
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${
                    notif.is_read ? 'hover:bg-stone-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                  }`}
                >
                  <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${notif.is_read ? 'text-stone-600' : 'font-medium text-stone-800'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[11px] text-stone-400 flex-shrink-0 ml-2">{formatTime(notif.created_at)}</span>
                    </div>
                    {notif.body && <p className="text-xs text-stone-400 truncate mt-0.5">{notif.body}</p>}
                  </div>
                  {!notif.is_read && <Circle size={8} className="text-emerald-500 fill-emerald-500 flex-shrink-0 mt-1.5" />}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InboxPage;
