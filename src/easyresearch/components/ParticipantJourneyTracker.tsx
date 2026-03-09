/**
 * Participant Journey Tracker — Visual timeline of participant touchpoints
 * 参与者旅程追踪器 — 参与者触点的可视化时间线
 */
import React, { useState, useMemo } from 'react';
import { User, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Calendar, Mail, FileText, ArrowRight } from 'lucide-react';

interface JourneyEvent {
  id: string;
  type: 'enrolled' | 'consent_signed' | 'survey_started' | 'survey_completed' | 'survey_abandoned' | 'notification_sent' | 'reminder_sent' | 'withdrawn' | 'dnd_set' | 'profile_updated';
  timestamp: string;
  label: string;
  metadata?: Record<string, any>;
}

interface ParticipantJourney {
  participant_id: string;
  email: string;
  name?: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'withdrawn' | 'inactive';
  events: JourneyEvent[];
  completion_rate: number; // 0-100
  total_responses: number;
  avg_response_time_seconds: number;
  engagement_score: number; // 0-100
}

interface Props {
  projectId: string;
  journeys?: ParticipantJourney[];
}

const ParticipantJourneyTracker: React.FC<Props> = ({ projectId, journeys: inputJourneys }) => {
  // Demo data / 演示数据
  const journeys: ParticipantJourney[] = inputJourneys || [
    {
      participant_id: 'p1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      enrolled_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: 'active',
      events: [
        { id: 'e1', type: 'enrolled', timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), label: 'Enrolled in study / 加入研究' },
        { id: 'e2', type: 'consent_signed', timestamp: new Date(Date.now() - 7 * 86400000 + 300000).toISOString(), label: 'Consent signed / 签署同意书' },
        { id: 'e3', type: 'survey_completed', timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), label: 'Baseline survey completed / 基线问卷完成', metadata: { questionnaire: 'Baseline', time_seconds: 420 } },
        { id: 'e4', type: 'notification_sent', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), label: 'Week 1 reminder sent / 发送第1周提醒' },
        { id: 'e5', type: 'survey_completed', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), label: 'Week 1 survey completed / 第1周问卷完成', metadata: { questionnaire: 'Weekly Check-in', time_seconds: 180 } },
      ],
      completion_rate: 66,
      total_responses: 2,
      avg_response_time_seconds: 300,
      engagement_score: 82,
    },
    {
      participant_id: 'p2',
      email: 'bob@example.com',
      name: 'Bob Williams',
      enrolled_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      status: 'inactive',
      events: [
        { id: 'e6', type: 'enrolled', timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), label: 'Enrolled / 加入' },
        { id: 'e7', type: 'consent_signed', timestamp: new Date(Date.now() - 10 * 86400000 + 120000).toISOString(), label: 'Consent signed / 签署同意书' },
        { id: 'e8', type: 'survey_completed', timestamp: new Date(Date.now() - 9 * 86400000).toISOString(), label: 'Baseline completed / 基线完成', metadata: { time_seconds: 600 } },
        { id: 'e9', type: 'reminder_sent', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), label: 'Reminder sent / 已发送提醒' },
        { id: 'e10', type: 'survey_abandoned', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), label: 'Week 1 abandoned at 40% / 第1周在40%处放弃' },
      ],
      completion_rate: 33,
      total_responses: 1,
      avg_response_time_seconds: 600,
      engagement_score: 35,
    },
  ];

  const [selectedParticipant, setSelectedParticipant] = useState<string>(journeys[0]?.participant_id || '');
  const [sortBy, setSortBy] = useState<'engagement' | 'recent' | 'completion'>('engagement');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const sortedJourneys = useMemo(() => {
    let filtered = statusFilter === 'all' ? journeys : journeys.filter(j => j.status === statusFilter);
    return [...filtered].sort((a, b) => {
      if (sortBy === 'engagement') return b.engagement_score - a.engagement_score;
      if (sortBy === 'completion') return b.completion_rate - a.completion_rate;
      return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime();
    });
  }, [journeys, sortBy, statusFilter]);

  const selected = journeys.find(j => j.participant_id === selectedParticipant);

  const eventIcon = (type: JourneyEvent['type']) => {
    switch (type) {
      case 'enrolled': return <User className="w-3.5 h-3.5 text-blue-600" />;
      case 'consent_signed': return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'survey_completed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'survey_started': return <ArrowRight className="w-3.5 h-3.5 text-blue-600" />;
      case 'survey_abandoned': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'notification_sent':
      case 'reminder_sent': return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'withdrawn': return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'withdrawn': return 'bg-red-100 text-red-700';
      case 'inactive': return 'bg-amber-100 text-amber-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Aggregate stats / 聚合统计
  const avgEngagement = journeys.length > 0 ? Math.round(journeys.reduce((s, j) => s + j.engagement_score, 0) / journeys.length) : 0;
  const avgCompletion = journeys.length > 0 ? Math.round(journeys.reduce((s, j) => s + j.completion_rate, 0) / journeys.length) : 0;
  const activeCount = journeys.filter(j => j.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Participant Journeys / 参与者旅程</h2>
          <p className="text-sm text-muted-foreground">Track individual participant engagement timelines / 追踪个人参与者的参与时间线</p>
        </div>
      </div>

      {/* Summary Cards / 摘要卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total / 总计', value: journeys.length, color: 'text-foreground' },
          { label: 'Active / 活跃', value: activeCount, color: 'text-emerald-600' },
          { label: 'Avg Engagement / 平均参与度', value: `${avgEngagement}%`, color: 'text-indigo-600' },
          { label: 'Avg Completion / 平均完成率', value: `${avgCompletion}%`, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="border border-border rounded-lg p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant List / 参与者列表 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground"
            >
              <option value="engagement">Sort: Engagement / 排序：参与度</option>
              <option value="completion">Sort: Completion / 完成率</option>
              <option value="recent">Sort: Recent / 最近</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground"
            >
              <option value="all">All / 全部</option>
              <option value="active">Active / 活跃</option>
              <option value="inactive">Inactive / 不活跃</option>
              <option value="withdrawn">Withdrawn / 已退出</option>
            </select>
          </div>

          {sortedJourneys.map(j => (
            <button
              key={j.participant_id}
              onClick={() => setSelectedParticipant(j.participant_id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedParticipant === j.participant_id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{j.name || j.email}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(j.status)}`}>{j.status}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${j.engagement_score}%` }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{j.engagement_score}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{j.total_responses} responses • {j.events.length} events</p>
            </button>
          ))}
        </div>

        {/* Journey Timeline / 旅程时间线 */}
        {selected && (
          <div className="lg:col-span-2 space-y-4">
            {/* Participant Header / 参与者头部 */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{selected.name || selected.email}</h3>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusBadge(selected.status)}`}>{selected.status}</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Completion / 完成率</p>
                  <p className="text-lg font-bold text-foreground">{selected.completion_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Responses / 响应</p>
                  <p className="text-lg font-bold text-foreground">{selected.total_responses}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Time / 平均时间</p>
                  <p className="text-lg font-bold text-foreground">{Math.round(selected.avg_response_time_seconds / 60)}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engagement / 参与度</p>
                  <p className="text-lg font-bold text-foreground">{selected.engagement_score}%</p>
                </div>
              </div>
            </div>

            {/* Timeline / 时间线 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-4">Event Timeline / 事件时间线</h4>
              <div className="space-y-0">
                {selected.events.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    {/* Timeline line / 时间线连线 */}
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full border-2 border-border bg-background flex items-center justify-center">
                        {eventIcon(event.type)}
                      </div>
                      {i < selected.events.length - 1 && (
                        <div className="w-0.5 h-8 bg-border" />
                      )}
                    </div>
                    {/* Event content / 事件内容 */}
                    <div className="pb-4">
                      <p className="text-sm text-foreground">{event.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {event.metadata?.time_seconds && (
                        <p className="text-xs text-muted-foreground mt-0.5">⏱ {Math.round(event.metadata.time_seconds / 60)} min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantJourneyTracker;
