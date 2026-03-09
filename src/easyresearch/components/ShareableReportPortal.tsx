import React, { useState, useMemo } from 'react';
import { Share2, Link, Lock, Eye, Copy, ExternalLink, BarChart3, CheckCircle2, Settings, Globe, Shield } from 'lucide-react';

/* ────────────────────────────────────────────────────
 * Shareable Report Portal
 * Generate public/protected shareable links to
 * read-only results dashboards for stakeholders.
 *
 * 可共享报告门户
 * 生成公开/受保护的可共享链接，
 * 指向只读结果仪表板，供利益相关者查看。
 * ──────────────────────────────────────────────────── */

interface SharedReport {
  id: string;
  name: string;
  nameZh: string;
  slug: string;
  accessType: 'public' | 'password' | 'token' | 'email_list';
  password?: string;
  allowedEmails?: string[];
  enabled: boolean;
  createdAt: string;
  viewCount: number;
  lastViewedAt?: string;
  sections: ReportSection[];
  branding: { showLogo: boolean; customTitle: string; hideResearcherName: boolean };
}

interface ReportSection {
  id: string;
  type: 'summary' | 'charts' | 'responses_table' | 'cross_tab' | 'ux_metrics' | 'custom_text' | 'sentiment' | 'funnel';
  title: string;
  enabled: boolean;
  order: number;
}

interface Props {
  projectId: string;
}

const ShareableReportPortal: React.FC<Props> = ({ projectId }) => {
  const [reports, setReports] = useState<SharedReport[]>([
    {
      id: 'rep1', name: 'Q1 Research Results', nameZh: 'Q1研究结果', slug: 'q1-results-2026',
      accessType: 'password', password: 'research2026', enabled: true,
      createdAt: '2026-03-01', viewCount: 47, lastViewedAt: '2026-03-09T10:30:00',
      sections: [
        { id: 's1', type: 'summary', title: 'Executive Summary', enabled: true, order: 0 },
        { id: 's2', type: 'charts', title: 'Key Metrics', enabled: true, order: 1 },
        { id: 's3', type: 'ux_metrics', title: 'UX Scores', enabled: true, order: 2 },
        { id: 's4', type: 'funnel', title: 'Completion Funnel', enabled: true, order: 3 },
        { id: 's5', type: 'sentiment', title: 'Sentiment Analysis', enabled: false, order: 4 },
        { id: 's6', type: 'responses_table', title: 'Raw Responses', enabled: false, order: 5 },
      ],
      branding: { showLogo: true, customTitle: '', hideResearcherName: false },
    },
  ]);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = `${window.location.origin}/easyresearch/report/${projectId}`;

  const addReport = () => {
    const rep: SharedReport = {
      id: `rep_${Date.now()}`, name: 'New Report', nameZh: '新报告',
      slug: `report-${Date.now()}`, accessType: 'public', enabled: true,
      createdAt: new Date().toISOString().split('T')[0], viewCount: 0,
      sections: [
        { id: `s_${Date.now()}_1`, type: 'summary', title: 'Summary', enabled: true, order: 0 },
        { id: `s_${Date.now()}_2`, type: 'charts', title: 'Charts', enabled: true, order: 1 },
      ],
      branding: { showLogo: true, customTitle: '', hideResearcherName: false },
    };
    setReports(prev => [...prev, rep]);
    setEditingReport(rep.id);
  };

  const updateReport = (id: string, updates: Partial<SharedReport>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleSection = (reportId: string, sectionId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? {
      ...r, sections: r.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
    } : r));
  };

  const copyLink = (report: SharedReport) => {
    navigator.clipboard.writeText(`${baseUrl}/${report.slug}`);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const editing = reports.find(r => r.id === editingReport);

  const accessIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe size={12} className="text-emerald-500" />;
      case 'password': return <Lock size={12} className="text-amber-500" />;
      case 'token': return <Shield size={12} className="text-blue-500" />;
      case 'email_list': return <Lock size={12} className="text-purple-500" />;
      default: return <Globe size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Share2 size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Shareable Reports / 可共享报告</h2>
            <p className="text-xs text-stone-500">Create public or protected report links for stakeholders / 为利益相关者创建公开或受保护的报告链接</p>
          </div>
        </div>
        <button onClick={addReport}
          className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1">
          <Share2 size={12} /> New Report / 新建报告
        </button>
      </div>

      <div className="flex gap-6">
        {/* Report list / 报告列表 */}
        <div className="flex-1 space-y-3">
          {reports.map(report => (
            <div key={report.id} onClick={() => setEditingReport(report.id)}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${editingReport === report.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-stone-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); updateReport(report.id, { enabled: !report.enabled }); }}
                    className={`w-8 h-4 rounded-full transition-colors ${report.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${report.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <h4 className="text-sm font-semibold text-stone-700">{report.name}</h4>
                  <span className="text-xs text-stone-400">{report.nameZh}</span>
                </div>
                <div className="flex items-center gap-2">
                  {accessIcon(report.accessType)}
                  <span className="text-[10px] text-stone-400">{report.accessType}</span>
                </div>
              </div>

              {/* Link preview / 链接预览 */}
              <div className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2 mb-3">
                <Link size={12} className="text-stone-400 shrink-0" />
                <span className="text-xs text-stone-500 truncate flex-1 font-mono">{baseUrl}/{report.slug}</span>
                <button onClick={e => { e.stopPropagation(); copyLink(report); }}
                  className="shrink-0 p-1 text-stone-400 hover:text-emerald-600">
                  {copiedId === report.id ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <a href={`${baseUrl}/${report.slug}`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                  className="shrink-0 p-1 text-stone-400 hover:text-blue-600">
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Stats / 统计 */}
              <div className="flex items-center gap-4 text-[10px] text-stone-400">
                <span className="flex items-center gap-1"><Eye size={10} /> {report.viewCount} views</span>
                <span>Created {report.createdAt}</span>
                {report.lastViewedAt && <span>Last viewed {new Date(report.lastViewedAt).toLocaleDateString()}</span>}
                <span>{report.sections.filter(s => s.enabled).length}/{report.sections.length} sections</span>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-8 text-center">
              <Share2 size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No shared reports yet / 暂无共享报告</p>
            </div>
          )}
        </div>

        {/* Editor panel / 编辑面板 */}
        {editing && (
          <div className="w-80 bg-white rounded-xl border border-stone-200 p-4 space-y-4 shrink-0 self-start sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h4 className="text-sm font-bold text-stone-700">Report Settings / 报告设置</h4>

            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Name (EN)</label>
              <input value={editing.name} onChange={e => updateReport(editing.id, { name: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Name (ZH)</label>
              <input value={editing.nameZh} onChange={e => updateReport(editing.id, { nameZh: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">URL Slug</label>
              <input value={editing.slug} onChange={e => updateReport(editing.id, { slug: e.target.value.replace(/[^a-z0-9-]/g, '') })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg font-mono" />
            </div>

            {/* Access control / 访问控制 */}
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Access / 访问控制</label>
              <select value={editing.accessType} onChange={e => updateReport(editing.id, { accessType: e.target.value as any })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white">
                <option value="public">Public (anyone with link) / 公开</option>
                <option value="password">Password Protected / 密码保护</option>
                <option value="token">Token (URL param) / 令牌</option>
                <option value="email_list">Email Allowlist / 邮箱白名单</option>
              </select>
            </div>

            {editing.accessType === 'password' && (
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Password / 密码</label>
                <input value={editing.password || ''} onChange={e => updateReport(editing.id, { password: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
              </div>
            )}

            {editing.accessType === 'email_list' && (
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Allowed Emails (one per line) / 允许的邮箱</label>
                <textarea value={(editing.allowedEmails || []).join('\n')}
                  onChange={e => updateReport(editing.id, { allowedEmails: e.target.value.split('\n').filter(Boolean) })}
                  rows={4} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg font-mono resize-y" />
              </div>
            )}

            {/* Sections / 章节 */}
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase mb-2 block">Visible Sections / 可见章节</label>
              <div className="space-y-1">
                {editing.sections.map(section => (
                  <label key={section.id} className="flex items-center justify-between px-2 py-1.5 bg-stone-50 rounded-lg">
                    <span className="text-xs text-stone-600">{section.title}</span>
                    <button onClick={() => toggleSection(editing.id, section.id)}
                      className={`w-7 h-3.5 rounded-full transition-colors ${section.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${section.enabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* Branding / 品牌 */}
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase mb-2 block">Branding / 品牌设置</label>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">Show Logo / 显示Logo</span>
                  <button onClick={() => updateReport(editing.id, { branding: { ...editing.branding, showLogo: !editing.branding.showLogo } })}
                    className={`w-7 h-3.5 rounded-full transition-colors ${editing.branding.showLogo ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${editing.branding.showLogo ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">Hide researcher name / 隐藏研究员名称</span>
                  <button onClick={() => updateReport(editing.id, { branding: { ...editing.branding, hideResearcherName: !editing.branding.hideResearcherName } })}
                    className={`w-7 h-3.5 rounded-full transition-colors ${editing.branding.hideResearcherName ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${editing.branding.hideResearcherName ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
                <div>
                  <label className="text-[10px] font-semibold text-stone-500 uppercase">Custom Title / 自定义标题</label>
                  <input value={editing.branding.customTitle}
                    onChange={e => updateReport(editing.id, { branding: { ...editing.branding, customTitle: e.target.value } })}
                    placeholder="Override report title..." className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareableReportPortal;
