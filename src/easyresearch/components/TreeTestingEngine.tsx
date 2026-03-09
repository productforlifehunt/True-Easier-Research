import React, { useState } from 'react';
import { GitBranch, Plus, Trash2, Play, BarChart3, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface TreeNode { id: string; label: string; children: TreeNode[]; }
interface Task { id: string; instruction: string; correctNodeId: string; }
interface TaskResult { taskId: string; participantId: string; path: string[]; success: boolean; direct: boolean; duration: number; }

interface Props { projectId: string; }

const TreeTestingEngine: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'setup' | 'preview' | 'results'>('setup');
  const [tree, setTree] = useState<TreeNode[]>([
    { id: '1', label: 'Home', children: [
      { id: '1-1', label: 'Products', children: [
        { id: '1-1-1', label: 'Software', children: [] },
        { id: '1-1-2', label: 'Hardware', children: [] },
      ]},
      { id: '1-2', label: 'Support', children: [
        { id: '1-2-1', label: 'FAQ', children: [] },
        { id: '1-2-2', label: 'Contact Us', children: [] },
        { id: '1-2-3', label: 'Documentation', children: [] },
      ]},
      { id: '1-3', label: 'About', children: [
        { id: '1-3-1', label: 'Team', children: [] },
        { id: '1-3-2', label: 'Careers', children: [] },
      ]},
    ]},
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', instruction: 'Find the FAQ page', correctNodeId: '1-2-1' },
    { id: 't2', instruction: 'Find information about the team', correctNodeId: '1-3-1' },
    { id: 't3', instruction: 'Browse software products', correctNodeId: '1-1-1' },
  ]);
  const [newTaskInstruction, setNewTaskInstruction] = useState('');
  const [previewExpandedNodes, setPreviewExpandedNodes] = useState<Set<string>>(new Set());
  const [previewCurrentTask, setPreviewCurrentTask] = useState(0);
  const [treeInput, setTreeInput] = useState('');

  // Mock results / 模拟结果
  const mockResults: TaskResult[] = tasks.flatMap(task =>
    Array.from({ length: 20 }, (_, i) => ({
      taskId: task.id,
      participantId: `P${i + 1}`,
      path: ['Home', i % 3 === 0 ? 'Products' : 'Support', task.instruction.includes('FAQ') ? 'FAQ' : 'Team'],
      success: Math.random() > 0.3,
      direct: Math.random() > 0.5,
      duration: 5 + Math.floor(Math.random() * 30),
    }))
  );

  const getTaskStats = (taskId: string) => {
    const results = mockResults.filter(r => r.taskId === taskId);
    const total = results.length;
    const successes = results.filter(r => r.success).length;
    const directs = results.filter(r => r.success && r.direct).length;
    return {
      successRate: total ? Math.round((successes / total) * 100) : 0,
      directnessRate: successes ? Math.round((directs / successes) * 100) : 0,
      avgTime: total ? Math.round(results.reduce((s, r) => s + r.duration, 0) / total) : 0,
      total,
    };
  };

  const renderTreeEditor = (nodes: TreeNode[], depth = 0): React.ReactNode => (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-stone-200 pl-3' : ''}>
      {nodes.map(node => (
        <div key={node.id} className="my-1">
          <div className="flex items-center gap-2 group p-2 rounded-lg hover:bg-stone-50">
            <span className="text-xs text-stone-400">{node.children.length > 0 ? '📁' : '📄'}</span>
            <span className="text-sm font-medium text-stone-800 flex-1">{node.label}</span>
            <button className="opacity-0 group-hover:opacity-100 text-xs text-indigo-600 hover:text-indigo-800">+ Child</button>
            <button className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
          </div>
          {node.children.length > 0 && renderTreeEditor(node.children, depth + 1)}
        </div>
      ))}
    </div>
  );

  const renderTreePreview = (nodes: TreeNode[], depth = 0): React.ReactNode => (
    <div className={depth > 0 ? 'ml-4' : ''}>
      {nodes.map(node => (
        <div key={node.id}>
          <button onClick={() => {
            const next = new Set(previewExpandedNodes);
            next.has(node.id) ? next.delete(node.id) : next.add(node.id);
            setPreviewExpandedNodes(next);
          }} className={`w-full text-left p-2.5 my-0.5 rounded-lg text-sm transition-all ${node.children.length > 0 ? 'font-medium text-stone-800 hover:bg-indigo-50 hover:text-indigo-700' : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer'}`}>
            {node.children.length > 0 ? (previewExpandedNodes.has(node.id) ? '▼ ' : '▶ ') : '  · '}
            {node.label}
          </button>
          {previewExpandedNodes.has(node.id) && node.children.length > 0 && renderTreePreview(node.children, depth + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><GitBranch className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Tree Testing Engine / 树状测试引擎</h2>
            <p className="text-sm text-stone-500">{tasks.length} tasks · {tree[0]?.children.length || 0} top-level nodes</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['setup', 'preview', 'results'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'setup' ? '⚙️ Setup' : v === 'preview' ? '👁️ Preview' : '📊 Results'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'setup' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Tree Structure / 树结构 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800">Information Architecture / 信息架构</h3>
            <div className="p-4 bg-white rounded-xl border border-stone-200 max-h-[500px] overflow-y-auto">
              {renderTreeEditor(tree)}
            </div>
            <div className="p-3 bg-stone-50 rounded-xl">
              <p className="text-xs text-stone-500 mb-2">Paste tree structure (indent with tabs) / 粘贴树结构（用Tab缩进）:</p>
              <textarea value={treeInput} onChange={e => setTreeInput(e.target.value)} rows={4} placeholder="Home&#10;  Products&#10;    Software&#10;    Hardware&#10;  Support"
                className="w-full text-xs font-mono border border-stone-200 rounded-lg p-2" />
              <button className="mt-2 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg">Parse & Import</button>
            </div>
          </div>

          {/* Tasks / 任务 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800">Tasks ({tasks.length})</h3>
            <div className="flex gap-2">
              <input value={newTaskInstruction} onChange={e => setNewTaskInstruction(e.target.value)}
                placeholder="Task instruction, e.g. 'Find the FAQ page'"
                className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              <button onClick={() => { if (newTaskInstruction.trim()) { setTasks(prev => [...prev, { id: crypto.randomUUID(), instruction: newTaskInstruction.trim(), correctNodeId: '' }]); setNewTaskInstruction(''); }}}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {tasks.map((task, idx) => {
                const stats = getTaskStats(task.id);
                return (
                  <div key={task.id} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-emerald-600 mt-0.5">T{idx + 1}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-stone-800">{task.instruction}</div>
                        <div className="text-xs text-stone-500 mt-1">Correct answer: <span className="font-mono text-emerald-600">{task.correctNodeId || 'Not set'}</span></div>
                      </div>
                      <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {mockResults.length > 0 && (
                      <div className="flex gap-4 text-xs">
                        <span className="text-emerald-600">✓ {stats.successRate}% success</span>
                        <span className="text-blue-600">↗ {stats.directnessRate}% direct</span>
                        <span className="text-stone-500">⏱ {stats.avgTime}s avg</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'preview' && (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl border border-stone-200">
          <div className="text-center mb-6">
            <div className="text-xs text-stone-400 mb-1">Task {previewCurrentTask + 1} of {tasks.length}</div>
            <div className="h-1 bg-stone-100 rounded-full mb-4"><div className="h-1 bg-emerald-500 rounded-full transition-all" style={{ width: `${((previewCurrentTask + 1) / tasks.length) * 100}%` }} /></div>
            <p className="text-lg font-semibold text-stone-900">{tasks[previewCurrentTask]?.instruction}</p>
            <p className="text-sm text-stone-500 mt-1">Click where you would find this / 点击你认为可以找到的位置</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-4">{renderTreePreview(tree)}</div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setPreviewCurrentTask(Math.max(0, previewCurrentTask - 1))} disabled={previewCurrentTask === 0}
              className="text-xs px-3 py-1.5 bg-stone-100 rounded-lg disabled:opacity-50">← Previous</button>
            <button className="text-xs px-3 py-1.5 bg-stone-200 rounded-lg text-stone-600">Skip Task</button>
            <button onClick={() => setPreviewCurrentTask(Math.min(tasks.length - 1, previewCurrentTask + 1))} disabled={previewCurrentTask >= tasks.length - 1}
              className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg disabled:opacity-50">Next →</button>
          </div>
        </div>
      )}

      {activeView === 'results' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Overall Success', value: `${Math.round(mockResults.filter(r => r.success).length / mockResults.length * 100)}%`, icon: '🎯' },
              { label: 'Direct Success', value: `${Math.round(mockResults.filter(r => r.direct && r.success).length / mockResults.filter(r => r.success).length * 100)}%`, icon: '↗️' },
              { label: 'Avg Time/Task', value: `${Math.round(mockResults.reduce((s, r) => s + r.duration, 0) / mockResults.length)}s`, icon: '⏱️' },
              { label: 'Participants', value: '20', icon: '👥' },
            ].map((s, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-stone-900">{s.value}</div>
                <div className="text-xs text-stone-500">{s.label}</div>
              </div>
            ))}
          </div>
          {/* Per-task breakdown / 按任务分解 */}
          <div className="space-y-3">
            {tasks.map((task, idx) => {
              const stats = getTaskStats(task.id);
              return (
                <div key={task.id} className="p-4 bg-white rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 mr-2">Task {idx + 1}</span>
                      <span className="text-sm font-medium text-stone-800">{task.instruction}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {stats.successRate >= 80 ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-sm font-bold ${stats.successRate >= 80 ? 'text-emerald-600' : 'text-red-600'}`}>{stats.successRate}%</span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-xs text-stone-500">
                    <span>Direct: {stats.directnessRate}%</span>
                    <span>Avg time: {stats.avgTime}s</span>
                    <span>N={stats.total}</span>
                  </div>
                  <div className="mt-2 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.successRate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Path Analysis / 路径分析 */}
          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-3">Path Analysis / 路径分析 (Task 1)</h3>
            <div className="space-y-2">
              {['Home → Support → FAQ', 'Home → Products → FAQ ✗', 'Home → Support → Contact Us → ← → FAQ'].map((path, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 text-xs text-stone-400">{[45, 30, 25][i]}%</div>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${[45, 30, 25][i]}%` }} /></div>
                  <div className="text-xs font-mono text-stone-600 flex items-center gap-1">{path}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeTestingEngine;
