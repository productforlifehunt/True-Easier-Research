import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageCircle, ArrowRight, ChevronUp, Check, SkipForward, ArrowLeft, Settings, Monitor, Smartphone } from 'lucide-react';

/* ────────────────────────────────────────────────────
 * Conversational Survey Mode (Typeform-style)
 * One question at a time with smooth transitions,
 * keyboard navigation, and progress indicator.
 *
 * 对话式调查模式（Typeform风格）
 * 逐题展示，平滑过渡，键盘导航，进度指示器。
 * ──────────────────────────────────────────────────── */

interface ConversationConfig {
  enabled: boolean;
  transitionStyle: 'slide_up' | 'fade' | 'slide_left' | 'typewriter';
  transitionSpeed: number; // ms
  showProgressBar: boolean;
  progressStyle: 'bar' | 'steps' | 'percentage' | 'fraction';
  showQuestionNumber: boolean;
  allowBackNavigation: boolean;
  allowSkip: boolean;
  autoAdvance: boolean; // auto-advance on single-choice selection
  keyboardNav: boolean; // Enter to advance, number keys to select
  welcomeScreen: { enabled: boolean; title: string; titleZh: string; subtitle: string; buttonText: string };
  thankYouScreen: { enabled: boolean; title: string; titleZh: string; subtitle: string; redirectUrl: string };
  backgroundStyle: 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  backgroundGradient: string;
}

interface Props {
  projectId: string;
}

const DEFAULT_CONFIG: ConversationConfig = {
  enabled: false,
  transitionStyle: 'slide_up',
  transitionSpeed: 400,
  showProgressBar: true,
  progressStyle: 'bar',
  showQuestionNumber: true,
  allowBackNavigation: true,
  allowSkip: false,
  autoAdvance: true,
  keyboardNav: true,
  welcomeScreen: { enabled: true, title: 'Welcome to our survey', titleZh: '欢迎参加我们的调查', subtitle: 'It will only take a few minutes', buttonText: 'Start' },
  thankYouScreen: { enabled: true, title: 'Thank you!', titleZh: '谢谢！', subtitle: 'Your response has been recorded', redirectUrl: '' },
  backgroundStyle: 'solid',
  backgroundColor: '#ffffff',
  backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

// Mock questions for preview / 预览用模拟问题
const MOCK_QUESTIONS = [
  { id: 'q1', text: 'How satisfied are you with our product?', textZh: '您对我们的产品满意吗？', type: 'rating' as const },
  { id: 'q2', text: 'Which features do you use most?', textZh: '您最常使用哪些功能？', type: 'multiple_choice' as const, options: ['Dashboard', 'Reports', 'Analytics', 'Settings'] },
  { id: 'q3', text: 'How likely are you to recommend us?', textZh: '您有多大可能推荐我们？', type: 'nps' as const },
  { id: 'q4', text: 'Tell us more about your experience', textZh: '请告诉我们更多关于您的体验', type: 'open_text' as const },
];

const ConversationalSurveyMode: React.FC<Props> = ({ projectId }) => {
  const [config, setConfig] = useState<ConversationConfig>(DEFAULT_CONFIG);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewStep, setPreviewStep] = useState(-1); // -1 = welcome
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [transitioning, setTransitioning] = useState(false);

  const updateConfig = (updates: Partial<ConversationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const goToStep = useCallback((step: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setPreviewStep(step);
      setTransitioning(false);
    }, config.transitionSpeed / 2);
  }, [config.transitionSpeed]);

  const nextStep = () => {
    if (previewStep < MOCK_QUESTIONS.length - 1) goToStep(previewStep + 1);
    else goToStep(MOCK_QUESTIONS.length); // thank you
  };

  const prevStep = () => {
    if (previewStep > (config.welcomeScreen.enabled ? -1 : 0)) goToStep(previewStep - 1);
  };

  // Keyboard navigation / 键盘导航
  useEffect(() => {
    if (!previewActive || !config.keyboardNav) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') nextStep();
      if (e.key === 'Escape') prevStep();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewActive, config.keyboardNav, previewStep]);

  const progress = MOCK_QUESTIONS.length > 0
    ? Math.max(0, Math.min(100, ((previewStep + 1) / MOCK_QUESTIONS.length) * 100))
    : 0;

  const currentQ = previewStep >= 0 && previewStep < MOCK_QUESTIONS.length ? MOCK_QUESTIONS[previewStep] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Conversational Mode / 对话模式</h2>
            <p className="text-xs text-stone-500">Typeform-style one-question-at-a-time experience / Typeform风格的逐题体验</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setPreviewActive(!previewActive); setPreviewStep(config.welcomeScreen.enabled ? -1 : 0); }}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 ${previewActive ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {previewActive ? 'Exit Preview' : 'Preview / 预览'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Settings panel / 设置面板 */}
        <div className="flex-1 space-y-4">
          {/* Enable toggle / 启用开关 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-700">Enable Conversational Mode / 启用对话模式</p>
                <p className="text-xs text-stone-400">Show one question at a time instead of all at once / 逐题显示而非全部展示</p>
              </div>
              <button onClick={() => updateConfig({ enabled: !config.enabled })}
                className={`w-10 h-5 rounded-full transition-colors ${config.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>

          {/* Transition settings / 过渡设置 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">Transition / 过渡效果</h4>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Style / 风格</label>
              <div className="flex gap-1 mt-1">
                {(['slide_up', 'fade', 'slide_left', 'typewriter'] as const).map(s => (
                  <button key={s} onClick={() => updateConfig({ transitionStyle: s })}
                    className={`px-2 py-1 text-[10px] rounded ${config.transitionStyle === s ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Speed / 速度: {config.transitionSpeed}ms</label>
              <input type="range" min={100} max={800} step={50} value={config.transitionSpeed}
                onChange={e => updateConfig({ transitionSpeed: parseInt(e.target.value) })}
                className="w-full mt-1" />
            </div>
          </div>

          {/* Progress settings / 进度设置 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">Progress Indicator / 进度指示器</h4>
            <div className="flex gap-1">
              {(['bar', 'steps', 'percentage', 'fraction'] as const).map(s => (
                <button key={s} onClick={() => updateConfig({ progressStyle: s })}
                  className={`px-2 py-1 text-[10px] rounded ${config.progressStyle === s ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation settings / 导航设置 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">Navigation / 导航</h4>
            {[
              { key: 'allowBackNavigation', label: 'Allow Back / 允许返回' },
              { key: 'allowSkip', label: 'Allow Skip / 允许跳过' },
              { key: 'autoAdvance', label: 'Auto-advance on select / 选择后自动前进' },
              { key: 'keyboardNav', label: 'Keyboard navigation / 键盘导航' },
              { key: 'showQuestionNumber', label: 'Show Q number / 显示题号' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center justify-between">
                <span className="text-xs text-stone-600">{opt.label}</span>
                <button onClick={() => updateConfig({ [opt.key]: !(config as any)[opt.key] })}
                  className={`w-8 h-4 rounded-full transition-colors ${(config as any)[opt.key] ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${(config as any)[opt.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </label>
            ))}
          </div>

          {/* Welcome screen / 欢迎屏幕 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <label className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-500 uppercase">Welcome Screen / 欢迎屏幕</h4>
              <button onClick={() => updateConfig({ welcomeScreen: { ...config.welcomeScreen, enabled: !config.welcomeScreen.enabled } })}
                className={`w-8 h-4 rounded-full transition-colors ${config.welcomeScreen.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.welcomeScreen.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>
            {config.welcomeScreen.enabled && (
              <>
                <input value={config.welcomeScreen.title}
                  onChange={e => updateConfig({ welcomeScreen: { ...config.welcomeScreen, title: e.target.value } })}
                  placeholder="Title (EN)" className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
                <input value={config.welcomeScreen.titleZh}
                  onChange={e => updateConfig({ welcomeScreen: { ...config.welcomeScreen, titleZh: e.target.value } })}
                  placeholder="标题（中文）" className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
                <input value={config.welcomeScreen.buttonText}
                  onChange={e => updateConfig({ welcomeScreen: { ...config.welcomeScreen, buttonText: e.target.value } })}
                  placeholder="Button text" className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
              </>
            )}
          </div>
        </div>

        {/* Preview / 预览 */}
        {previewActive && (
          <div className={`shrink-0 ${previewDevice === 'mobile' ? 'w-[375px]' : 'w-[500px]'}`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-emerald-100 text-emerald-600' : 'text-stone-400'}`}>
                <Monitor size={16} />
              </button>
              <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-emerald-100 text-emerald-600' : 'text-stone-400'}`}>
                <Smartphone size={16} />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-lg"
              style={{ minHeight: previewDevice === 'mobile' ? '667px' : '500px', background: config.backgroundStyle === 'gradient' ? config.backgroundGradient : config.backgroundColor }}>

              {/* Progress bar / 进度条 */}
              {config.showProgressBar && previewStep >= 0 && previewStep < MOCK_QUESTIONS.length && (
                <div className="px-4 pt-4">
                  {config.progressStyle === 'bar' && (
                    <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  {config.progressStyle === 'percentage' && (
                    <p className="text-xs text-stone-400 text-right">{Math.round(progress)}%</p>
                  )}
                  {config.progressStyle === 'fraction' && (
                    <p className="text-xs text-stone-400 text-right">{previewStep + 1} / {MOCK_QUESTIONS.length}</p>
                  )}
                  {config.progressStyle === 'steps' && (
                    <div className="flex gap-1">
                      {MOCK_QUESTIONS.map((_, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full ${i <= previewStep ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content area / 内容区域 */}
              <div className={`flex items-center justify-center px-8 transition-opacity ${transitioning ? 'opacity-0' : 'opacity-100'}`}
                style={{ minHeight: previewDevice === 'mobile' ? '580px' : '440px', transitionDuration: `${config.transitionSpeed / 2}ms` }}>

                {/* Welcome / 欢迎 */}
                {previewStep === -1 && config.welcomeScreen.enabled && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">{config.welcomeScreen.title}</h2>
                    <p className="text-sm text-stone-400 mb-1">{config.welcomeScreen.titleZh}</p>
                    <p className="text-sm text-stone-500 mb-6">{config.welcomeScreen.subtitle}</p>
                    <button onClick={nextStep}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 flex items-center gap-2 mx-auto">
                      {config.welcomeScreen.buttonText} <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* Question / 问题 */}
                {currentQ && (
                  <div className="w-full max-w-md">
                    {config.showQuestionNumber && (
                      <p className="text-xs text-emerald-600 font-semibold mb-2">{previewStep + 1} →</p>
                    )}
                    <h3 className="text-xl font-bold text-stone-800 mb-1">{currentQ.text}</h3>
                    <p className="text-sm text-stone-400 mb-6">{currentQ.textZh}</p>

                    {currentQ.type === 'multiple_choice' && currentQ.options && (
                      <div className="space-y-2">
                        {currentQ.options.map((opt, i) => (
                          <button key={i} onClick={() => { setAnswers(prev => ({ ...prev, [currentQ.id]: opt })); if (config.autoAdvance) setTimeout(nextStep, 300); }}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${answers[currentQ.id] === opt ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                            <span className="w-5 h-5 rounded border border-stone-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {currentQ.type === 'rating' && (
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => { setAnswers(prev => ({ ...prev, [currentQ.id]: n })); if (config.autoAdvance) setTimeout(nextStep, 300); }}
                            className={`w-12 h-12 rounded-xl border text-lg font-bold transition-all ${answers[currentQ.id] === n ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    )}

                    {currentQ.type === 'nps' && (
                      <div className="flex gap-1 justify-center flex-wrap">
                        {Array.from({ length: 11 }, (_, i) => i).map(n => (
                          <button key={n} onClick={() => { setAnswers(prev => ({ ...prev, [currentQ.id]: n })); if (config.autoAdvance) setTimeout(nextStep, 300); }}
                            className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${answers[currentQ.id] === n ? 'bg-emerald-500 border-emerald-500 text-white' : n <= 6 ? 'border-red-200 text-red-400 hover:bg-red-50' : n <= 8 ? 'border-amber-200 text-amber-500 hover:bg-amber-50' : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'}`}>
                            {n}
                          </button>
                        ))}
                        <div className="w-full flex justify-between mt-1">
                          <span className="text-[9px] text-stone-400">Not likely / 不太可能</span>
                          <span className="text-[9px] text-stone-400">Very likely / 非常可能</span>
                        </div>
                      </div>
                    )}

                    {currentQ.type === 'open_text' && (
                      <textarea placeholder="Type your answer... / 输入您的答案..."
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                        rows={4} />
                    )}
                  </div>
                )}

                {/* Thank you / 感谢 */}
                {previewStep >= MOCK_QUESTIONS.length && config.thankYouScreen.enabled && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <Check size={28} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">{config.thankYouScreen.title}</h2>
                    <p className="text-sm text-stone-400 mb-1">{config.thankYouScreen.titleZh}</p>
                    <p className="text-sm text-stone-500">{config.thankYouScreen.subtitle}</p>
                  </div>
                )}
              </div>

              {/* Bottom nav / 底部导航 */}
              {previewStep >= 0 && previewStep < MOCK_QUESTIONS.length && (
                <div className="px-6 pb-6 flex items-center justify-between">
                  {config.allowBackNavigation ? (
                    <button onClick={prevStep} className="p-2 text-stone-400 hover:text-stone-600"><ArrowLeft size={18} /></button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    {config.allowSkip && (
                      <button onClick={nextStep} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                        <SkipForward size={12} /> Skip
                      </button>
                    )}
                    <button onClick={nextStep}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1">
                      OK <Check size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationalSurveyMode;
