import React, { useState, useEffect } from 'react';
import { Presentation, QrCode, Users, BarChart3, Play, Pause, SkipForward, Maximize, Share2 } from 'lucide-react';

interface PollQuestion { id: string; text: string; type: 'single' | 'multiple' | 'word_cloud' | 'scale' | 'open_text'; options?: string[]; }
interface LiveVote { questionId: string; optionIndex?: number; text?: string; timestamp: number; }

interface Props { projectId: string; }

const LivePollPresentation: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'setup' | 'present' | 'results'>('setup');
  const [questions, setQuestions] = useState<PollQuestion[]>([
    { id: 'q1', text: 'How satisfied are you with the new design?', type: 'single', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
    { id: 'q2', text: 'Which features matter most?', type: 'multiple', options: ['Speed', 'Design', 'Reliability', 'Support', 'Price'] },
    { id: 'q3', text: 'Describe the product in one word', type: 'word_cloud' },
    { id: 'q4', text: 'Rate overall experience (1-10)', type: 'scale' },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [votes, setVotes] = useState<Map<string, number[]>>(new Map());
  const [wordCloudWords, setWordCloudWords] = useState<string[]>(['innovative', 'fast', 'clean', 'modern', 'intuitive', 'sleek', 'powerful', 'easy', 'elegant', 'responsive', 'smart', 'fresh']));

  // Simulate live votes / 模拟实时投票
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3));
      const q = questions[currentQuestion];
      if (q.options) {
        setVotes(prev => {
          const next = new Map(prev);
          const existing = next.get(q.id) || q.options!.map(() => 0);
          const randomIdx = Math.floor(Math.random() * existing.length);
          existing[randomIdx] += Math.floor(Math.random() * 5) + 1;
          next.set(q.id, [...existing]);
          return next;
        });
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isLive, currentQuestion, questions]);

  const getVotes = (qId: string, optCount: number) => votes.get(qId) || Array(optCount).fill(0);
  const totalVotes = (qId: string, optCount: number) => getVotes(qId, optCount).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center"><Presentation className="w-5 h-5 text-fuchsia-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Live Poll & Presentation / 实时投票与演示</h2>
            <p className="text-sm text-stone-500">{questions.length} questions · {isLive ? `🔴 LIVE · ${liveCount} connected` : 'Not active'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['setup', 'present', 'results'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-fuchsia-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'setup' ? '⚙️ Setup' : v === 'present' ? '🎤 Present' : '📊 Results'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'setup' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800">Poll Questions ({questions.length})</h3>
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-fuchsia-600">Q{idx + 1}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${q.type === 'single' ? 'bg-blue-100 text-blue-700' : q.type === 'multiple' ? 'bg-emerald-100 text-emerald-700' : q.type === 'word_cloud' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{q.type.replace('_', ' ')}</span>
                </div>
                <div className="text-sm font-medium text-stone-800">{q.text}</div>
                {q.options && (
                  <div className="flex flex-wrap gap-1">{q.options.map((o, i) => <span key={i} className="text-xs px-2 py-0.5 bg-stone-100 rounded-full text-stone-600">{o}</span>)}</div>
                )}
              </div>
            ))}
            <button className="w-full p-3 border-2 border-dashed border-stone-300 rounded-xl text-sm text-stone-500 hover:border-fuchsia-400">+ Add Question / 添加问题</button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Session Settings / 会话设置</h3>
            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
              {[
                { label: 'Show results in real-time / 实时显示结果', defaultChecked: true },
                { label: 'Anonymous voting / 匿名投票', defaultChecked: true },
                { label: 'Allow multiple votes / 允许多次投票', defaultChecked: false },
                { label: 'Auto-advance after vote / 投票后自动前进', defaultChecked: false },
                { label: 'Show participant count / 显示参与者人数', defaultChecked: true },
              ].map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                  <input type="checkbox" defaultChecked={opt.defaultChecked} className="rounded text-fuchsia-600" /> {opt.label}
                </label>
              ))}
            </div>
            <div className="p-4 bg-fuchsia-50 rounded-xl border border-fuchsia-200">
              <h4 className="text-sm font-bold text-fuchsia-800 mb-2 flex items-center gap-2"><QrCode className="w-4 h-4" /> Join Link / 加入链接</h4>
              <div className="text-xs font-mono text-fuchsia-600 bg-white p-2 rounded-lg break-all">https://poll.easyresearch.io/{projectId.slice(0, 8)}</div>
              <div className="mt-3 flex justify-center">
                <div className="w-32 h-32 bg-white rounded-xl border-2 border-fuchsia-200 flex items-center justify-center"><QrCode className="w-20 h-20 text-fuchsia-300" /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'present' && (
        <div className="space-y-4">
          {/* Presentation Controls / 演示控制 */}
          <div className="flex items-center justify-between bg-stone-900 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsLive(!isLive)} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${isLive ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {isLive ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Go Live</>}
              </button>
              {isLive && <div className="flex items-center gap-2 text-white text-sm"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {liveCount} connected</div>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} className="px-3 py-1.5 bg-stone-700 text-white rounded-lg text-xs" disabled={currentQuestion === 0}>← Prev</button>
              <span className="text-white text-sm">{currentQuestion + 1} / {questions.length}</span>
              <button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))} className="px-3 py-1.5 bg-stone-700 text-white rounded-lg text-xs flex items-center gap-1" disabled={currentQuestion >= questions.length - 1}><SkipForward className="w-3 h-3" /> Next</button>
              <button className="px-3 py-1.5 bg-stone-700 text-white rounded-lg text-xs flex items-center gap-1"><Maximize className="w-3 h-3" /> Fullscreen</button>
            </div>
          </div>

          {/* Live Question Display / 实时问题显示 */}
          <div className="bg-gradient-to-br from-fuchsia-950 to-indigo-950 rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="text-fuchsia-300 text-sm mb-4">Question {currentQuestion + 1} of {questions.length}</div>
            <h2 className="text-2xl font-bold text-white mb-8">{questions[currentQuestion].text}</h2>

            {questions[currentQuestion].type === 'word_cloud' ? (
              <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                {wordCloudWords.map((word, i) => (
                  <span key={i} className="text-white font-bold transition-all" style={{ fontSize: `${12 + Math.random() * 24}px`, opacity: 0.5 + Math.random() * 0.5 }}>{word}</span>
                ))}
              </div>
            ) : questions[currentQuestion].type === 'scale' ? (
              <div className="w-full max-w-md">
                <div className="flex justify-between mb-2">{Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 bg-fuchsia-500 rounded-t" style={{ height: `${20 + Math.random() * 80}px`, opacity: 0.5 + Math.random() * 0.5 }} />
                    <span className="text-xs text-white/60">{i + 1}</span>
                  </div>
                ))}</div>
              </div>
            ) : (
              <div className="w-full max-w-lg space-y-3">
                {questions[currentQuestion].options?.map((opt, i) => {
                  const v = getVotes(questions[currentQuestion].id, questions[currentQuestion].options!.length);
                  const total = totalVotes(questions[currentQuestion].id, questions[currentQuestion].options!.length);
                  const pct = total > 0 ? Math.round((v[i] / total) * 100) : 0;
                  return (
                    <div key={i} className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-4">
                      <div className="absolute inset-0 rounded-xl transition-all duration-700" style={{ width: `${pct}%`, background: `hsl(${280 + i * 30}, 70%, 60%)` }} />
                      <div className="relative flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{opt}</span>
                        <span className="text-white font-bold">{pct}% <span className="text-xs opacity-60">({v[i]})</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isLive && <div className="mt-8 text-fuchsia-300 text-sm animate-pulse">{totalVotes(questions[currentQuestion].id, questions[currentQuestion].options?.length || 10)} votes received / 已收到投票</div>}
          </div>
        </div>
      )}

      {activeView === 'results' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Responses', value: liveCount || 47, icon: '📊' },
              { label: 'Avg Response Time', value: '8s', icon: '⏱️' },
              { label: 'Completion Rate', value: '94%', icon: '✅' },
              { label: 'Sessions', value: '3', icon: '🎤' },
            ].map((s, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-stone-900">{s.value}</div>
                <div className="text-xs text-stone-500">{s.label}</div>
              </div>
            ))}
          </div>
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-white rounded-xl border border-stone-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-fuchsia-600">Q{idx + 1}</span>
                <span className="text-sm font-medium text-stone-800">{q.text}</span>
              </div>
              {q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const pct = 10 + Math.floor(Math.random() * 40);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-stone-600 w-28 truncate">{opt}</span>
                        <div className="flex-1 h-4 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                        <span className="text-xs font-bold text-stone-700 w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LivePollPresentation;
