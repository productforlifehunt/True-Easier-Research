/**
 * Collaboration & Comments Engine — Real-time commenting with @mentions
 * 协作与评论引擎 — 带 @提及的实时评论
 */
import React, { useState, useRef } from 'react';
import { MessageSquare, Send, Check, X, AtSign, Filter, Clock, User, CheckCircle2 } from 'lucide-react';

interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  target_type: 'question' | 'response' | 'project' | 'questionnaire';
  target_id: string;
  content: string;
  mentions: string[]; // user IDs mentioned / 被提及的用户ID
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  parent_id?: string; // For threaded replies / 线程回复
  created_at: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  avatar?: string;
  last_active?: string;
}

interface Props {
  projectId: string;
  currentUserId?: string;
  currentUserName?: string;
  collaborators?: Collaborator[];
  comments?: Comment[];
  onAddComment?: (comment: Omit<Comment, 'id' | 'created_at'>) => void;
  onResolveComment?: (commentId: string) => void;
}

const CollaborationEngine: React.FC<Props> = ({
  projectId,
  currentUserId = 'current-user',
  currentUserName = 'You',
  collaborators = [],
  comments: initialComments = [],
  onAddComment,
  onResolveComment,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'mentions'>('all');
  const [tab, setTab] = useState<'comments' | 'team' | 'activity'>('comments');
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Demo collaborators / 演示协作者
  const teamMembers: Collaborator[] = collaborators.length > 0 ? collaborators : [
    { id: 'user-1', name: 'Dr. Sarah Chen', email: 'sarah@research.edu', role: 'owner', last_active: new Date().toISOString() },
    { id: 'user-2', name: 'James Park', email: 'james@lab.edu', role: 'editor', last_active: new Date(Date.now() - 3600000).toISOString() },
    { id: 'user-3', name: 'Wei Li', email: 'wei@university.cn', role: 'commenter', last_active: new Date(Date.now() - 86400000).toISOString() },
  ];

  const filteredComments = comments.filter(c => {
    if (filter === 'open') return !c.is_resolved;
    if (filter === 'resolved') return c.is_resolved;
    if (filter === 'mentions') return c.mentions.includes(currentUserId);
    return true;
  });

  const addComment = () => {
    if (!newComment.trim()) return;
    // Extract @mentions / 提取 @提及
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const member = teamMembers.find(m => m.name.toLowerCase().includes(match[1].toLowerCase()));
      if (member) mentions.push(member.id);
    }

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author_id: currentUserId,
      author_name: currentUserName,
      target_type: 'project',
      target_id: projectId,
      content: newComment,
      mentions,
      is_resolved: false,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    onAddComment?.(comment);
  };

  const resolveComment = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, is_resolved: true, resolved_by: currentUserId, resolved_at: new Date().toISOString() } : c
    ));
    onResolveComment?.(id);
  };

  const insertMention = (name: string) => {
    setNewComment(prev => prev + `@${name.split(' ')[0]} `);
    setShowMentionPicker(false);
    inputRef.current?.focus();
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      case 'viewer': return 'bg-muted text-muted-foreground';
      case 'commenter': return 'bg-amber-100 text-amber-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'just now / 刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Collaboration / 协作</h2>
            <p className="text-sm text-muted-foreground">Comments, mentions, and team management / 评论、提及和团队管理</p>
          </div>
        </div>
        {/* Online indicator / 在线指示器 */}
        <div className="flex -space-x-2">
          {teamMembers.slice(0, 3).map(m => (
            <div key={m.id} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium text-primary" title={m.name}>
              {m.name.charAt(0)}
            </div>
          ))}
          {teamMembers.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
              +{teamMembers.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Tabs / 标签 */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['comments', 'team', 'activity'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'comments' && `Comments (${comments.length})`}
            {t === 'team' && `Team (${teamMembers.length})`}
            {t === 'activity' && 'Activity / 活动'}
          </button>
        ))}
      </div>

      {/* Comments Tab / 评论标签页 */}
      {tab === 'comments' && (
        <div className="space-y-4">
          {/* New Comment / 新评论 */}
          <div className="border border-border rounded-lg p-3 space-y-2">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment... Use @name to mention / 添加评论... 使用 @名字 来提及"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment(); }}
              />
              {showMentionPicker && (
                <div className="absolute bottom-full left-0 mb-1 bg-background border border-border rounded-lg shadow-lg p-2 z-10 min-w-48">
                  {teamMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => insertMention(m.name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">{m.name.charAt(0)}</div>
                      <span className="text-foreground">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setShowMentionPicker(!showMentionPicker)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <AtSign className="w-3 h-3" /> Mention / 提及
              </button>
              <button onClick={addComment} disabled={!newComment.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Send className="w-3 h-3" /> Send / 发送
              </button>
            </div>
          </div>

          {/* Filter / 筛选 */}
          <div className="flex gap-2">
            {(['all', 'open', 'resolved', 'mentions'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' && `All (${comments.length})`}
                {f === 'open' && `Open (${comments.filter(c => !c.is_resolved).length})`}
                {f === 'resolved' && `Resolved (${comments.filter(c => c.is_resolved).length})`}
                {f === 'mentions' && 'My Mentions / 我的提及'}
              </button>
            ))}
          </div>

          {/* Comment List / 评论列表 */}
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No comments yet / 暂无评论</p>
              </div>
            ) : (
              filteredComments.map(comment => (
                <div key={comment.id} className={`border rounded-lg p-4 transition-colors ${
                  comment.is_resolved ? 'border-border bg-muted/30' : 'border-border bg-background'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {comment.author_name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{timeAgo(comment.created_at)}</span>
                      </div>
                    </div>
                    {!comment.is_resolved && (
                      <button
                        onClick={() => resolveComment(comment.id)}
                        className="text-xs text-muted-foreground hover:text-emerald-600 flex items-center gap-1"
                        title="Mark resolved / 标记为已解决"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {comment.is_resolved && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Resolved / 已解决
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{comment.content}</p>
                  {comment.mentions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {comment.mentions.map(mid => {
                        const member = teamMembers.find(m => m.id === mid);
                        return member ? (
                          <span key={mid} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">@{member.name.split(' ')[0]}</span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Team Tab / 团队标签页 */}
      {tab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{teamMembers.length} team members / 位团队成员</span>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Invite / 邀请
            </button>
          </div>
          <div className="space-y-2">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor(member.role)}`}>{member.role}</span>
                  {member.last_active && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(member.last_active)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab / 活动标签页 */}
      {tab === 'activity' && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Activity feed shows real-time edits, comments, and team actions</p>
          <p className="text-xs mt-1">活动提要显示实时编辑、评论和团队操作</p>
        </div>
      )}
    </div>
  );
};

// Missing import fix
const Plus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
);

export default CollaborationEngine;
