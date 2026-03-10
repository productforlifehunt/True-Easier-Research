import React, { useState } from 'react';
import { Layers, Plus, Trash2, Shuffle, BarChart3, Grid3X3, Eye, Settings, Upload } from 'lucide-react';

interface Card { id: string; label: string; description?: string; imageUrl?: string; }
interface Category { id: string; name: string; cards: string[]; }
interface SortResult { participantId: string; timestamp: string; duration: number; categories: Category[]; unsorted: string[]; }

interface Props { projectId: string; }

const CardSortingEngine: React.FC<Props> = ({ projectId }) => {
  const [sortType, setSortType] = useState<'open' | 'closed' | 'hybrid'>('open');
  const [cards, setCards] = useState<Card[]>([
    { id: '1', label: 'Account Settings', description: 'Manage your profile and preferences' },
    { id: '2', label: 'Payment History', description: 'View past transactions' },
    { id: '3', label: 'Notifications', description: 'Configure alert preferences' },
    { id: '4', label: 'Help Center', description: 'FAQ and support resources' },
    { id: '5', label: 'Privacy Policy', description: 'Data handling information' },
    { id: '6', label: 'Change Password', description: 'Update login credentials' },
  ]);
  const [predefinedCategories, setPredefinedCategories] = useState<string[]>(['Settings', 'Support', 'Account', 'Legal']);
  const [newCardLabel, setNewCardLabel] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeView, setActiveView] = useState<'setup' | 'preview' | 'results'>('setup');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Mock results for analysis view / 分析视图的模拟结果
  const mockResults: SortResult[] = Array.from({ length: 15 }, (_, i) => ({
    participantId: `P${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    duration: 120 + Math.floor(Math.random() * 300),
    categories: predefinedCategories.map(cat => ({
      id: crypto.randomUUID(), name: cat,
      cards: cards.filter(() => Math.random() > 0.5).map(c => c.id),
    })),
    unsorted: cards.filter(() => Math.random() > 0.85).map(c => c.id),
  }));

  // Similarity matrix computation / 相似矩阵计算
  const computeSimilarityMatrix = () => {
    const matrix: number[][] = cards.map(() => cards.map(() => 0));
    mockResults.forEach(result => {
      result.categories.forEach(cat => {
        for (let i = 0; i < cat.cards.length; i++) {
          for (let j = i + 1; j < cat.cards.length; j++) {
            const ci = cards.findIndex(c => c.id === cat.cards[i]);
            const cj = cards.findIndex(c => c.id === cat.cards[j]);
            if (ci >= 0 && cj >= 0) { matrix[ci][cj]++; matrix[cj][ci]++; }
          }
        }
      });
    });
    const max = Math.max(...matrix.flat(), 1);
    return matrix.map(row => row.map(v => Math.round((v / max) * 100)));
  };

  const addCard = () => {
    if (!newCardLabel.trim()) return;
    setCards(prev => [...prev, { id: crypto.randomUUID(), label: newCardLabel.trim() }]);
    setNewCardLabel('');
  };

  const bulkImportCards = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    const newCards = lines.map(l => ({ id: crypto.randomUUID(), label: l.trim() }));
    setCards(prev => [...prev, ...newCards]);
    setBulkInput('');
    setShowBulkImport(false);
  };

  const similarityMatrix = computeSimilarityMatrix();

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Card Sorting Engine / 卡片分类引擎</h2>
            <p className="text-sm text-stone-500">{cards.length} cards · {sortType} sort · {mockResults.length} results</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['setup', 'preview', 'results'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'setup' ? 'Setup' : v === 'preview' ? 'Preview' : 'Results'}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Type Selector / 分类类型选择 */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { type: 'open' as const, title: 'Open Sort / 开放式', desc: 'Participants create their own categories / 参与者创建自己的分类' },
          { type: 'closed' as const, title: 'Closed Sort / 封闭式', desc: 'Participants sort into predefined categories / 参与者分类到预定义类别' },
          { type: 'hybrid' as const, title: 'Hybrid Sort / 混合式', desc: 'Predefined categories + can create new ones / 预定义+可创建新类别' },
        ]).map(s => (
          <button key={s.type} onClick={() => setSortType(s.type)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${sortType === s.type ? 'border-indigo-500 bg-indigo-50' : 'border-stone-200 hover:border-stone-300'}`}>
            <div className="font-semibold text-sm text-stone-900">{s.title}</div>
            <div className="text-xs text-stone-500 mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      {activeView === 'setup' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Cards List / 卡片列表 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Cards ({cards.length})</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowBulkImport(!showBulkImport)} className="text-xs px-2 py-1 bg-stone-100 rounded-lg hover:bg-stone-200 flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Bulk Import
                </button>
                <button onClick={() => setCards(prev => [...prev].sort(() => Math.random() - 0.5))} className="text-xs px-2 py-1 bg-stone-100 rounded-lg hover:bg-stone-200 flex items-center gap-1">
                  <Shuffle className="w-3 h-3" /> Randomize
                </button>
              </div>
            </div>

            {showBulkImport && (
              <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)}
                  placeholder="One card per line..." rows={4}
                  className="w-full text-sm border border-stone-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <button onClick={bulkImportCards} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg">Import Cards</button>
              </div>
            )}

            <div className="flex gap-2">
              <input value={newCardLabel} onChange={e => setNewCardLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCard()}
                placeholder="New card label..." className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <button onClick={addCard} className="px-3 py-2 bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {cards.map((card, idx) => (
                <div key={card.id} className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-xl group hover:shadow-sm">
                  <span className="text-xs text-stone-400 w-6">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-stone-800">{card.label}</div>
                    {card.description && <div className="text-xs text-stone-500">{card.description}</div>}
                  </div>
                  <button onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories (for closed/hybrid) / 类别（封闭/混合式） */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800">
              {sortType === 'open' ? 'Category Settings' : `Predefined Categories (${predefinedCategories.length})`}
            </h3>
            {sortType === 'open' ? (
              <div className="p-6 bg-stone-50 rounded-xl text-center">
                <div className="text-3xl mb-2">🗂️</div>
                <p className="text-sm text-stone-600">In open sort, participants create their own categories.</p>
                <p className="text-xs text-stone-400 mt-1">No predefined categories needed / 无需预定义类别</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newCategoryName.trim()) { setPredefinedCategories(prev => [...prev, newCategoryName.trim()]); setNewCategoryName(''); }}}
                    placeholder="New category name..." className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  <button onClick={() => { if (newCategoryName.trim()) { setPredefinedCategories(prev => [...prev, newCategoryName.trim()]); setNewCategoryName(''); }}}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {predefinedCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-xl group">
                      <div className="w-3 h-3 rounded-full bg-indigo-400" />
                      <span className="flex-1 text-sm font-medium text-stone-800">{cat}</span>
                      <button onClick={() => setPredefinedCategories(prev => prev.filter((_, i) => i !== idx))}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Settings / 设置 */}
            <div className="mt-6 p-4 bg-stone-50 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Settings className="w-4 h-4" /> Sort Options</h4>
              {[
                { label: 'Randomize card order / 随机卡片顺序', defaultChecked: true },
                { label: 'Allow duplicate placement / 允许重复放置', defaultChecked: false },
                { label: 'Show card descriptions / 显示卡片描述', defaultChecked: true },
                { label: 'Timer enabled / 启用计时器', defaultChecked: false },
                { label: 'Require all cards sorted / 要求所有卡片分类', defaultChecked: true },
              ].map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input type="checkbox" defaultChecked={opt.defaultChecked} className="rounded text-indigo-600" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'preview' && (
        <div className="p-6 bg-white rounded-xl border border-stone-200">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Participant Preview / 参与者预览</h3>
          <p className="text-sm text-stone-500 mb-4">Drag cards into categories below / 将卡片拖入下方类别</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-stone-500 uppercase">Unsorted Cards / 未分类卡片</h4>
              <div className="min-h-[200px] bg-stone-50 rounded-xl p-3 space-y-2 border-2 border-dashed border-stone-300">
                {cards.map(card => (
                  <div key={card.id} className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                    <div className="text-sm font-medium text-stone-800">{card.label}</div>
                    {card.description && <div className="text-xs text-stone-500 mt-1">{card.description}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-stone-500 uppercase">Categories / 类别</h4>
              <div className="space-y-3">
                {(sortType === 'open' ? ['My Category 1', 'My Category 2'] : predefinedCategories).map((cat, idx) => (
                  <div key={idx} className="min-h-[80px] bg-indigo-50 rounded-xl p-3 border-2 border-dashed border-indigo-200">
                    <div className="text-xs font-semibold text-indigo-700 mb-2">{cat}</div>
                    <div className="text-xs text-indigo-400 italic">Drop cards here / 拖放卡片到这里</div>
                  </div>
                ))}
                {sortType !== 'closed' && (
                  <button className="w-full p-3 border-2 border-dashed border-stone-300 rounded-xl text-sm text-stone-500 hover:border-indigo-400 hover:text-indigo-600">
                    + Create New Category / 创建新类别
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'results' && (
        <div className="space-y-6">
          {/* Summary Stats / 汇总统计 */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Participants', value: mockResults.length, icon: '👥' },
              { label: 'Avg Duration', value: `${Math.round(mockResults.reduce((s, r) => s + r.duration, 0) / mockResults.length)}s`, icon: '⏱️' },
              { label: 'Categories Created', value: sortType === 'open' ? '12 unique' : predefinedCategories.length, icon: '🗂️' },
              { label: 'Agreement Score', value: '72%', icon: '🎯' },
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-stone-900">{stat.value}</div>
                <div className="text-xs text-stone-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Similarity Matrix / 相似矩阵 */}
          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2"><Grid3X3 className="w-4 h-4" /> Similarity Matrix / 相似矩阵</h3>
            <div className="overflow-x-auto">
              <table className="text-xs">
                <thead>
                  <tr>
                    <th className="p-1" />
                    {cards.map(c => <th key={c.id} className="p-1 text-stone-500 max-w-[60px] truncate">{c.label.slice(0, 8)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card, i) => (
                    <tr key={card.id}>
                      <td className="p-1 font-medium text-stone-700 max-w-[80px] truncate">{card.label.slice(0, 10)}</td>
                      {similarityMatrix[i].map((val, j) => (
                        <td key={j} className="p-1">
                          <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${i === j ? 'bg-stone-100 text-stone-400' : val > 70 ? 'bg-indigo-500 text-white' : val > 40 ? 'bg-indigo-200 text-indigo-800' : 'bg-stone-50 text-stone-400'}`}>
                            {i === j ? '-' : val}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dendrogram placeholder / 树状图占位 */}
          <div className="p-6 bg-white rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Cluster Dendrogram / 聚类树状图</h3>
            <div className="h-48 bg-gradient-to-b from-stone-50 to-stone-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🌳</div>
                <p className="text-sm text-stone-500">Hierarchical clustering visualization</p>
                <p className="text-xs text-stone-400">Based on {mockResults.length} participant sorts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSortingEngine;
