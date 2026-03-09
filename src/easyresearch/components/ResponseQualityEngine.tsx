/**
 * Response Quality & Fraud Detection Engine
 * 响应质量与欺诈检测引擎
 *
 * Detects: speeders, straightliners, bots, duplicate IPs, gibberish text, quality scoring
 * 检测：快速完成者、直线作答者、机器人、重复IP、乱码文本、质量评分
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle, Zap, Bot, Copy, Type, BarChart3, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QualityFlag {
  type: 'speeder' | 'straightliner' | 'duplicate_ip' | 'bot_pattern' | 'gibberish' | 'incomplete';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detail?: string;
}

interface ScoredResponse {
  responseId: string;
  participantId: string;
  participantEmail?: string;
  qualityScore: number; // 0-100
  flags: QualityFlag[];
  completionTime?: number; // seconds
  answers: Record<string, any>;
  createdAt: string;
}

interface Props {
  projectId: string;
  questions: any[];
}

// Quality thresholds / 质量阈值
const SPEEDER_THRESHOLD_RATIO = 0.3; // < 30% of median = speeder
const STRAIGHTLINE_THRESHOLD = 0.85; // > 85% same answer = straightliner
const GIBBERISH_MIN_ENTROPY = 1.5; // Shannon entropy threshold
const MIN_COMPLETION_SECONDS = 10; // < 10s = bot

const ResponseQualityEngine: React.FC<Props> = ({ projectId, questions }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: resp }, { data: enroll }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('enrollment').select('id, participant_email, participant_id, status, created_at, metadata').eq('project_id', projectId),
      ]);
      setResponses(resp || []);
      setEnrollments(enroll || []);
    } catch (e) {
      console.error('Error loading quality data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Shannon entropy for text / 计算文本的香农熵
  const shannonEntropy = (text: string): number => {
    if (!text || text.length < 3) return 0;
    const freq: Record<string, number> = {};
    for (const c of text.toLowerCase()) freq[c] = (freq[c] || 0) + 1;
    const len = text.length;
    return -Object.values(freq).reduce((sum, f) => {
      const p = f / len;
      return sum + p * Math.log2(p);
    }, 0);
  };

  // Detect straightlining / 检测直线作答
  const detectStraightlining = (answers: Record<string, any>): boolean => {
    const choiceQs = questions.filter(q => ['single_choice', 'likert_scale', 'rating_scale', 'dropdown'].includes(q.question_type));
    if (choiceQs.length < 4) return false;
    const vals = choiceQs.map(q => answers[q.id]).filter(Boolean);
    if (vals.length < 4) return false;
    const mode = vals.sort((a, b) => vals.filter(v => v === a).length - vals.filter(v => v === b).length).pop();
    const modeRatio = vals.filter(v => v === mode).length / vals.length;
    return modeRatio >= STRAIGHTLINE_THRESHOLD;
  };

  // Group responses by participant / 按参与者分组
  const scoredResponses: ScoredResponse[] = useMemo(() => {
    if (!responses.length) return [];

    // Calculate median completion time / 计算中位完成时间
    const completionTimes = responses
      .map(r => {
        const timings = r.response_data?.__question_timings__;
        if (!timings) return null;
        return Object.values(timings as Record<string, number>).reduce((s: number, t: any) => s + (Number(t) || 0), 0);
      })
      .filter(Boolean) as number[];
    completionTimes.sort((a, b) => a - b);
    const medianTime = completionTimes[Math.floor(completionTimes.length / 2)] || 120;

    // Detect duplicate IPs / 检测重复IP
    const ipCounts: Record<string, string[]> = {};
    enrollments.forEach(e => {
      const ip = (e.metadata as any)?.ip_address;
      if (ip) {
        if (!ipCounts[ip]) ipCounts[ip] = [];
        ipCounts[ip].push(e.participant_id || e.id);
      }
    });
    const duplicateIPs = new Set(
      Object.entries(ipCounts).filter(([, ids]) => ids.length > 1).flatMap(([, ids]) => ids)
    );

    return responses.map(r => {
      const flags: QualityFlag[] = [];
      const answers = r.response_data || {};
      const timings = answers.__question_timings__ || {};
      const totalTime = Object.values(timings as Record<string, number>).reduce((s: number, t: any) => s + (Number(t) || 0), 0);
      const enrollment = enrollments.find(e => e.participant_id === r.participant_id || e.id === r.enrollment_id);

      // 1. Speeder detection / 快速完成者检测
      if (totalTime > 0 && totalTime < medianTime * SPEEDER_THRESHOLD_RATIO) {
        flags.push({
          type: 'speeder',
          severity: totalTime < MIN_COMPLETION_SECONDS ? 'critical' : 'high',
          message: `Completed in ${Math.round(totalTime)}s (median: ${Math.round(medianTime)}s)`,
          detail: `${Math.round(totalTime / medianTime * 100)}% of median time`,
        });
      }

      // 2. Bot pattern / 机器人模式
      if (totalTime > 0 && totalTime < MIN_COMPLETION_SECONDS) {
        flags.push({
          type: 'bot_pattern',
          severity: 'critical',
          message: `Suspiciously fast: ${Math.round(totalTime)}s total`,
        });
      }

      // 3. Straightlining / 直线作答
      if (detectStraightlining(answers)) {
        flags.push({
          type: 'straightliner',
          severity: 'high',
          message: 'Same answer selected for 85%+ of choice questions',
        });
      }

      // 4. Duplicate IP / 重复IP
      if (duplicateIPs.has(r.participant_id)) {
        flags.push({
          type: 'duplicate_ip',
          severity: 'medium',
          message: 'Shares IP address with other participants',
        });
      }

      // 5. Gibberish text / 乱码文本
      const textQs = questions.filter(q => ['short_text', 'long_text', 'open_ended'].includes(q.question_type));
      textQs.forEach(q => {
        const answer = answers[q.id];
        if (typeof answer === 'string' && answer.length > 5) {
          const entropy = shannonEntropy(answer);
          if (entropy < GIBBERISH_MIN_ENTROPY && answer.length > 10) {
            flags.push({
              type: 'gibberish',
              severity: 'medium',
              message: `Low-quality text for "${q.question_text?.substring(0, 30)}..."`,
              detail: `Entropy: ${entropy.toFixed(2)} (threshold: ${GIBBERISH_MIN_ENTROPY})`,
            });
          }
        }
      });

      // 6. Incomplete / 未完成
      const requiredQs = questions.filter(q => q.required || q.question_config?.response_required === 'force');
      const unanswered = requiredQs.filter(q => !answers[q.id] && answers[q.id] !== 0 && answers[q.id] !== false);
      if (unanswered.length > 0) {
        flags.push({
          type: 'incomplete',
          severity: unanswered.length > requiredQs.length * 0.5 ? 'high' : 'low',
          message: `${unanswered.length}/${requiredQs.length} required questions unanswered`,
        });
      }

      // Quality score: start at 100, deduct per flag / 质量分：起始100分，按标志扣分
      let score = 100;
      flags.forEach(f => {
        switch (f.severity) {
          case 'critical': score -= 40; break;
          case 'high': score -= 25; break;
          case 'medium': score -= 15; break;
          case 'low': score -= 5; break;
        }
      });

      return {
        responseId: r.id,
        participantId: r.participant_id || r.enrollment_id,
        participantEmail: enrollment?.participant_email,
        qualityScore: Math.max(0, Math.min(100, score)),
        flags,
        completionTime: totalTime || undefined,
        answers,
        createdAt: r.created_at,
      };
    });
  }, [responses, enrollments, questions]);

  // Aggregate stats / 聚合统计
  const stats = useMemo(() => {
    const total = scoredResponses.length;
    const flagged = scoredResponses.filter(r => r.flags.length > 0).length;
    const avgScore = total > 0 ? Math.round(scoredResponses.reduce((s, r) => s + r.qualityScore, 0) / total) : 0;
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    scoredResponses.forEach(r => r.flags.forEach(f => bySeverity[f.severity]++));
    const byType: Record<string, number> = {};
    scoredResponses.forEach(r => r.flags.forEach(f => { byType[f.type] = (byType[f.type] || 0) + 1; }));
    return { total, flagged, clean: total - flagged, avgScore, bySeverity, byType };
  }, [scoredResponses]);

  const filteredResponses = useMemo(() => {
    let list = scoredResponses;
    if (showFlaggedOnly) list = list.filter(r => r.flags.length > 0);
    if (filterSeverity !== 'all') list = list.filter(r => r.flags.some(f => f.severity === filterSeverity));
    return list.sort((a, b) => a.qualityScore - b.qualityScore);
  }, [scoredResponses, showFlaggedOnly, filterSeverity]);

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-stone-500 bg-stone-50';
    }
  };

  const flagIcon = (type: string) => {
    switch (type) {
      case 'speeder': return <Zap size={12} />;
      case 'bot_pattern': return <Bot size={12} />;
      case 'straightliner': return <BarChart3 size={12} />;
      case 'duplicate_ip': return <Copy size={12} />;
      case 'gibberish': return <Type size={12} />;
      case 'incomplete': return <AlertTriangle size={12} />;
      default: return <Shield size={12} />;
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-400 text-[12px]">Analyzing response quality... / 正在分析响应质量...</div>;

  return (
    <div className="space-y-5">
      {/* Summary Cards / 摘要卡片 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-emerald-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Avg Quality / 平均质量</span>
          </div>
          <p className={`text-2xl font-bold ${stats.avgScore >= 80 ? 'text-emerald-600' : stats.avgScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {stats.avgScore}/100
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Clean / 干净</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.clean}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Flagged / 标记</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.flagged}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-red-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Critical / 严重</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.bySeverity.critical}</p>
        </div>
      </div>

      {/* Flag Type Breakdown / 标志类型分布 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4">
        <h3 className="text-[13px] font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <Eye size={14} className="text-violet-500" /> Detection Summary / 检测摘要
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2 text-[11px] px-3 py-2 bg-stone-50 rounded-lg">
              {flagIcon(type)}
              <span className="text-stone-600 capitalize">{type.replace('_', ' ')}</span>
              <span className="ml-auto font-medium text-stone-800">{count}</span>
            </div>
          ))}
          {Object.keys(stats.byType).length === 0 && (
            <p className="text-[11px] text-stone-400 col-span-3 text-center py-4">No issues detected / 未检测到问题 ✅</p>
          )}
        </div>
      </div>

      {/* Filters / 过滤器 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
          className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${showFlaggedOnly ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}
        >
          <Filter size={11} className="inline mr-1" />
          {showFlaggedOnly ? 'Flagged Only' : 'All Responses'}
        </button>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="text-[11px] px-2 py-1.5 rounded-lg border border-stone-200 bg-white"
        >
          <option value="all">All Severities / 所有严重性</option>
          <option value="critical">Critical / 严重</option>
          <option value="high">High / 高</option>
          <option value="medium">Medium / 中</option>
          <option value="low">Low / 低</option>
        </select>
        <span className="text-[11px] text-stone-400 ml-auto">
          Showing {filteredResponses.length} of {scoredResponses.length}
        </span>
      </div>

      {/* Response List / 响应列表 */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="divide-y divide-stone-50 max-h-[500px] overflow-y-auto">
          {filteredResponses.map(r => (
            <div key={r.responseId} className="px-5 py-3 flex items-center gap-4">
              {/* Quality Score Badge / 质量分徽章 */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                r.qualityScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                r.qualityScore >= 60 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {r.qualityScore}
              </div>

              {/* Participant info / 参与者信息 */}
              <div className="min-w-[140px]">
                <p className="text-[12px] font-medium text-stone-700 truncate">
                  {r.participantEmail || r.participantId?.substring(0, 8)}
                </p>
                <p className="text-[10px] text-stone-400">
                  {r.completionTime ? `${Math.round(r.completionTime)}s` : 'N/A'} • {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Flags / 标志 */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {r.flags.length === 0 && (
                  <span className="text-[10px] text-emerald-500 flex items-center gap-1"><CheckCircle size={10} /> Clean</span>
                )}
                {r.flags.map((f, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${severityColor(f.severity)}`} title={f.detail}>
                    {flagIcon(f.type)} {f.message.substring(0, 50)}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {filteredResponses.length === 0 && (
            <div className="p-8 text-center text-stone-400 text-[12px]">
              No responses to analyze / 没有可分析的响应
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseQualityEngine;
