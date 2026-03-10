/**
 * Sentiment Analysis Dashboard — Real-time sentiment tracking for open-text responses
 * 情感分析仪表板 — 开放文本响应的实时情感追踪
 */
import React, { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Minus, BarChart3, MessageSquare, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

interface Props {
  projectId: string;
  responses: any[];
  questions: any[];
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#ef4444',
  mixed: '#f59e0b',
};

// Simple lexicon-based sentiment analysis / 简单的基于词典的情感分析
const POSITIVE_WORDS = new Set(['good', 'great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic', 'happy', 'helpful', 'easy', 'satisfied', 'recommend', 'best', 'perfect', 'awesome', 'enjoy', 'comfortable', 'pleasant', 'beautiful', 'impressed', '好', '很好', '优秀', '喜欢', '满意', '推荐', '棒', '开心', '方便', '舒服']);
const NEGATIVE_WORDS = new Set(['bad', 'terrible', 'awful', 'hate', 'horrible', 'difficult', 'confusing', 'frustrated', 'disappointed', 'worst', 'annoying', 'slow', 'broken', 'ugly', 'complicated', 'useless', 'poor', 'fail', 'problem', 'issue', '差', '不好', '难', '讨厌', '失望', '烦', '慢', '复杂', '糟糕', '问题']);

function analyzeSentiment(text: string): { label: 'positive' | 'negative' | 'neutral' | 'mixed'; score: number; confidence: number } {
  if (!text || text.length < 3) return { label: 'neutral', score: 0, confidence: 0 };
  const words = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  const total = pos + neg;
  if (total === 0) return { label: 'neutral', score: 0, confidence: 0.3 };
  const score = (pos - neg) / total; // -1 to 1
  const confidence = Math.min(1, total / words.length * 3);
  if (pos > 0 && neg > 0 && Math.abs(pos - neg) <= 1) return { label: 'mixed', score, confidence };
  if (score > 0.2) return { label: 'positive', score, confidence };
  if (score < -0.2) return { label: 'negative', score, confidence };
  return { label: 'neutral', score, confidence };
}

// Extract key phrases / 提取关键短语
function extractKeyPhrases(texts: string[], maxPhrases = 15): { phrase: string; count: number; sentiment: string }[] {
  const phraseMap = new Map<string, { count: number; sentiments: string[] }>();
  for (const text of texts) {
    const words = text.toLowerCase().replace(/[^\w\s\u4e00-\u9fff]/g, '').split(/\s+/).filter(w => w.length > 3);
    // Bigrams / 二元组
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      const existing = phraseMap.get(bigram) || { count: 0, sentiments: [] };
      existing.count++;
      existing.sentiments.push(analyzeSentiment(bigram).label);
      phraseMap.set(bigram, existing);
    }
    // Single significant words / 单个重要词
    for (const w of words) {
      if (POSITIVE_WORDS.has(w) || NEGATIVE_WORDS.has(w)) {
        const existing = phraseMap.get(w) || { count: 0, sentiments: [] };
        existing.count++;
        existing.sentiments.push(analyzeSentiment(w).label);
        phraseMap.set(w, existing);
      }
    }
  }
  return [...phraseMap.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, maxPhrases)
    .map(([phrase, data]) => ({
      phrase,
      count: data.count,
      sentiment: data.sentiments.sort((a, b) =>
        data.sentiments.filter(s => s === b).length - data.sentiments.filter(s => s === a).length
      )[0],
    }));
}

const SentimentDashboard: React.FC<Props> = ({ projectId, responses, questions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [view, setView] = useState<'overview' | 'timeline' | 'phrases' | 'individual'>('overview');

  // Find text questions / 找到文本类问题
  const textQuestions = useMemo(() =>
    questions.filter(q => ['text', 'long_text', 'open_text', 'textarea', 'short_text'].includes(q.question_type)),
  [questions]);

  // Collect text responses / 收集文本响应
  const textResponses = useMemo(() => {
    const results: { text: string; questionId: string; questionText: string; createdAt: string; sentiment: ReturnType<typeof analyzeSentiment> }[] = [];
    for (const r of responses) {
      const answers = r.answers || {};
      for (const q of textQuestions) {
        if (selectedQuestion !== 'all' && q.id !== selectedQuestion) continue;
        const text = answers[q.id] || r.response_text;
        if (text && typeof text === 'string' && text.length > 2) {
          results.push({
            text,
            questionId: q.id,
            questionText: q.question_text || q.text || 'Question',
            createdAt: r.created_at,
            sentiment: analyzeSentiment(text),
          });
        }
      }
    }
    return results;
  }, [responses, textQuestions, selectedQuestion]);

  // Sentiment distribution / 情感分布
  const distribution = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
    textResponses.forEach(r => counts[r.sentiment.label]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: SENTIMENT_COLORS[name as keyof typeof SENTIMENT_COLORS] }));
  }, [textResponses]);

  // Timeline data (by day) / 时间线数据（按天）
  const timelineData = useMemo(() => {
    const dayMap = new Map<string, { positive: number; negative: number; neutral: number; mixed: number }>();
    textResponses.forEach(r => {
      const day = r.createdAt?.substring(0, 10) || 'unknown';
      const existing = dayMap.get(day) || { positive: 0, negative: 0, neutral: 0, mixed: 0 };
      existing[r.sentiment.label]++;
      dayMap.set(day, existing);
    });
    return [...dayMap.entries()].sort().map(([date, counts]) => ({ date: date.substring(5), ...counts }));
  }, [textResponses]);

  // Key phrases / 关键短语
  const keyPhrases = useMemo(() => extractKeyPhrases(textResponses.map(r => r.text)), [textResponses]);

  // Average sentiment score / 平均情感分数
  const avgScore = textResponses.length > 0
    ? textResponses.reduce((s, r) => s + r.sentiment.score, 0) / textResponses.length
    : 0;

  const sentimentIcon = (label: string) => {
    if (label === 'positive') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (label === 'negative') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-violet-600" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sentiment Analysis / 情感分析</h2>
            <p className="text-sm text-muted-foreground">{textResponses.length} text responses analyzed / 条文本已分析</p>
          </div>
        </div>
        <select
          value={selectedQuestion}
          onChange={e => setSelectedQuestion(e.target.value)}
          className="text-xs border border-border rounded-lg px-3 py-1.5 bg-background text-foreground"
        >
          <option value="all">All text questions / 所有文本题</option>
          {textQuestions.map(q => (
            <option key={q.id} value={q.id}>{(q.question_text || q.text || '').substring(0, 40)}</option>
          ))}
        </select>
      </div>

      {/* View Tabs / 视图切换 */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['overview', 'timeline', 'phrases', 'individual'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm rounded-md transition-colors ${view === v ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            {v === 'overview' && 'Overview / 概览'}
            {v === 'timeline' && 'Timeline / 趋势'}
            {v === 'phrases' && 'Key Phrases / 关键短语'}
            {v === 'individual' && 'Individual / 逐条'}
          </button>
        ))}
      </div>

      {/* Overview / 概览 */}
      {view === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards / 摘要卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{textResponses.length}</p>
              <p className="text-xs text-muted-foreground">Total / 总计</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{distribution.find(d => d.name === 'positive')?.value || 0}</p>
              <p className="text-xs text-muted-foreground">Positive / 正面</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{distribution.find(d => d.name === 'negative')?.value || 0}</p>
              <p className="text-xs text-muted-foreground">Negative / 负面</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${avgScore > 0 ? 'text-emerald-600' : avgScore < 0 ? 'text-red-500' : 'text-foreground'}`}>
                {avgScore > 0 ? '+' : ''}{(avgScore * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Net Sentiment / 净情感</p>
            </div>
          </div>

          {/* Distribution Chart / 分布图 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-4">Sentiment Distribution / 情感分布</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {distribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-4">Sentiment Bar / 情感柱状图</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Timeline / 趋势 */}
      {view === 'timeline' && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Sentiment Over Time / 情感趋势</h3>
          {timelineData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No timeline data available / 无趋势数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.4} />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="mixed" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Key Phrases / 关键短语 */}
      {view === 'phrases' && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Key Phrases / 关键短语</h3>
          {keyPhrases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Not enough text data for phrase extraction / 文本数据不足以提取短语</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keyPhrases.map((kp, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border"
                  style={{
                    borderColor: SENTIMENT_COLORS[kp.sentiment as keyof typeof SENTIMENT_COLORS] || '#94a3b8',
                    backgroundColor: `${SENTIMENT_COLORS[kp.sentiment as keyof typeof SENTIMENT_COLORS] || '#94a3b8'}15`,
                    fontSize: `${Math.min(16, 11 + kp.count)}px`,
                  }}
                >
                  <span className="text-foreground">{kp.phrase}</span>
                  <span className="text-xs text-muted-foreground">×{kp.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Individual Responses / 逐条响应 */}
      {view === 'individual' && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {textResponses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No text responses / 无文本响应</p>
          ) : textResponses.slice(0, 50).map((r, i) => (
            <div key={i} className="border border-border rounded-lg p-3 flex items-start gap-3">
              <div className="mt-0.5">{sentimentIcon(r.sentiment.label)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{r.text}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full`} style={{ backgroundColor: `${SENTIMENT_COLORS[r.sentiment.label]}20`, color: SENTIMENT_COLORS[r.sentiment.label] }}>
                    {r.sentiment.label} ({(r.sentiment.confidence * 100).toFixed(0)}%)
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{r.questionText.substring(0, 30)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentimentDashboard;
