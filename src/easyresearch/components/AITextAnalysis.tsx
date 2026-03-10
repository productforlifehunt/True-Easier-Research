import React, { useState, useMemo } from 'react';
import { Sparkles, MessageSquare, Tag, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

// AI-Powered Text & Sentiment Analysis for open-ended responses
// AI 驱动的文本与情感分析（用于开放式回答）
interface Props {
  projectId: string;
  responses: any[];
  questions: any[];
}

interface ThemeResult {
  theme: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  exampleResponses: string[];
}

interface SentimentResult {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

interface AIAnalysisResult {
  themes: ThemeResult[];
  sentiment: SentimentResult;
  keyInsights: string[];
  wordCloud: { word: string; count: number }[];
  summary: string;
}

const OPENROUTER_KEY = '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';

const AITextAnalysis: React.FC<Props> = ({ projectId, responses, questions }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [localWordCloud, setLocalWordCloud] = useState<{ word: string; count: number }[]>([]);

  // Get text-type questions / 获取文本类型问题
  const textQuestions = useMemo(() => {
    return questions.filter((q: any) => 
      ['text_short', 'text_long', 'text', 'short_text', 'long_text'].includes(q.question_type)
    );
  }, [questions]);

  // Get responses for selected question / 获取所选问题的回复
  const questionResponses = useMemo(() => {
    if (!selectedQuestion) return [];
    return responses
      .filter(r => r.question_id === selectedQuestion && r.response_text)
      .map(r => r.response_text)
      .filter(Boolean);
  }, [responses, selectedQuestion]);

  // Local word frequency analysis (no AI needed) / 本地词频分析
  const computeLocalWordCloud = (texts: string[]) => {
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'if', 'when', 'while', 'although', 'though', 'that', 'this', 'these', 'those', 'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'how', 'where', 'why', 'about', 'also', 'really', 'like', 'think', 'know', 'get', 'got', 'go', 'going', 'make', 'making']);
    const freq: Record<string, number> = {};
    texts.forEach(text => {
      const words = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff\s]/g, '').split(/\s+/);
      words.forEach(w => {
        if (w.length > 2 && !stopWords.has(w)) {
          freq[w] = (freq[w] || 0) + 1;
        }
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word, count]) => ({ word, count }));
  };

  // Quick local analysis when question is selected
  React.useEffect(() => {
    if (questionResponses.length > 0) {
      setLocalWordCloud(computeLocalWordCloud(questionResponses));
    } else {
      setLocalWordCloud([]);
    }
  }, [questionResponses]);

  // AI Analysis via OpenRouter / 通过 OpenRouter 进行 AI 分析
  const runAIAnalysis = async () => {
    if (questionResponses.length === 0) {
      toast.error('No text responses to analyze / 没有可分析的文本回复');
      return;
    }

    setAnalyzing(true);
    try {
      const sampleSize = Math.min(questionResponses.length, 100);
      const sample = questionResponses.slice(0, sampleSize);
      const questionText = textQuestions.find((q: any) => q.id === selectedQuestion)?.question_text || '';

      const prompt = `Analyze these ${sampleSize} survey responses to the question: "${questionText}"

Responses:
${sample.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Provide a JSON analysis with this exact structure:
{
  "themes": [{"theme": "theme name", "count": number_of_responses_mentioning_it, "sentiment": "positive|negative|neutral|mixed", "exampleResponses": ["example1", "example2"]}],
  "sentiment": {"positive": count, "negative": count, "neutral": count, "total": ${sampleSize}},
  "keyInsights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence summary of findings"
}

Respond with ONLY valid JSON, no markdown.`;

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAnalysisResult({
          themes: parsed.themes || [],
          sentiment: parsed.sentiment || { positive: 0, negative: 0, neutral: 0, total: sampleSize },
          keyInsights: parsed.keyInsights || [],
          wordCloud: localWordCloud,
          summary: parsed.summary || '',
        });
        toast.success(`Analyzed ${sampleSize} responses / 已分析 ${sampleSize} 条回复`);
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (e: any) {
      console.error('AI analysis error:', e);
      toast.error('Analysis failed / 分析失败: ' + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const sentimentColor = (s: string) => {
    switch (s) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'mixed': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const maxWordCount = localWordCloud.length > 0 ? localWordCloud[0].count : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Text Analysis / AI 文本分析
        </h3>
      </div>

      {/* Question selector / 问题选择器 */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Select open-ended question / 选择开放式问题</label>
          <select
            value={selectedQuestion}
            onChange={e => { setSelectedQuestion(e.target.value); setAnalysisResult(null); }}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">Choose... / 选择...</option>
            {textQuestions.map((q: any) => (
              <option key={q.id} value={q.id}>
                {q.question_text?.slice(0, 60) || 'Untitled'}
                {' '}({responses.filter(r => r.question_id === q.id && r.response_text).length} responses)
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={runAIAnalysis}
          disabled={analyzing || !selectedQuestion || questionResponses.length === 0}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {analyzing ? 'Analyzing... / 分析中...' : 'Run AI Analysis / 运行 AI 分析'}
        </button>
      </div>

      {selectedQuestion && questionResponses.length > 0 && (
        <>
          <div className="text-sm text-muted-foreground">
            {questionResponses.length} text responses / {questionResponses.length} 条文本回复
          </div>

          {/* Word Cloud (always visible, local computation) / 词云 */}
          {localWordCloud.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Word Frequency / 词频
              </div>
              <div className="flex flex-wrap gap-2">
                {localWordCloud.slice(0, 40).map(({ word, count }) => {
                  const size = Math.max(12, Math.min(28, 12 + (count / maxWordCount) * 16));
                  const opacity = 0.4 + (count / maxWordCount) * 0.6;
                  return (
                    <span
                      key={word}
                      className="text-primary hover:bg-primary/10 px-1 rounded cursor-default transition"
                      style={{ fontSize: `${size}px`, opacity }}
                      title={`${word}: ${count}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Results / AI 分析结果 */}
          {analysisResult && (
            <div className="space-y-4">
              {/* Summary / 摘要 */}
              <div className="bg-card border border-primary/20 rounded-lg p-4">
                <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Summary / AI 摘要
                </div>
                <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
              </div>

              {/* Sentiment breakdown / 情感分布 */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-medium text-foreground mb-3">Sentiment / 情感</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Positive / 积极', value: analysisResult.sentiment.positive, color: 'bg-green-500', total: analysisResult.sentiment.total },
                    { label: 'Neutral / 中性', value: analysisResult.sentiment.neutral, color: 'bg-gray-400', total: analysisResult.sentiment.total },
                    { label: 'Negative / 消极', value: analysisResult.sentiment.negative, color: 'bg-red-500', total: analysisResult.sentiment.total },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{s.total > 0 ? Math.round((s.value / s.total) * 100) : 0}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Themes / 主题 */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Themes / 主题 ({analysisResult.themes.length})
                </div>
                <div className="space-y-3">
                  {analysisResult.themes.map((theme, i) => (
                    <div key={i} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-foreground">{theme.theme}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{theme.count} mentions</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${sentimentColor(theme.sentiment)}`}>
                            {theme.sentiment}
                          </span>
                        </div>
                      </div>
                      {theme.exampleResponses.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {theme.exampleResponses.slice(0, 2).map((ex, j) => (
                            <div key={j} className="text-xs text-muted-foreground italic pl-3 border-l-2 border-border">
                              "{ex.slice(0, 120)}{ex.length > 120 ? '...' : ''}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights / 关键发现 */}
              {analysisResult.keyInsights.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Key Insights / 关键发现
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.keyInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Raw responses / 原始回复 */}
          <details className="bg-card border border-border rounded-lg">
            <summary className="p-3 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/30">
              Raw Responses / 原始回复 ({questionResponses.length})
            </summary>
            <div className="p-3 pt-0 max-h-64 overflow-y-auto space-y-2">
              {questionResponses.slice(0, 50).map((text, i) => (
                <div key={i} className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  {text}
                </div>
              ))}
              {questionResponses.length > 50 && (
                <div className="text-xs text-muted-foreground text-center">... and {questionResponses.length - 50} more</div>
              )}
            </div>
          </details>
        </>
      )}

      {selectedQuestion && questionResponses.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No text responses yet for this question / 此问题暂无文本回复
        </div>
      )}
    </div>
  );
};

export default AITextAnalysis;
