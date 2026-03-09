import React, { useState, useMemo } from 'react';
import { MousePointer, Clock, Target, Image, Plus, Trash2, Play, Eye, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';

/* ────────────────────────────────────────────────────
 * Prototype Testing Engine
 * Combines First-Click Test, 5-Second Test, and
 * Task-Flow Testing into a single research instrument.
 *
 * 原型测试引擎
 * 将首次点击测试、5秒测试和任务流测试
 * 组合为一个研究工具。
 * ──────────────────────────────────────────────────── */

interface Screen {
  id: string;
  name: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

interface Hotspot {
  id: string;
  x: number; y: number; w: number; h: number;
  label: string;
  isCorrect: boolean;
  nextScreenId?: string;
}

interface TestTask {
  id: string;
  type: 'first_click' | 'five_second' | 'task_flow';
  title: string;
  titleZh: string;
  description: string;
  screenIds: string[];
  successScreenId?: string;
  timeLimit?: number; // seconds
  followUpQuestions: string[];
}

interface TestResult {
  taskId: string;
  participantId: string;
  clicks: { x: number; y: number; screenId: string; timestamp: number }[];
  timeMs: number;
  success: boolean;
  path: string[];
}

interface Props {
  projectId: string;
}

const PrototypeTestingEngine: React.FC<Props> = ({ projectId }) => {
  const [screens, setScreens] = useState<Screen[]>([
    { id: 's1', name: 'Home Page', imageUrl: '', hotspots: [] },
    { id: 's2', name: 'Product Page', imageUrl: '', hotspots: [] },
    { id: 's3', name: 'Checkout', imageUrl: '', hotspots: [] },
  ]);
  const [tasks, setTasks] = useState<TestTask[]>([]);
  const [activeTab, setActiveTab] = useState<'screens' | 'tasks' | 'results'>('screens');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);

  // Mock results for demonstration / 模拟结果用于演示
  const mockResults: TestResult[] = useMemo(() => [
    { taskId: 't1', participantId: 'p1', clicks: [{ x: 45, y: 32, screenId: 's1', timestamp: 1200 }], timeMs: 3400, success: true, path: ['s1', 's2', 's3'] },
    { taskId: 't1', participantId: 'p2', clicks: [{ x: 72, y: 18, screenId: 's1', timestamp: 800 }, { x: 45, y: 32, screenId: 's1', timestamp: 2100 }], timeMs: 5600, success: true, path: ['s1', 's1', 's2', 's3'] },
    { taskId: 't1', participantId: 'p3', clicks: [{ x: 10, y: 80, screenId: 's1', timestamp: 1500 }], timeMs: 8200, success: false, path: ['s1', 's2'] },
  ], []);

  const addScreen = () => {
    setScreens(prev => [...prev, { id: `s_${Date.now()}`, name: `Screen ${prev.length + 1}`, imageUrl: '', hotspots: [] }]);
  };

  const updateScreen = (id: string, updates: Partial<Screen>) => {
    setScreens(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeScreen = (id: string) => setScreens(prev => prev.filter(s => s.id !== id));

  const addHotspot = (screenId: string) => {
    setScreens(prev => prev.map(s => s.id === screenId ? {
      ...s, hotspots: [...s.hotspots, { id: `h_${Date.now()}`, x: 20, y: 20, w: 15, h: 10, label: 'Click target', isCorrect: false }]
    } : s));
  };

  const addTask = (type: TestTask['type']) => {
    const labels: Record<string, { en: string; zh: string }> = {
      first_click: { en: 'First Click Test', zh: '首次点击测试' },
      five_second: { en: '5-Second Test', zh: '5秒测试' },
      task_flow: { en: 'Task Flow Test', zh: '任务流测试' },
    };
    const t: TestTask = {
      id: `t_${Date.now()}`, type, title: labels[type].en, titleZh: labels[type].zh,
      description: '', screenIds: screens.length > 0 ? [screens[0].id] : [],
      timeLimit: type === 'five_second' ? 5 : undefined, followUpQuestions: [],
    };
    setTasks(prev => [...prev, t]);
    setEditingTask(t.id);
  };

  const updateTask = (id: string, updates: Partial<TestTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (editingTask === id) setEditingTask(null);
  };

  const taskTypeIcon = (type: TestTask['type']) => {
    switch (type) {
      case 'first_click': return <MousePointer size={14} />;
      case 'five_second': return <Clock size={14} />;
      case 'task_flow': return <ArrowRight size={14} />;
    }
  };

  const taskTypeColor = (type: TestTask['type']) => {
    switch (type) {
      case 'first_click': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'five_second': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'task_flow': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  // Compute result stats / 计算结果统计
  const resultStats = useMemo(() => {
    const total = mockResults.length;
    const success = mockResults.filter(r => r.success).length;
    const avgTime = total > 0 ? Math.round(mockResults.reduce((a, r) => a + r.timeMs, 0) / total) : 0;
    const avgClicks = total > 0 ? (mockResults.reduce((a, r) => a + r.clicks.length, 0) / total).toFixed(1) : '0';
    return { total, success, successRate: total > 0 ? Math.round((success / total) * 100) : 0, avgTime, avgClicks };
  }, [mockResults]);

  const editTask = tasks.find(t => t.id === editingTask);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Prototype Testing Engine / 原型测试引擎</h2>
            <p className="text-xs text-stone-500">First-Click, 5-Second, and Task-Flow testing / 首次点击、5秒和任务流测试</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs / 子标签 */}
      <div className="flex gap-1 border-b border-stone-200">
        {([['screens', 'Screens / 屏幕'], ['tasks', 'Tests / 测试'], ['results', 'Results / 结果']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* SCREENS TAB / 屏幕标签 */}
      {activeTab === 'screens' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {screens.map(screen => (
              <div key={screen.id} className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedScreen === screen.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-stone-300'}`}
                onClick={() => setSelectedScreen(screen.id)}>
                {/* Screen preview area / 屏幕预览区域 */}
                <div className="aspect-video bg-stone-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {screen.imageUrl ? (
                    <img src={screen.imageUrl} alt={screen.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Image size={24} className="mx-auto text-stone-300 mb-1" />
                      <p className="text-[10px] text-stone-400">Upload image / 上传图片</p>
                    </div>
                  )}
                  {/* Hotspot indicators / 热区指示器 */}
                  {screen.hotspots.map(h => (
                    <div key={h.id} className="absolute border-2 border-blue-400 bg-blue-100/30 rounded"
                      style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <input value={screen.name} onChange={e => { e.stopPropagation(); updateScreen(screen.id, { name: e.target.value }); }}
                    className="text-sm font-semibold text-stone-700 bg-transparent border-none outline-none flex-1" />
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); addHotspot(screen.id); }}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Add hotspot">
                      <Target size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); removeScreen(screen.id); }}
                      className="p-1 text-stone-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">{screen.hotspots.length} hotspots / 热区</p>
              </div>
            ))}

            <button onClick={addScreen}
              className="aspect-video bg-white rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
              <Plus size={20} className="text-stone-400 mb-1" />
              <span className="text-xs text-stone-500">Add Screen / 添加屏幕</span>
            </button>
          </div>
        </div>
      )}

      {/* TASKS TAB / 测试标签 */}
      {activeTab === 'tasks' && (
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {/* Add test buttons / 添加测试按钮 */}
            <div className="flex gap-2">
              <button onClick={() => addTask('first_click')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200">
                <MousePointer size={14} /> First Click / 首次点击
              </button>
              <button onClick={() => addTask('five_second')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200">
                <Clock size={14} /> 5-Second / 5秒
              </button>
              <button onClick={() => addTask('task_flow')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200">
                <ArrowRight size={14} /> Task Flow / 任务流
              </button>
            </div>

            {/* Task list / 任务列表 */}
            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-8 text-center">
                <Target size={28} className="mx-auto text-stone-300 mb-2" />
                <p className="text-sm text-stone-500">Add a test to get started / 添加测试以开始</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} onClick={() => setEditingTask(task.id)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${editingTask === task.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-stone-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded ${taskTypeColor(task.type)}`}>{taskTypeIcon(task.type)}</span>
                        <div>
                          <h4 className="text-sm font-semibold text-stone-700">{task.title}</h4>
                          <p className="text-[10px] text-stone-400">{task.titleZh} • {task.screenIds.length} screens</p>
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeTask(task.id); }}
                        className="p-1 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task editor panel / 任务编辑面板 */}
          {editTask && (
            <div className="w-72 bg-white rounded-xl border border-stone-200 p-4 space-y-4 shrink-0 self-start sticky top-20">
              <h4 className="text-sm font-bold text-stone-700">Test Config / 测试配置</h4>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Title (EN)</label>
                <input value={editTask.title} onChange={e => updateTask(editTask.id, { title: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Title (ZH)</label>
                <input value={editTask.titleZh} onChange={e => updateTask(editTask.id, { titleZh: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Instructions / 说明</label>
                <textarea value={editTask.description} onChange={e => updateTask(editTask.id, { description: e.target.value })}
                  rows={3} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg resize-none" />
              </div>
              {editTask.type === 'five_second' && (
                <div>
                  <label className="text-[10px] font-semibold text-stone-500 uppercase">Display Time (seconds) / 显示时间</label>
                  <input type="number" value={editTask.timeLimit || 5}
                    onChange={e => updateTask(editTask.id, { timeLimit: parseInt(e.target.value) || 5 })}
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
                </div>
              )}
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Screens / 屏幕</label>
                <div className="mt-1 space-y-1">
                  {screens.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={editTask.screenIds.includes(s.id)}
                        onChange={e => {
                          const ids = e.target.checked ? [...editTask.screenIds, s.id] : editTask.screenIds.filter(id => id !== s.id);
                          updateTask(editTask.id, { screenIds: ids });
                        }}
                        className="rounded border-stone-300" />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Follow-up Questions / 后续问题</label>
                <button onClick={() => updateTask(editTask.id, { followUpQuestions: [...editTask.followUpQuestions, ''] })}
                  className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus size={12} /> Add Question / 添加问题
                </button>
                {editTask.followUpQuestions.map((q, i) => (
                  <input key={i} value={q} onChange={e => {
                    const qs = [...editTask.followUpQuestions]; qs[i] = e.target.value;
                    updateTask(editTask.id, { followUpQuestions: qs });
                  }} placeholder={`Question ${i + 1}...`}
                    className="w-full mt-1 px-2 py-1.5 text-xs border border-stone-200 rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULTS TAB / 结果标签 */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* KPI cards / KPI卡片 */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Participants / 参与者', value: resultStats.total, color: 'text-blue-600' },
              { label: 'Success Rate / 成功率', value: `${resultStats.successRate}%`, color: 'text-emerald-600' },
              { label: 'Avg Time / 平均时间', value: `${(resultStats.avgTime / 1000).toFixed(1)}s`, color: 'text-purple-600' },
              { label: 'Avg Clicks / 平均点击', value: resultStats.avgClicks, color: 'text-amber-600' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-[10px] text-stone-500 uppercase font-semibold">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Click heatmap placeholder / 点击热图占位 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h4 className="text-sm font-semibold text-stone-700 mb-3">Click Heatmap / 点击热图</h4>
            <div className="aspect-video bg-stone-50 rounded-lg relative">
              {/* Render click dots / 渲染点击点 */}
              {mockResults.flatMap(r => r.clicks).map((click, i) => (
                <div key={i} className="absolute w-4 h-4 rounded-full bg-red-500/40 border border-red-500/60 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${click.x}%`, top: `${click.y}%` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-stone-400 bg-white/80 px-3 py-1 rounded">Upload screen image to see click overlay / 上传屏幕图片查看点击叠加</p>
              </div>
            </div>
          </div>

          {/* Individual results / 个人结果 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h4 className="text-sm font-semibold text-stone-700 mb-3">Individual Results / 个人结果</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-2 text-xs text-stone-500 font-semibold">Participant</th>
                    <th className="text-left py-2 text-xs text-stone-500 font-semibold">Clicks</th>
                    <th className="text-left py-2 text-xs text-stone-500 font-semibold">Time</th>
                    <th className="text-left py-2 text-xs text-stone-500 font-semibold">Path</th>
                    <th className="text-left py-2 text-xs text-stone-500 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {mockResults.map((r, i) => (
                    <tr key={i} className="border-b border-stone-50">
                      <td className="py-2 text-stone-700">{r.participantId}</td>
                      <td className="py-2 text-stone-600">{r.clicks.length}</td>
                      <td className="py-2 text-stone-600">{(r.timeMs / 1000).toFixed(1)}s</td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {r.path.map((p, j) => (
                            <React.Fragment key={j}>
                              {j > 0 && <ArrowRight size={8} className="text-stone-300" />}
                              <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 rounded text-stone-500">{p}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {r.success ? '✓ Pass' : '✗ Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrototypeTestingEngine;
