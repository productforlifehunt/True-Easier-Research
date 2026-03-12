import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, BarChart3, PieChart, TrendingUp, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { bToast } from '../utils/bilingualToast';

// Automated Report Generator — One-click research reports
// 自动报告生成器 — 一键生成研究报告

interface Props {
  projectId: string;
  projectTitle?: string;
  responses: any[];
  questions: any[];
  enrollments?: any[];
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

const ReportGenerator: React.FC<Props> = ({ projectId, projectTitle, responses, questions, enrollments = [] }) => {
  const [reportType, setReportType] = useState<'executive' | 'detailed' | 'raw'>('executive');
  const [generating, setGenerating] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [includeOpenEnded, setIncludeOpenEnded] = useState(true);
  const [includeStatistical, setIncludeStatistical] = useState(true);

  // Compute summary stats / 计算汇总统计
  const stats = useMemo(() => {
    const totalResponses = responses.length;
    const totalEnrollments = enrollments.length;
    const completionRate = totalEnrollments > 0 ? (totalResponses / totalEnrollments * 100).toFixed(1) : '0';
    const avgCompletionTime = responses.reduce((sum, r) => {
      const timings = r.answers?.__question_timings__;
      if (timings) {
        return sum + Object.values(timings as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
      }
      return sum;
    }, 0) / Math.max(totalResponses, 1);

    // Per-question analysis / 逐题分析
    const questionAnalysis = questions.map(q => {
      const qResponses = responses.filter(r => r.answers?.[q.id] !== undefined);
      const answeredCount = qResponses.length;
      const answers = qResponses.map(r => r.answers[q.id]);

      // For scale/number types / 量表/数字类型
      const numericAnswers = answers.filter(a => typeof a === 'number' || !isNaN(Number(a))).map(Number);
      const mean = numericAnswers.length > 0 ? numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length : null;
      const stdDev = numericAnswers.length > 1 ? Math.sqrt(numericAnswers.reduce((sum, v) => sum + Math.pow(v - (mean || 0), 2), 0) / (numericAnswers.length - 1)) : null;

      // For choice types / 选择类型
      const choiceCounts: Record<string, number> = {};
      answers.forEach(a => {
        const vals = Array.isArray(a) ? a : [a];
        vals.forEach(v => {
          const key = String(v);
          choiceCounts[key] = (choiceCounts[key] || 0) + 1;
        });
      });

      return {
        questionId: q.id,
        questionText: q.question_text || q.text,
        questionType: q.question_type || q.type,
        answeredCount,
        responseRate: totalResponses > 0 ? (answeredCount / totalResponses * 100).toFixed(1) : '0',
        mean,
        stdDev,
        choiceCounts,
        topAnswer: Object.entries(choiceCounts).sort(([,a],[,b]) => b - a)[0]?.[0] || 'N/A',
      };
    });

    return { totalResponses, totalEnrollments, completionRate, avgCompletionTime, questionAnalysis };
  }, [responses, questions, enrollments]);

  // Generate HTML report / 生成HTML报告
  const generateReport = () => {
    setGenerating(true);
    try {
      const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Research Report: ${projectTitle || 'Untitled'}</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1f2937; line-height: 1.6; }
    h1 { font-size: 28px; border-bottom: 3px solid #10b981; padding-bottom: 12px; }
    h2 { font-size: 20px; color: #374151; margin-top: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h3 { font-size: 16px; color: #6b7280; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
    .stat-card { background: #f9fafb; padding: 16px; border-radius: 12px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #10b981; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    th { background: #f9fafb; font-weight: 600; color: #374151; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .bar-chart { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 4px 0; }
    .bar-fill { height: 100%; background: #10b981; border-radius: 10px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
    @media print { body { max-width: 100%; padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>Research Report / 研究报告</h1>
  <p><strong>${projectTitle || 'Untitled Project'}</strong></p>
  <p style="color: #6b7280; font-size: 14px;">Generated: ${reportDate} | Project ID: ${projectId}</p>

  <h2>Executive Summary / 执行摘要</h2>
  <div class="stat-grid">
    <div class="stat-card"><div class="stat-value">${stats.totalResponses}</div><div class="stat-label">Total Responses / 总回复</div></div>
    <div class="stat-card"><div class="stat-value">${stats.completionRate}%</div><div class="stat-label">Completion Rate / 完成率</div></div>
    <div class="stat-card"><div class="stat-value">${Math.round(stats.avgCompletionTime)}s</div><div class="stat-label">Avg Time / 平均时长</div></div>
    <div class="stat-card"><div class="stat-value">${questions.length}</div><div class="stat-label">Questions / 问题数</div></div>
  </div>`;

      if (reportType !== 'raw') {
        html += `\n  <h2>Question Analysis / 问题分析</h2>`;
        stats.questionAnalysis.forEach((qa, i) => {
          html += `\n  <h3>${i + 1}. ${qa.questionText || 'Untitled'}</h3>
  <p style="font-size: 12px; color: #6b7280;">Type: ${qa.questionType} | Response Rate: ${qa.responseRate}% (${qa.answeredCount}/${stats.totalResponses})</p>`;

          if (qa.mean !== null) {
            html += `\n  <p>Mean: <strong>${qa.mean.toFixed(2)}</strong> | Std Dev: ${qa.stdDev?.toFixed(2) || 'N/A'}</p>`;
          }

          if (Object.keys(qa.choiceCounts).length > 0 && Object.keys(qa.choiceCounts).length <= 20) {
            html += `\n  <table><tr><th>Option / 选项</th><th>Count / 计数</th><th>Percentage / 百分比</th><th>Distribution / 分布</th></tr>`;
            Object.entries(qa.choiceCounts)
              .sort(([,a],[,b]) => b - a)
              .forEach(([option, count]) => {
                const pct = qa.answeredCount > 0 ? (count / qa.answeredCount * 100).toFixed(1) : '0';
                html += `\n    <tr><td>${option}</td><td>${count}</td><td>${pct}%</td><td><div class="bar-chart"><div class="bar-fill" style="width:${pct}%"></div></div></td></tr>`;
              });
            html += `\n  </table>`;
          }
        });
      }

      if (includeStatistical) {
        html += `\n  <h2>Statistical Summary / 统计摘要</h2>
  <table>
    <tr><th>Question / 问题</th><th>N</th><th>Mean / 均值</th><th>Std Dev / 标准差</th><th>Top Answer / 最多答案</th></tr>`;
        stats.questionAnalysis.forEach(qa => {
          html += `\n    <tr><td>${(qa.questionText || '').substring(0, 50)}...</td><td>${qa.answeredCount}</td><td>${qa.mean?.toFixed(2) || '-'}</td><td>${qa.stdDev?.toFixed(2) || '-'}</td><td>${qa.topAnswer}</td></tr>`;
        });
        html += `\n  </table>`;
      }

      html += `\n  <div class="footer">
    Generated by Easier Research Platform / 由 Easier 研究平台生成<br/>
    ${reportDate}
  </div>
</body></html>`;

      // Download / 下载
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${projectId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report generated! / 报告已生成！');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">Report Generator / 报告生成器</h2>
      </div>

      {/* Quick Stats / 快速统计 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Responses / 回复', value: stats.totalResponses, color: 'emerald' },
          { icon: CheckCircle, label: 'Completion / 完成率', value: `${stats.completionRate}%`, color: 'cyan' },
          { icon: Clock, label: 'Avg Time / 平均时长', value: `${Math.round(stats.avgCompletionTime)}s`, color: 'violet' },
          { icon: BarChart3, label: 'Questions / 题目', value: questions.length, color: 'amber' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <s.icon size={16} className="mx-auto mb-1 text-stone-400" />
            <p className="text-xl font-bold text-stone-800">{s.value}</p>
            <p className="text-[10px] text-stone-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Report Configuration / 报告配置 */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-stone-700">Report Type / 报告类型</h3>
        <div className="flex gap-2">
          {([
            { id: 'executive' as const, label: 'Executive Summary / 执行摘要', desc: 'Key findings and charts / 关键发现与图表' },
            { id: 'detailed' as const, label: 'Detailed Analysis / 详细分析', desc: 'Full question breakdown / 完整逐题分析' },
            { id: 'raw' as const, label: 'Data Tables / 数据表格', desc: 'Statistics only / 纯统计数据' },
          ]).map(rt => (
            <button key={rt.id} onClick={() => setReportType(rt.id)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                reportType === rt.id ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200 hover:border-stone-300'
              }`}>
              <p className="text-xs font-semibold text-stone-700">{rt.label}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{rt.desc}</p>
            </button>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-stone-700 mt-4">Include Sections / 包含章节</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Charts & Graphs / 图表', checked: includeCharts, set: setIncludeCharts },
            { label: 'Demographics / 人口统计', checked: includeDemographics, set: setIncludeDemographics },
            { label: 'Open-ended Responses / 开放题回答', checked: includeOpenEnded, set: setIncludeOpenEnded },
            { label: 'Statistical Tests / 统计检验', checked: includeStatistical, set: setIncludeStatistical },
          ].map(s => (
            <label key={s.label} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
              <input type="checkbox" checked={s.checked} onChange={e => s.set(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs text-stone-700">{s.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={generateReport} disabled={generating}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
            <Download size={15} /> {generating ? 'Generating... / 生成中...' : 'Generate HTML Report / 生成HTML报告'}
          </button>
          <button onClick={() => window.print()}
            className="px-4 py-3 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-1.5">
            <Printer size={14} /> Print / 打印
          </button>
        </div>
      </div>

      {/* Preview / 预览 */}
      {stats.questionAnalysis.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-700 mb-3">Response Distribution Preview / 回答分布预览</h3>
          <div className="space-y-3">
            {stats.questionAnalysis.slice(0, 5).map((qa, i) => {
              const chartData = Object.entries(qa.choiceCounts).slice(0, 8).map(([name, value]) => ({ name: name.substring(0, 20), value }));
              if (chartData.length === 0) return null;
              return (
                <div key={qa.questionId} className="border border-stone-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-stone-700 mb-2">{i + 1}. {(qa.questionText || '').substring(0, 80)}</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
