/**
 * Real-time Collection Monitor — Live response dashboard with velocity tracking
 * 实时采集监控器 — 带速度追踪的实时响应仪表板
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, RefreshCw, Users, Clock, TrendingUp, Zap, Eye, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '../../lib/supabase';

interface Props {
  projectId: string;
}

interface LiveStats {
  totalResponses: number;
  todayResponses: number;
  activeNow: number;
  avgCompletionTime: number; // seconds
  completionRate: number; // percentage
  lastResponseAt: string | null;
  hourlyVelocity: { hour: string; count: number }[];
  dailyVelocity: { date: string; count: number }[];
  recentActivity: { type: string; detail: string; time: string }[];
}

const CollectionMonitor: React.FC<Props> = ({ projectId }) => {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [view, setView] = useState<'live' | 'velocity' | 'activity'>('live');

  const loadStats = useCallback(async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      const [
        { count: totalResponses },
        { count: todayResponses },
        { data: recentResponses },
        { count: totalEnrollments },
      ] = await Promise.all([
        supabase.from('survey_response').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
        supabase.from('survey_response').select('*', { count: 'exact', head: true }).eq('project_id', projectId).gte('created_at', todayStart),
        supabase.from('survey_response').select('created_at').eq('project_id', projectId).gte('created_at', weekAgo).order('created_at', { ascending: true }),
        supabase.from('enrollment').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      ]);

      // Hourly velocity (last 24h) / 每小时速度（最近24小时）
      const hourlyMap = new Map<string, number>();
      for (let i = 23; i >= 0; i--) {
        const h = new Date(now.getTime() - i * 3600000);
        hourlyMap.set(`${h.getHours().toString().padStart(2, '0')}:00`, 0);
      }
      (recentResponses || []).forEach(r => {
        const d = new Date(r.created_at);
        const hourDiff = (now.getTime() - d.getTime()) / 3600000;
        if (hourDiff <= 24) {
          const key = `${d.getHours().toString().padStart(2, '0')}:00`;
          hourlyMap.set(key, (hourlyMap.get(key) || 0) + 1);
        }
      });

      // Daily velocity (last 7 days) / 每日速度（最近7天）
      const dailyMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        dailyMap.set(d.toISOString().substring(5, 10), 0);
      }
      (recentResponses || []).forEach(r => {
        const key = r.created_at.substring(5, 10);
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      });

      // Recent activity / 最近活动
      const recentActivity = (recentResponses || []).slice(-10).reverse().map(r => ({
        type: 'response',
        detail: 'New response submitted / 新响应已提交',
        time: r.created_at,
      }));

      // Estimate active users (responses in last 10 min) / 估算活跃用户数
      const tenMinAgo = new Date(now.getTime() - 600000).toISOString();
      const activeNow = (recentResponses || []).filter(r => r.created_at >= tenMinAgo).length;

      const completionRate = (totalEnrollments || 0) > 0 ? Math.round(((totalResponses || 0) / (totalEnrollments || 1)) * 100) : 0;

      setStats({
        totalResponses: totalResponses || 0,
        todayResponses: todayResponses || 0,
        activeNow,
        avgCompletionTime: 240, // Placeholder — would need timing data / 占位符
        completionRate: Math.min(100, completionRate),
        lastResponseAt: recentResponses?.length ? recentResponses[recentResponses.length - 1].created_at : null,
        hourlyVelocity: [...hourlyMap.entries()].map(([hour, count]) => ({ hour, count })),
        dailyVelocity: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
        recentActivity,
      });

      setLastRefresh(new Date());
    } catch (err) {
      console.error('[Monitor] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadStats, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadStats]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'just now / 刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (loading || !stats) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-6 h-6 text-emerald-600" />
            {autoRefresh && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Monitor / 实时监控</h2>
            <p className="text-xs text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()} • {autoRefresh ? `Auto-refresh ${refreshInterval}s` : 'Paused'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground">
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${autoRefresh ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border text-muted-foreground'}`}>
            {autoRefresh ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button onClick={loadStats} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Live Stats Cards / 实时统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total / 总计', value: stats.totalResponses, icon: 'T', highlight: false },
          { label: 'Today / 今日', value: stats.todayResponses, icon: 'D', highlight: stats.todayResponses > 0 },
          { label: 'Active Now / 当前活跃', value: stats.activeNow, icon: 'A', highlight: stats.activeNow > 0 },
          { label: 'Completion / 完成率', value: `${stats.completionRate}%`, icon: '%', highlight: false },
          { label: 'Last Response / 最后响应', value: stats.lastResponseAt ? timeAgo(stats.lastResponseAt) : 'None', icon: 'L', highlight: false },
        ].map((stat, i) => (
          <div key={i} className={`border rounded-lg p-4 transition-colors ${stat.highlight ? 'border-emerald-300 bg-emerald-50/50' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <span className="text-lg">{stat.icon}</span>
              {stat.highlight && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* View Tabs / 视图切换 */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['live', 'velocity', 'activity'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm rounded-md transition-colors ${view === v ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            {v === 'live' && 'Hourly / 每小时'}
            {v === 'velocity' && 'Daily / 每日'}
            {v === 'activity' && 'Activity / 活动'}
          </button>
        ))}
      </div>

      {/* Hourly Chart / 每小时图表 */}
      {view === 'live' && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Response Velocity (24h) / 响应速度（24小时）</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.hourlyVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Chart / 每日图表 */}
      {view === 'velocity' && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Daily Collection (7d) / 每日采集（7天）</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.dailyVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Activity Feed / 活动流 */}
      {view === 'activity' && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Recent Activity / 最近活动</h3>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity / 暂无近期活动</p>
          ) : (
            <div className="space-y-2">
              {stats.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-foreground flex-1">{a.detail}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(a.time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionMonitor;
