import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, LineChart, Table2, Plus, Trash2, Settings, Download, Palette, Move } from 'lucide-react';

interface ChartConfig {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'donut' | 'scatter' | 'heatmap' | 'radar' | 'treemap';
  title: string;
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
  colorScheme: string;
  width: 'full' | 'half' | 'third';
  showLegend: boolean;
  showLabels: boolean;
  showGrid: boolean;
  aggregation: 'count' | 'sum' | 'avg' | 'median' | 'min' | 'max';
}

interface Props {
  projectId: string;
}

const CHART_TYPES = [
  { id: 'bar', label: 'Bar / 柱状图', icon: BarChart3 },
  { id: 'pie', label: 'Pie / 饼图', icon: PieChart },
  { id: 'line', label: 'Line / 折线图', icon: LineChart },
  { id: 'donut', label: 'Donut / 环形图', icon: PieChart },
  { id: 'scatter', label: 'Scatter / 散点图', icon: BarChart3 },
  { id: 'heatmap', label: 'Heatmap / 热力图', icon: Table2 },
  { id: 'radar', label: 'Radar / 雷达图', icon: BarChart3 },
  { id: 'treemap', label: 'Treemap / 矩阵图', icon: BarChart3 },
] as const;

const COLOR_SCHEMES = [
  { id: 'emerald', label: 'Emerald', colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'] },
  { id: 'ocean', label: 'Ocean', colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'] },
  { id: 'sunset', label: 'Sunset', colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'] },
  { id: 'berry', label: 'Berry', colors: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'] },
  { id: 'neutral', label: 'Neutral', colors: ['#57534e', '#78716c', '#a8a29e', '#d6d3d1'] },
  { id: 'rainbow', label: 'Rainbow', colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'] },
];

const AGGREGATIONS = [
  { id: 'count', label: 'Count / 计数' },
  { id: 'sum', label: 'Sum / 总和' },
  { id: 'avg', label: 'Average / 平均' },
  { id: 'median', label: 'Median / 中位数' },
  { id: 'min', label: 'Min / 最小' },
  { id: 'max', label: 'Max / 最大' },
];

// Custom Data Visualization Studio for building research dashboards
// 自定义数据可视化工作室，用于构建研究仪表板
const DataVisualizationStudio: React.FC<Props> = ({ projectId }) => {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [dashboardTitle, setDashboardTitle] = useState('Research Dashboard / 研究仪表板');

  const addChart = (type: ChartConfig['type']) => {
    const newChart: ChartConfig = {
      id: `chart_${Date.now()}`,
      type,
      title: `New ${type} chart`,
      dataSource: '',
      colorScheme: 'emerald',
      width: 'half',
      showLegend: true,
      showLabels: true,
      showGrid: true,
      aggregation: 'count',
    };
    setCharts(prev => [...prev, newChart]);
    setEditingChart(newChart.id);
  };

  const updateChart = (id: string, updates: Partial<ChartConfig>) => {
    setCharts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeChart = (id: string) => {
    setCharts(prev => prev.filter(c => c.id !== id));
    if (editingChart === id) setEditingChart(null);
  };

  const editing = charts.find(c => c.id === editingChart);

  // Generate mock visualization for preview / 生成模拟可视化预览
  const renderChartPreview = (chart: ChartConfig) => {
    const scheme = COLOR_SCHEMES.find(s => s.id === chart.colorScheme) || COLOR_SCHEMES[0];
    const mockData = [65, 42, 78, 35, 55, 90, 48];
    const maxVal = Math.max(...mockData);

    if (chart.type === 'bar') {
      return (
        <div className="flex items-end gap-1 h-24 px-2">
          {mockData.map((val, i) => (
            <div key={i} className="flex-1 rounded-t transition-all hover:opacity-80"
              style={{ height: `${(val / maxVal) * 100}%`, backgroundColor: scheme.colors[i % scheme.colors.length] }} />
          ))}
        </div>
      );
    }
    if (chart.type === 'line') {
      return (
        <svg viewBox="0 0 200 80" className="w-full h-24">
          <polyline fill="none" stroke={scheme.colors[0]} strokeWidth="2"
            points={mockData.map((v, i) => `${(i / (mockData.length - 1)) * 190 + 5},${80 - (v / maxVal) * 70}`).join(' ')} />
          {mockData.map((v, i) => (
            <circle key={i} cx={(i / (mockData.length - 1)) * 190 + 5} cy={80 - (v / maxVal) * 70} r="3" fill={scheme.colors[0]} />
          ))}
        </svg>
      );
    }
    if (chart.type === 'pie' || chart.type === 'donut') {
      const total = mockData.slice(0, 4).reduce((a, b) => a + b, 0);
      let cumulative = 0;
      return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
          {mockData.slice(0, 4).map((val, i) => {
            const pct = val / total;
            const startAngle = cumulative * 2 * Math.PI;
            cumulative += pct;
            const endAngle = cumulative * 2 * Math.PI;
            const x1 = 50 + 40 * Math.cos(startAngle - Math.PI / 2);
            const y1 = 50 + 40 * Math.sin(startAngle - Math.PI / 2);
            const x2 = 50 + 40 * Math.cos(endAngle - Math.PI / 2);
            const y2 = 50 + 40 * Math.sin(endAngle - Math.PI / 2);
            const largeArc = pct > 0.5 ? 1 : 0;
            return (
              <path key={i} fill={scheme.colors[i % scheme.colors.length]}
                d={`M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`} />
            );
          })}
          {chart.type === 'donut' && <circle cx="50" cy="50" r="22" fill="white" />}
        </svg>
      );
    }
    // Fallback for other chart types / 其他图表类型的回退
    return (
      <div className="h-24 flex items-center justify-center text-stone-300">
        <BarChart3 size={32} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Data Visualization Studio / 数据可视化工作室</h2>
            <p className="text-xs text-stone-500">Build custom dashboards from your research data / 从研究数据构建自定义仪表板</p>
          </div>
        </div>
        <button className="px-3 py-1.5 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 flex items-center gap-1">
          <Download size={12} /> Export / 导出
        </button>
      </div>

      {/* Add chart buttons / 添加图表按钮 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase mb-3">Add Chart / 添加图表</p>
        <div className="flex flex-wrap gap-2">
          {CHART_TYPES.map(ct => {
            const Icon = ct.icon;
            return (
              <button key={ct.id} onClick={() => addChart(ct.id as any)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-stone-50 text-stone-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-stone-200">
                <Icon size={14} /> {ct.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Dashboard canvas / 仪表板画布 */}
        <div className="flex-1">
          {charts.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
              <BarChart3 size={40} className="mx-auto mb-3 text-stone-300" />
              <p className="text-sm text-stone-500">Add charts to build your dashboard / 添加图表以构建仪表板</p>
              <p className="text-xs text-stone-400 mt-1">Click any chart type above to get started / 点击上方图表类型开始</p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {charts.map(chart => (
                <div key={chart.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${editingChart === chart.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-stone-300'} ${chart.width === 'full' ? 'col-span-full' : chart.width === 'third' ? '' : 'sm:col-span-1'}`}
                  onClick={() => setEditingChart(chart.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-stone-700 truncate">{chart.title}</h4>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); removeChart(chart.id); }} className="p-1 text-stone-400 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {renderChartPreview(chart)}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-400">
                    <span className="capitalize">{chart.type}</span>
                    <span>•</span>
                    <span>{chart.aggregation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Config panel / 配置面板 */}
        {editing && (
          <div className="w-72 bg-white rounded-xl border border-stone-200 p-4 space-y-4 shrink-0 self-start sticky top-20">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-700">Chart Settings / 图表设置</h4>
              <Settings size={14} className="text-stone-400" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Title / 标题</label>
              <input value={editing.title} onChange={e => updateChart(editing.id, { title: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Chart Type / 图表类型</label>
              <select value={editing.type} onChange={e => updateChart(editing.id, { type: e.target.value as any })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white">
                {CHART_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Width / 宽度</label>
              <div className="flex gap-1 mt-1">
                {(['third', 'half', 'full'] as const).map(w => (
                  <button key={w} onClick={() => updateChart(editing.id, { width: w })}
                    className={`flex-1 px-2 py-1 text-xs rounded ${editing.width === w ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {w === 'third' ? '1/3' : w === 'half' ? '1/2' : 'Full'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Aggregation / 聚合</label>
              <select value={editing.aggregation} onChange={e => updateChart(editing.id, { aggregation: e.target.value as any })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white">
                {AGGREGATIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Color Scheme / 配色方案</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_SCHEMES.map(s => (
                  <button key={s.id} onClick={() => updateChart(editing.id, { colorScheme: s.id })}
                    className={`flex gap-0.5 p-1 rounded-lg border ${editing.colorScheme === s.id ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-stone-200'}`}>
                    {s.colors.slice(0, 4).map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {[{ key: 'showLegend', label: 'Legend / 图例' }, { key: 'showLabels', label: 'Labels / 标签' }, { key: 'showGrid', label: 'Grid / 网格' }].map(opt => (
                <label key={opt.key} className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">{opt.label}</span>
                  <button onClick={() => updateChart(editing.id, { [opt.key]: !(editing as any)[opt.key] })}
                    className={`w-8 h-4 rounded-full transition-colors ${(editing as any)[opt.key] ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${(editing as any)[opt.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizationStudio;
