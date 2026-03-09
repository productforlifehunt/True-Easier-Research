import React, { useState } from 'react';
import { MousePointer2, Code, Eye, Settings, Zap, Clock, ArrowDown, X, Copy, Check } from 'lucide-react';

interface TriggerRule {
  id: string;
  type: 'scroll_percent' | 'time_on_page' | 'exit_intent' | 'click_element' | 'page_url' | 'visit_count';
  value: string;
  enabled: boolean;
}

interface Props { projectId: string; }

const InterceptSurveyWidget: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'config' | 'triggers' | 'embed' | 'preview'>('config');
  const [widgetType, setWidgetType] = useState<'popup' | 'slide_in' | 'bottom_bar' | 'embedded'>('slide_in');
  const [widgetPosition, setWidgetPosition] = useState<'bottom_right' | 'bottom_left' | 'top_right' | 'center'>('bottom_right');
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>([
    { id: '1', type: 'scroll_percent', value: '50', enabled: true },
    { id: '2', type: 'time_on_page', value: '30', enabled: true },
    { id: '3', type: 'exit_intent', value: 'true', enabled: false },
  ]);
  const [showPreviewWidget, setShowPreviewWidget] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayFrequency, setDisplayFrequency] = useState<'once' | 'session' | 'always'>('once');
  const [samplingRate, setSamplingRate] = useState(100);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  const embedCode = `<!-- EasyResearch Intercept Widget -->
<script>
(function(w,d,s,o){
  var j=d.createElement(s);j.async=true;
  j.src='https://cdn.easyresearch.io/widget.js';
  j.dataset.projectId='${projectId}';
  j.dataset.type='${widgetType}';
  j.dataset.position='${widgetPosition}';
  j.dataset.color='${primaryColor}';
  j.dataset.frequency='${displayFrequency}';
  j.dataset.sampling='${samplingRate}';
  d.head.appendChild(j);
})(window,document,'script');
</script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><MousePointer2 className="w-5 h-5 text-violet-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Intercept Surveys / 拦截式调查</h2>
            <p className="text-sm text-stone-500">In-product widget with trigger rules / 产品内小部件与触发规则</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['config', 'triggers', 'embed', 'preview'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'config' ? '⚙️ Config' : v === 'triggers' ? '⚡ Triggers' : v === 'embed' ? '< /> Embed' : '👁️ Preview'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'config' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Widget Type / 小部件类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { type: 'popup' as const, label: 'Modal Popup', icon: '🪟', desc: 'Center overlay / 居中弹窗' },
                { type: 'slide_in' as const, label: 'Slide-in', icon: '➡️', desc: 'Corner panel / 角落面板' },
                { type: 'bottom_bar' as const, label: 'Bottom Bar', icon: '📏', desc: 'Fixed bottom strip / 固定底部条' },
                { type: 'embedded' as const, label: 'Embedded', icon: '📎', desc: 'Inline in page / 页面内嵌' },
              ]).map(w => (
                <button key={w.type} onClick={() => setWidgetType(w.type)}
                  className={`p-3 rounded-xl border-2 text-left ${widgetType === w.type ? 'border-violet-500 bg-violet-50' : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className="text-xl mb-1">{w.icon}</div>
                  <div className="text-sm font-semibold text-stone-800">{w.label}</div>
                  <div className="text-xs text-stone-500">{w.desc}</div>
                </button>
              ))}
            </div>

            <h3 className="font-semibold text-stone-800">Position / 位置</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['bottom_right', 'bottom_left', 'top_right', 'center'] as const).map(pos => (
                <button key={pos} onClick={() => setWidgetPosition(pos)}
                  className={`px-3 py-2 text-xs rounded-lg ${widgetPosition === pos ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  {pos.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Display Rules / 显示规则</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Display Frequency / 显示频率</label>
                <select value={displayFrequency} onChange={e => setDisplayFrequency(e.target.value as any)}
                  className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                  <option value="once">Once per visitor / 每位访客一次</option>
                  <option value="session">Once per session / 每次会话一次</option>
                  <option value="always">Every page load / 每次加载</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Sampling Rate / 采样率: {samplingRate}%</label>
                <input type="range" min={1} max={100} value={samplingRate} onChange={e => setSamplingRate(Number(e.target.value))}
                  className="w-full accent-violet-600" />
              </div>
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Brand Color / 品牌颜色</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="text-sm font-mono border border-stone-200 rounded-lg px-2 py-1" />
                </div>
              </div>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl">
              <h4 className="text-xs font-semibold text-violet-700 mb-2">Targeting / 定向</h4>
              {['Page URL contains...', 'User property equals...', 'Device type is...'].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-violet-600 py-1"><Zap className="w-3 h-3" /> {t}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'triggers' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-stone-800">Trigger Rules / 触发规则</h3>
          <p className="text-sm text-stone-500">Widget shows when ANY enabled rule fires (OR logic) / 任一启用规则触发时显示（OR逻辑）</p>
          <div className="space-y-3">
            {triggerRules.map(rule => (
              <div key={rule.id} className={`p-4 rounded-xl border-2 transition-all ${rule.enabled ? 'border-violet-200 bg-white' : 'border-stone-200 bg-stone-50 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={rule.enabled} onChange={() => setTriggerRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                    className="rounded text-violet-600" />
                  <div className="flex-1">
                    <select value={rule.type} onChange={e => setTriggerRules(prev => prev.map(r => r.id === rule.id ? { ...r, type: e.target.value as any } : r))}
                      className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 mr-2">
                      <option value="scroll_percent">Scroll Percentage / 滚动百分比</option>
                      <option value="time_on_page">Time on Page / 页面停留时间</option>
                      <option value="exit_intent">Exit Intent / 退出意图</option>
                      <option value="click_element">Click Element / 点击元素</option>
                      <option value="page_url">Page URL Match / 页面URL匹配</option>
                      <option value="visit_count">Visit Count / 访问次数</option>
                    </select>
                    {rule.type !== 'exit_intent' && (
                      <input value={rule.value} onChange={e => setTriggerRules(prev => prev.map(r => r.id === rule.id ? { ...r, value: e.target.value } : r))}
                        className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 w-24" placeholder="Value" />
                    )}
                  </div>
                  <button onClick={() => setTriggerRules(prev => prev.filter(r => r.id !== rule.id))} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="mt-2 text-xs text-stone-500">
                  {rule.type === 'scroll_percent' && `Triggers when user scrolls past ${rule.value}% / 用户滚动超过${rule.value}%时触发`}
                  {rule.type === 'time_on_page' && `Triggers after ${rule.value} seconds on page / 页面停留${rule.value}秒后触发`}
                  {rule.type === 'exit_intent' && 'Triggers when cursor moves to close/leave / 鼠标移向关闭/离开时触发'}
                  {rule.type === 'click_element' && `Triggers on click of CSS selector: ${rule.value}`}
                  {rule.type === 'page_url' && `Triggers on pages matching: ${rule.value}`}
                  {rule.type === 'visit_count' && `Triggers on visit #${rule.value}`}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setTriggerRules(prev => [...prev, { id: crypto.randomUUID(), type: 'scroll_percent', value: '75', enabled: true }])}
            className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800"><Zap className="w-4 h-4" /> Add Trigger Rule / 添加触发规则</button>
        </div>
      )}

      {activeView === 'embed' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-stone-800">Embed Code / 嵌入代码</h3>
          <p className="text-sm text-stone-500">Add this snippet to your website's {'<head>'} tag / 将此代码添加到网站的 {'<head>'} 标签中</p>
          <div className="relative">
            <pre className="p-4 bg-stone-900 text-emerald-400 rounded-xl text-xs overflow-x-auto font-mono">{embedCode}</pre>
            <button onClick={copyEmbed} className="absolute top-3 right-3 px-2 py-1 bg-stone-700 text-white rounded text-xs flex items-center gap-1">
              {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="text-sm font-semibold text-amber-800 mb-1">⚠️ Important Notes / 重要说明</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Place the script in {'<head>'} for exit intent detection / 放在head中以检测退出意图</li>
              <li>• The widget loads asynchronously (no performance impact) / 小部件异步加载（无性能影响）</li>
              <li>• Responses are linked to your project automatically / 响应自动关联到项目</li>
            </ul>
          </div>
        </div>
      )}

      {activeView === 'preview' && (
        <div className="relative min-h-[500px] bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
          <div className="p-6">
            <div className="h-4 w-3/4 bg-stone-200 rounded mb-3" />
            <div className="h-3 w-full bg-stone-100 rounded mb-2" />
            <div className="h-3 w-5/6 bg-stone-100 rounded mb-2" />
            <div className="h-3 w-2/3 bg-stone-100 rounded mb-6" />
            <div className="h-40 bg-stone-200 rounded-xl mb-4" />
            <div className="h-3 w-full bg-stone-100 rounded mb-2" />
            <div className="h-3 w-4/5 bg-stone-100 rounded" />
          </div>
          {!showPreviewWidget && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={() => setShowPreviewWidget(true)} className="px-6 py-3 bg-violet-600 text-white rounded-xl shadow-lg hover:bg-violet-700 flex items-center gap-2">
                <Eye className="w-5 h-5" /> Simulate Trigger / 模拟触发
              </button>
            </div>
          )}
          {showPreviewWidget && widgetType === 'slide_in' && (
            <div className={`absolute ${widgetPosition.includes('bottom') ? 'bottom-4' : 'top-4'} ${widgetPosition.includes('right') ? 'right-4' : 'left-4'} w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-5`}>
              <div className="p-4" style={{ borderTop: `3px solid ${primaryColor}` }}>
                <button onClick={() => setShowPreviewWidget(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
                <h3 className="font-bold text-stone-900 text-sm mb-1">Quick Feedback / 快速反馈</h3>
                <p className="text-xs text-stone-500 mb-3">How would you rate your experience? / 您如何评价您的体验？</p>
                <div className="flex gap-2 mb-3">{['😡', '😕', '😐', '🙂', '😍'].map((e, i) => <button key={i} className="text-2xl hover:scale-125 transition-transform">{e}</button>)}</div>
                <textarea placeholder="Any additional feedback? / 任何其他反馈？" rows={2} className="w-full text-xs border border-stone-200 rounded-lg p-2 mb-2" />
                <button className="w-full py-2 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: primaryColor }}>Submit / 提交</button>
              </div>
            </div>
          )}
          {showPreviewWidget && widgetType === 'bottom_bar' && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg p-3 flex items-center justify-between animate-in slide-in-from-bottom-5">
              <p className="text-sm font-medium text-stone-800">📋 Got 30 seconds? Help us improve! / 有30秒吗？帮我们改进！</p>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: primaryColor }}>Take Survey</button>
                <button onClick={() => setShowPreviewWidget(false)} className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700">Dismiss</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterceptSurveyWidget;
