import React, { useState, useMemo } from 'react';
import { Sparkles, MessageSquare, Tag, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

// AI-Powered Text & Sentiment Analysis for open-ended responses
// AI 驱动的文本与情感分析（用于开放式回答）
// All AI calls go through edge function — NO direct OpenRouter calls from frontend
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
      .filter((r: any) => r.question_id === selectedQuestion && r.response_value)
      .map((r: any) => String(r.response_value));
  }, [responses, selectedQuestion]);

  // Simple word frequency for local word cloud / 简单词频统计
  const computeWordCloud = (texts: string[]) => {
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or', 'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'just', 'about', 'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how']);
    const wordCount: Record<string, number> = {};
    texts.forEach(text => {
      text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).forEach(word => {
        if (word.length > 2 && !stopWords.has(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
  };

  const runAnalysis = async () => {
    if (questionResponses.length === 0) {
      toast.error('No responses to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      // Compute local word cloud
      const wc = computeWordCloud(questionResponses);
      setLocalWordCloud(wc);

      const sampleSize = Math.min(questionResponses.length, 50);
      const sample = questionResponses.slice(0, sampleSize);

      const prompt = `Analyze these ${sampleSize} survey responses for themes and sentiment.

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

      // Call through edge function — NOT direct OpenRouter
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-survey-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'text_analysis',
          prompt,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`AI analysis failed: ${errText}`);
      }

      const data = await resp.json();
      const content = data.response || '';
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAnalysisResult({
          themes: parsed.themes || [],
          sentiment: parsed.sentiment || { positive: 0, negative: 0, neutral: 0, total: sampleSize },
          keyInsights: parsed.keyInsights || [],
          wordCloud: wc,
          summary: parsed.summary || '',
        });
      } else {
        throw new Error('Could not parse AI response');
      }

      toast.success('Analysis complete!');
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const sentimentColor = (s: string) => {
    switch (s) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-amber-600 bg-amber-50';
      default: return 'text-stone-600 bg-stone-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-stone-800">AI Text Analysis</h3>
      </div>

      {textQuestions.length === 0 ? (
        <p className="text-sm text-stone-500 italic">No text-type questions found in this survey.</p>
      ) : (
        <>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-stone-500 mb-1 block">Select question to analyze</label>
              <select
                value={selectedQuestion}
                onChange={(e) => { setSelectedQuestion(e.target.value); setAnalysisResult(null); }}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2"
              >
                <option value="">Choose a question...</option>
                {textQuestions.map((q: any) => (
                  <option key={q.id} value={q.id}>
                    {q.question_text?.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={runAnalysis}
              disabled={!selectedQuestion || analyzing || questionResponses.length === 0}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze
            </button>
          </div>

          {selectedQuestion && (
            <p className="text-xs text-stone-400">{questionResponses.length} responses available</p>
          )}

          {analysisResult && (
            <div className="space-y-4 mt-4">
              {/* Summary */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Summary
                </h4>
                <p className="text-sm text-purple-700">{analysisResult.summary}</p>
              </div>

              {/* Sentiment Overview */}
              <div className="bg-white border border-stone-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Sentiment Distribution
                </h4>
                <div className="flex gap-4">
                  {['positive', 'negative', 'neutral'].map(s => (
                    <div key={s} className={`flex-1 rounded-lg p-3 text-center ${sentimentColor(s)}`}>
                      <div className="text-2xl font-bold">{(analysisResult.sentiment as any)[s]}</div>
                      <div className="text-xs capitalize mt-1">{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Themes */}
              {analysisResult.themes.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Key Themes
                  </h4>
                  <div className="space-y-3">
                    {analysisResult.themes.map((theme, i) => (
                      <div key={i} className="border-l-3 border-purple-400 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-stone-800">{theme.theme}</span>
                          <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full">{theme.count} mentions</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sentimentColor(theme.sentiment)}`}>
                            {theme.sentiment}
                          </span>
                        </div>
                        {theme.exampleResponses?.length > 0 && (
                          <p className="text-xs text-stone-500 mt-1 italic">"{theme.exampleResponses[0]}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {analysisResult.keyInsights.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" /> Key Insights
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.keyInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-stone-600 flex gap-2">
                        <span className="text-purple-400">•</span> {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Word Cloud (simple display) */}
              {localWordCloud.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-stone-700 mb-2">Word Frequency</h4>
                  <div className="flex flex-wrap gap-2">
                    {localWordCloud.slice(0, 20).map(({ word, count }, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                        style={{ fontSize: `${Math.max(11, Math.min(18, 10 + count * 2))}px` }}
                      >
                        {word} <span className="text-purple-400 text-xs">({count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AITextAnalysis;