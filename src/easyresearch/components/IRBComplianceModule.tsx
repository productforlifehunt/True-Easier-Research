import React, { useState } from 'react';
import { Shield, FileText, Clock, CheckCircle, AlertTriangle, Upload, Download, Users, Calendar, Lock } from 'lucide-react';

interface ConsentVersion { id: string; version: string; content: string; createdAt: string; status: 'draft' | 'active' | 'archived'; approvedBy?: string; }
interface IRBSubmission { id: string; boardName: string; protocolNumber: string; status: 'preparing' | 'submitted' | 'under_review' | 'approved' | 'revision_required' | 'rejected'; submittedAt?: string; approvedAt?: string; expiresAt?: string; notes?: string; }
interface DataRetentionPolicy { retentionPeriod: number; unit: 'days' | 'months' | 'years'; anonymizeOnExpiry: boolean; deleteOnExpiry: boolean; piiFields: string[]; }

interface Props { projectId: string; }

const IRBComplianceModule: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'consent' | 'irb' | 'retention' | 'audit'>('consent');
  const [consentVersions, setConsentVersions] = useState<ConsentVersion[]>([
    { id: '1', version: '1.0', content: 'I agree to participate in this research study...', createdAt: '2025-12-01', status: 'archived' },
    { id: '2', version: '1.1', content: 'Updated consent with additional data handling clauses...', createdAt: '2026-01-15', status: 'archived' },
    { id: '3', version: '2.0', content: 'I voluntarily agree to participate in this research study conducted by [Institution]. I understand that:\n\n1. PURPOSE: This study aims to understand user experience patterns.\n2. PROCEDURES: I will complete surveys and may participate in recorded sessions.\n3. RISKS: Minimal risk. Some questions may cause mild discomfort.\n4. BENEFITS: Contributing to scientific knowledge.\n5. CONFIDENTIALITY: All data will be anonymized and stored securely.\n6. WITHDRAWAL: I can withdraw at any time without penalty.\n7. DATA RETENTION: Data will be retained for 3 years after study completion.\n8. CONTACT: For questions, contact research@institution.edu', createdAt: '2026-03-01', status: 'active', approvedBy: 'Dr. Smith (IRB Chair)' },
  ]);
  const [submissions, setSubmissions] = useState<IRBSubmission[]>([
    { id: '1', boardName: 'University Ethics Board', protocolNumber: 'IRB-2026-0142', status: 'approved', submittedAt: '2026-01-20', approvedAt: '2026-02-15', expiresAt: '2027-02-15', notes: 'Approved with minor modifications' },
    { id: '2', boardName: 'Hospital Review Committee', protocolNumber: 'HRC-2026-089', status: 'under_review', submittedAt: '2026-02-28' },
  ]);
  const [retention, setRetention] = useState<DataRetentionPolicy>({ retentionPeriod: 3, unit: 'years', anonymizeOnExpiry: true, deleteOnExpiry: false, piiFields: ['email', 'name', 'ip_address', 'phone', 'location'] });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', active: 'bg-emerald-100 text-emerald-700', under_review: 'bg-blue-100 text-blue-700', submitted: 'bg-blue-100 text-blue-700', draft: 'bg-stone-100 text-stone-600', preparing: 'bg-stone-100 text-stone-600', revision_required: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700', archived: 'bg-stone-100 text-stone-500' };
    return colors[status] || 'bg-stone-100 text-stone-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">IRB & Ethics Compliance / IRB与伦理合规</h2>
            <p className="text-sm text-stone-500">{consentVersions.length} consent versions · {submissions.length} board submissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['consent', 'irb', 'retention', 'audit'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'consent' ? '📝 Consent' : v === 'irb' ? '🏛️ IRB' : v === 'retention' ? '🗄️ Retention' : '📋 Audit'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'consent' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">Consent Form Versions / 知情同意书版本</h3>
            <button className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg flex items-center gap-1"><FileText className="w-3 h-3" /> New Version</button>
          </div>
          {consentVersions.map(v => (
            <div key={v.id} className={`p-4 rounded-xl border-2 ${v.status === 'active' ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-stone-800">v{v.version}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(v.status)}`}>{v.status}</span>
                  {v.status === 'active' && <span className="text-[10px] text-emerald-600 font-semibold">✓ CURRENT</span>}
                </div>
                <span className="text-xs text-stone-500">{v.createdAt}</span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-3 whitespace-pre-wrap">{v.content}</p>
              {v.approvedBy && <div className="mt-2 text-xs text-emerald-600">Approved by: {v.approvedBy}</div>}
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-2 py-1 bg-stone-100 rounded-lg">View Full</button>
                <button className="text-xs px-2 py-1 bg-stone-100 rounded-lg flex items-center gap-1"><Download className="w-3 h-3" /> Export PDF</button>
                {v.status === 'draft' && <button className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">Activate</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'irb' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">Ethics Board Submissions / 伦理委员会提交</h3>
            <button className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg flex items-center gap-1"><Upload className="w-3 h-3" /> New Submission</button>
          </div>
          {submissions.map(sub => (
            <div key={sub.id} className="p-4 bg-white rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-stone-800">{sub.boardName}</div>
                  <div className="text-xs text-stone-500">Protocol: {sub.protocolNumber}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sub.status)}`}>{sub.status.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                <div><span className="text-stone-500">Submitted:</span><br /><span className="font-medium">{sub.submittedAt || '-'}</span></div>
                <div><span className="text-stone-500">Approved:</span><br /><span className="font-medium">{sub.approvedAt || '-'}</span></div>
                <div><span className="text-stone-500">Expires:</span><br /><span className={`font-medium ${sub.expiresAt && new Date(sub.expiresAt) < new Date(Date.now() + 90 * 86400000) ? 'text-amber-600' : ''}`}>{sub.expiresAt || '-'}</span></div>
              </div>
              {sub.notes && <div className="mt-2 text-xs text-stone-600 bg-stone-50 p-2 rounded-lg">{sub.notes}</div>}
            </div>
          ))}
          <div className="p-4 bg-stone-50 rounded-xl">
            <h4 className="text-xs font-semibold text-stone-700 mb-2">Required Documents Checklist / 必需文件清单</h4>
            {['Research protocol / 研究方案', 'Informed consent form / 知情同意书', 'Data management plan / 数据管理计划', 'Risk assessment / 风险评估', 'Investigator CV / 研究者简历', 'Recruitment materials / 招募材料'].map((doc, i) => (
              <label key={i} className="flex items-center gap-2 text-xs text-stone-600 py-1 cursor-pointer">
                <input type="checkbox" defaultChecked={i < 3} className="rounded text-emerald-600" /> {doc}
              </label>
            ))}
          </div>
        </div>
      )}

      {activeView === 'retention' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Data Retention Policy / 数据保留策略</h3>
            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-stone-600 mb-1 block">Retention Period / 保留期限</label>
                  <input type="number" value={retention.retentionPeriod} onChange={e => setRetention(prev => ({ ...prev, retentionPeriod: Number(e.target.value) }))}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" />
                </div>
                <div className="w-28">
                  <label className="text-xs text-stone-600 mb-1 block">Unit</label>
                  <select value={retention.unit} onChange={e => setRetention(prev => ({ ...prev, unit: e.target.value as any }))}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                    <option value="days">Days</option><option value="months">Months</option><option value="years">Years</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input type="checkbox" checked={retention.anonymizeOnExpiry} onChange={() => setRetention(prev => ({ ...prev, anonymizeOnExpiry: !prev.anonymizeOnExpiry }))} className="rounded text-emerald-600" />
                Anonymize data on expiry / 到期时匿名化数据
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input type="checkbox" checked={retention.deleteOnExpiry} onChange={() => setRetention(prev => ({ ...prev, deleteOnExpiry: !prev.deleteOnExpiry }))} className="rounded text-emerald-600" />
                Delete data on expiry / 到期时删除数据
              </label>
            </div>
            <div className="p-4 bg-white rounded-xl border border-stone-200">
              <h4 className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1"><Lock className="w-3 h-3" /> PII Fields Tracked / 跟踪的PII字段</h4>
              <div className="flex flex-wrap gap-2">
                {retention.piiFields.map(f => <span key={f} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-200">{f}</span>)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Compliance Standards / 合规标准</h3>
            {[
              { name: 'GDPR', region: 'EU', status: 'compliant', icon: '🇪🇺' },
              { name: 'HIPAA', region: 'US Healthcare', status: 'partial', icon: '🏥' },
              { name: 'CCPA', region: 'California', status: 'compliant', icon: '🇺🇸' },
              { name: 'PIPL', region: 'China', status: 'review', icon: '🇨🇳' },
            ].map(std => (
              <div key={std.name} className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-3">
                <span className="text-xl">{std.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-stone-800">{std.name}</div>
                  <div className="text-xs text-stone-500">{std.region}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${std.status === 'compliant' ? 'bg-emerald-100 text-emerald-700' : std.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>{std.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'audit' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-stone-800">Compliance Audit Trail / 合规审计追踪</h3>
          <div className="space-y-2">
            {[
              { action: 'Consent form v2.0 activated', user: 'Dr. Smith', time: '2026-03-01 10:30', type: 'consent' },
              { action: 'IRB approval received (IRB-2026-0142)', user: 'System', time: '2026-02-15 14:22', type: 'irb' },
              { action: 'Data retention policy updated to 3 years', user: 'Admin', time: '2026-02-10 09:15', type: 'retention' },
              { action: 'PII field "phone" added to tracking', user: 'Admin', time: '2026-02-08 16:45', type: 'retention' },
              { action: 'Consent form v1.1 archived', user: 'Dr. Smith', time: '2026-01-15 11:00', type: 'consent' },
              { action: 'IRB submission created (HRC-2026-089)', user: 'Admin', time: '2026-02-28 08:30', type: 'irb' },
            ].map((entry, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <div className={`w-2 h-2 rounded-full ${entry.type === 'consent' ? 'bg-blue-500' : entry.type === 'irb' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex-1">
                  <div className="text-sm text-stone-800">{entry.action}</div>
                  <div className="text-xs text-stone-500">{entry.user} · {entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IRBComplianceModule;
