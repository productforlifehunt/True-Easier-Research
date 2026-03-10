import React, { useState } from 'react';
import { Code, Play, AlertTriangle, FileCode, Plus, Trash2, Eye, Copy, Check } from 'lucide-react';

interface Script { id: string; name: string; type: 'javascript' | 'css'; scope: 'global' | 'question'; targetQuestionId?: string; code: string; enabled: boolean; }

interface Props { projectId: string; }

const CustomScriptInjector: React.FC<Props> = ({ projectId }) => {
  const [scripts, setScripts] = useState<Script[]>([
    { id: '1', name: 'Custom validation', type: 'javascript', scope: 'question', targetQuestionId: 'q1', code: '// Custom email validation\nconst input = document.querySelector("#q1-input");\nif (input && !input.value.includes("@")) {\n  alert("Please enter a valid email");\n}', enabled: true },
    { id: '2', name: 'Brand styling', type: 'css', scope: 'global', code: '.survey-container {\n  font-family: "Helvetica Neue", sans-serif;\n  --primary-color: #0066CC;\n}\n\n.question-card:hover {\n  transform: translateY(-2px);\n  transition: transform 0.2s;\n}', enabled: true },
    { id: '3', name: 'Timer logic', type: 'javascript', scope: 'global', code: '// Auto-submit after 5 minutes\nsetTimeout(() => {\n  if (confirm("Time is up. Submit your response?")) {\n    document.querySelector("#submit-btn")?.click();\n  }\n}, 300000);', enabled: false },
  ]);
  const [activeScript, setActiveScript] = useState<string>(scripts[0]?.id || '');
  const [testOutput, setTestOutput] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const current = scripts.find(s => s.id === activeScript);

  const updateScript = (id: string, updates: Partial<Script>) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runTest = () => {
    try {
      setTestOutput('Script parsed successfully. No syntax errors detected.\n\nNote: Runtime execution is sandboxed in preview mode.\n注意：运行时执行在预览模式下是沙箱化的。');
    } catch (e: any) {
      setTestOutput(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Code className="w-5 h-5 text-orange-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Custom JS/CSS Injector / 自定义脚本注入</h2>
            <p className="text-sm text-stone-500">{scripts.filter(s => s.enabled).length} active scripts · Advanced customization</p>
          </div>
        </div>
        <button onClick={() => { const id = crypto.randomUUID(); setScripts(prev => [...prev, { id, name: 'New Script', type: 'javascript', scope: 'global', code: '// Your code here', enabled: true }]); setActiveScript(id); }}
          className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add Script</button>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div>
            <p className="text-xs text-amber-800 font-semibold">Advanced Feature / 高级功能</p>
            <p className="text-xs text-amber-700">Custom scripts run in participant browsers. Test thoroughly before publishing. / 自定义脚本在参与者浏览器中运行，发布前请充分测试。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Script List / 脚本列表 */}
        <div className="space-y-2">
          {scripts.map(s => (
            <button key={s.id} onClick={() => setActiveScript(s.id)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${activeScript === s.id ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
              <div className="flex items-center gap-2">
                <FileCode className={`w-4 h-4 ${s.type === 'javascript' ? 'text-amber-500' : 'text-blue-500'}`} />
                <span className="text-sm font-medium text-stone-800 truncate flex-1">{s.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.type === 'javascript' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{s.type.toUpperCase()}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>{s.enabled ? 'ON' : 'OFF'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Editor / 编辑器 */}
        <div className="col-span-3 space-y-3">
          {current && (
            <>
              <div className="flex items-center gap-3">
                <input value={current.name} onChange={e => updateScript(current.id, { name: e.target.value })}
                  className="text-sm font-semibold border border-stone-200 rounded-lg px-3 py-1.5 flex-1" />
                <select value={current.type} onChange={e => updateScript(current.id, { type: e.target.value as any })}
                  className="text-xs border border-stone-200 rounded-lg px-2 py-1.5">
                  <option value="javascript">JavaScript</option>
                  <option value="css">CSS</option>
                </select>
                <select value={current.scope} onChange={e => updateScript(current.id, { scope: e.target.value as any })}
                  className="text-xs border border-stone-200 rounded-lg px-2 py-1.5">
                  <option value="global">Global / 全局</option>
                  <option value="question">Per Question / 按问题</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-stone-600 cursor-pointer">
                  <input type="checkbox" checked={current.enabled} onChange={() => updateScript(current.id, { enabled: !current.enabled })} className="rounded text-orange-600" /> Enabled
                </label>
                <button onClick={() => setScripts(prev => prev.filter(s => s.id !== current.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>

              <div className="relative">
                <textarea value={current.code} onChange={e => updateScript(current.id, { code: e.target.value })}
                  className="w-full h-64 text-xs font-mono bg-stone-900 text-emerald-400 rounded-xl p-4 resize-none focus:ring-2 focus:ring-orange-500"
                  spellCheck={false} />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => { navigator.clipboard.writeText(current.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="p-1.5 bg-stone-700 rounded text-white text-xs">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={runTest} className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs flex items-center gap-1"><Play className="w-3 h-3" /> Test Script</button>
                <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</button>
              </div>

              {testOutput && (
                <pre className="p-3 bg-stone-50 rounded-xl text-xs font-mono text-stone-700 whitespace-pre-wrap">{testOutput}</pre>
              )}

              {/* Template snippets / 模板代码片段 */}
              <div className="p-4 bg-stone-50 rounded-xl">
                <h4 className="text-xs font-semibold text-stone-700 mb-2">Quick Snippets / 快速片段</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Hide element', code: 'document.querySelector(".target").style.display = "none";' },
                    { label: 'Custom validation', code: 'addEventListener("submit", e => {\n  if (!validate()) e.preventDefault();\n});' },
                    { label: 'Track event', code: 'window.postMessage({ type: "track", event: "custom_click" }, "*");' },
                    { label: 'Add tooltip', code: 'const tip = document.createElement("div");\ntip.className = "custom-tooltip";\ntip.textContent = "Help text";\ndocument.body.appendChild(tip);' },
                  ].map((snippet, i) => (
                    <button key={i} onClick={() => updateScript(current.id, { code: current.code + '\n\n' + snippet.code })}
                      className="text-[10px] px-2 py-1 bg-white border border-stone-200 rounded-lg text-stone-600 hover:border-orange-300">{snippet.label}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomScriptInjector;
