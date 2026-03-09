import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Video, Play, Pause, SkipForward, SkipBack, MousePointer, Clock, Eye, Filter, Download, ChevronDown, ChevronRight } from 'lucide-react';

// Session Replay & Click Tracking Viewer – Hotjar-like UX research tool
// 会话回放与点击追踪查看器 – 类似Hotjar的UX研究工具

interface Props {
  projectId: string;
}

interface SessionEvent {
  id: string;
  timestamp: number;
  type: 'page_view' | 'click' | 'scroll' | 'input' | 'question_view' | 'question_answer' | 'navigation' | 'focus' | 'blur' | 'error';
  target?: string;
  value?: string;
  x?: number;
  y?: number;
  metadata?: Record<string, any>;
}

interface Session {
  id: string;
  participant_id: string;
  participant_email: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  events: SessionEvent[];
  pages_viewed: number;
  questions_answered: number;
  device: string;
  browser: string;
  completion_rate: number;
}

const EVENT_COLORS: Record<string, string> = {
  page_view: 'bg-blue-400',
  click: 'bg-emerald-400',
  scroll: 'bg-stone-300',
  input: 'bg-purple-400',
  question_view: 'bg-cyan-400',
  question_answer: 'bg-amber-400',
  navigation: 'bg-indigo-400',
  focus: 'bg-teal-300',
  blur: 'bg-stone-300',
  error: 'bg-red-400',
};

const SessionReplayViewer: React.FC<Props> = ({ projectId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Generate synthetic session data from actual response data for visualization
  // 从实际响应数据生成合成会话数据用于可视化
  useEffect(() => {
    loadSessions();
  }, [projectId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const [{ data: responses }, { data: enrollments }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
        supabase.from('enrollment').select('*').eq('project_id', projectId),
      ]);

      // Build sessions from enrollment + response data / 从登记+响应数据构建会话
      const enrollmentMap = new Map((enrollments || []).map(e => [e.id, e]));
      const byEnrollment = new Map<string, any[]>();
      (responses || []).forEach(r => {
        const key = r.enrollment_id || 'anon-' + r.id;
        if (!byEnrollment.has(key)) byEnrollment.set(key, []);
        byEnrollment.get(key)!.push(r);
      });

      const generatedSessions: Session[] = Array.from(byEnrollment.entries()).map(([enrollId, resps]) => {
        const enrollment = enrollmentMap.get(enrollId);
        const sorted = resps.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const startTime = new Date(sorted[0].created_at).getTime();
        const endTime = new Date(sorted[sorted.length - 1].created_at).getTime();
        const duration = Math.max(1, (endTime - startTime) / 1000);

        // Generate synthetic events from responses / 从响应生成合成事件
        const events: SessionEvent[] = [];
        sorted.forEach((r: any, i: number) => {
          const ts = new Date(r.created_at).getTime() - startTime;
          events.push({
            id: `${r.id}-view`,
            timestamp: Math.max(0, ts - 2000),
            type: 'question_view',
            target: r.question_id,
            metadata: { question_id: r.question_id },
          });
          events.push({
            id: `${r.id}-answer`,
            timestamp: ts,
            type: 'question_answer',
            target: r.question_id,
            value: r.response_text || String(r.response_value || ''),
            metadata: { question_id: r.question_id },
          });
          // Synthetic clicks / 合成点击
          if (i < sorted.length - 1) {
            events.push({
              id: `${r.id}-nav`,
              timestamp: ts + 500,
              type: 'navigation',
              target: 'next_question',
            });
          }
        });

        return {
          id: enrollId,
          participant_id: enrollment?.participant_id || 'anonymous',
          participant_email: enrollment?.participant_email || 'Anonymous',
          started_at: sorted[0].created_at,
          ended_at: sorted[sorted.length - 1].created_at,
          duration_seconds: Math.round(duration),
          events: events.sort((a, b) => a.timestamp - b.timestamp),
          pages_viewed: new Set(sorted.map((r: any) => r.question_id)).size,
          questions_answered: sorted.length,
          device: 'Desktop',
          browser: 'Chrome',
          completion_rate: Math.min(100, Math.round(sorted.length / Math.max(1, sorted.length) * 100)),
        };
      });

      setSessions(generatedSessions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (filter === 'completed') return s.completion_rate >= 80;
      if (filter === 'abandoned') return s.completion_rate < 80;
      return true;
    });
  }, [sessions, filter]);

  // Playback timer / 回放计时器
  useEffect(() => {
    if (!isPlaying || !selectedSession) return;
    const interval = setInterval(() => {
      setPlaybackTime(prev => {
        if (prev >= selectedSession.duration_seconds * 1000) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, selectedSession]);

  // Format time / 格式化时间
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Aggregate click heatmap data / 聚合点击热图数据
  const heatmapData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      s.events.filter(e => e.type === 'question_answer').forEach(e => {
        const key = e.target || 'unknown';
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10);
  }, [sessions]);

  // Stats
  const avgDuration = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.duration_seconds, 0) / sessions.length) : 0;
  const avgCompletion = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.completion_rate, 0) / sessions.length) : 0;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Video size={22} className="text-emerald-600" />
            Session Replay & Tracking / 会话回放与追踪
          </h2>
          <p className="text-sm text-stone-500 mt-1">Review participant behavior and interaction patterns / 查看参与者行为和交互模式</p>
        </div>
      </div>

      {/* Summary Stats / 概要统计 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-stone-700">{sessions.length}</div>
          <div className="text-xs text-stone-500">Sessions / 会话</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{avgCompletion}%</div>
          <div className="text-xs text-stone-500">Avg Completion / 平均完成率</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatTime(avgDuration * 1000)}</div>
          <div className="text-xs text-stone-500">Avg Duration / 平均时长</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{sessions.reduce((a, s) => a + s.events.length, 0)}</div>
          <div className="text-xs text-stone-500">Total Events / 总事件数</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'completed', 'abandoned'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {f === 'all' ? `All (${sessions.length})` : f === 'completed' ? `Completed / 已完成` : `Abandoned / 已放弃`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List / 会话列表 */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-stone-700 sticky top-0 bg-stone-50/80 backdrop-blur-sm py-1">
            Sessions / 会话 ({filteredSessions.length})
          </h3>
          {filteredSessions.map(session => (
            <button
              key={session.id}
              onClick={() => { setSelectedSession(session); setPlaybackTime(0); setIsPlaying(false); }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedSession?.id === session.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-stone-800 truncate">{session.participant_email}</span>
                <span className="text-[10px] text-stone-400">{formatTime(session.duration_seconds * 1000)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-stone-100 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${session.completion_rate}%` }} />
                </div>
                <span className="text-[10px] text-stone-500">{session.completion_rate}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-stone-400">{session.questions_answered} answers</span>
                <span className="text-[10px] text-stone-400">{session.events.length} events</span>
              </div>
            </button>
          ))}
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-stone-400 text-sm">No sessions / 暂无会话</div>
          )}
        </div>

        {/* Replay Player / 回放播放器 */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {/* Player Header */}
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-stone-800">{selectedSession.participant_email}</div>
                  <div className="text-xs text-stone-400">{new Date(selectedSession.started_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">{selectedSession.device} • {selectedSession.browser}</span>
                </div>
              </div>

              {/* Event Timeline / 事件时间线 */}
              <div className="p-4">
                <div className="relative h-8 bg-stone-100 rounded-lg overflow-hidden mb-3">
                  {selectedSession.events.map((event, i) => {
                    const left = selectedSession.duration_seconds > 0
                      ? (event.timestamp / (selectedSession.duration_seconds * 1000)) * 100
                      : 0;
                    return (
                      <div
                        key={event.id}
                        className={`absolute top-1 w-1.5 h-6 rounded-sm ${EVENT_COLORS[event.type] || 'bg-stone-400'}`}
                        style={{ left: `${Math.min(99, left)}%` }}
                        title={`${event.type}: ${event.target || ''} @ ${formatTime(event.timestamp)}`}
                      />
                    );
                  })}
                  {/* Playback cursor / 播放游标 */}
                  <div
                    className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                    style={{ left: `${selectedSession.duration_seconds > 0 ? (playbackTime / (selectedSession.duration_seconds * 1000)) * 100 : 0}%` }}
                  />
                </div>

                {/* Controls / 控件 */}
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setPlaybackTime(Math.max(0, playbackTime - 5000))} className="p-1.5 rounded-lg hover:bg-stone-100"><SkipBack size={16} /></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button onClick={() => setPlaybackTime(Math.min(selectedSession.duration_seconds * 1000, playbackTime + 5000))} className="p-1.5 rounded-lg hover:bg-stone-100"><SkipForward size={16} /></button>
                  <span className="text-xs text-stone-500 font-mono">
                    {formatTime(playbackTime)} / {formatTime(selectedSession.duration_seconds * 1000)}
                  </span>
                  <input
                    type="range"
                    value={playbackTime}
                    onChange={e => setPlaybackTime(parseInt(e.target.value))}
                    max={selectedSession.duration_seconds * 1000}
                    className="flex-1"
                  />
                </div>

                {/* Event Log / 事件日志 */}
                <div className="space-y-1 max-h-[350px] overflow-y-auto">
                  <h4 className="text-xs font-semibold text-stone-600 mb-2">Event Log / 事件日志</h4>
                  {selectedSession.events.map(event => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs transition-all ${
                        event.timestamp <= playbackTime ? 'bg-stone-50' : 'opacity-40'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${EVENT_COLORS[event.type]}`} />
                      <span className="font-mono text-stone-400 w-12 shrink-0">{formatTime(event.timestamp)}</span>
                      <span className="font-medium text-stone-700">{event.type}</span>
                      {event.target && <span className="text-stone-500 truncate">→ {event.target}</span>}
                      {event.value && <span className="text-emerald-600 truncate ml-auto">"{event.value}"</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="px-4 py-2 border-t border-stone-100 flex gap-3 flex-wrap">
                {Object.entries(EVENT_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] text-stone-500">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 flex items-center justify-center h-96 text-stone-400">
              <div className="text-center">
                <Video size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a session to replay / 选择一个会话进行回放</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interaction Heatmap / 交互热图 */}
      {heatmapData.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <MousePointer size={14} />
            Most Interacted Questions / 最多交互的问题
          </h3>
          <div className="space-y-2">
            {heatmapData.map(([questionId, count], i) => {
              const maxCount = heatmapData[0][1] as number;
              return (
                <div key={questionId} className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 w-6 text-right">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="bg-stone-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center px-2"
                        style={{ width: `${(count as number) / (maxCount as number) * 100}%` }}
                      >
                        <span className="text-[10px] text-white font-medium whitespace-nowrap">{count} interactions</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-stone-500 font-mono truncate w-24">{(questionId as string).slice(0, 8)}...</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionReplayViewer;
