/**
 * Consent & Ethics Manager — IRB consent flow builder
 * 知情同意与伦理管理器 — IRB 知情同意流程构建器
 */
import React, { useState } from 'react';
import { Shield, FileText, Plus, Trash2, Edit2, Check, X, AlertTriangle, Clock, Download } from 'lucide-react';

interface ConsentForm {
  id: string;
  title: string;
  version: string;
  content: string; // Rich text / HTML content / 富文本/HTML内容
  is_active: boolean;
  requires_signature: boolean;
  irb_number?: string;
  irb_expiry?: string;
  created_at: string;
  updated_at: string;
}

interface ConsentRecord {
  participant_id: string;
  participant_email: string;
  consent_form_id: string;
  version: string;
  signed_at: string;
  ip_address?: string;
  signature_data?: string; // Base64 signature / Base64 签名
  withdrawn_at?: string;
  withdrawal_reason?: string;
}

interface Props {
  projectId: string;
  consentForms?: ConsentForm[];
  consentRecords?: ConsentRecord[];
  onUpdate?: (forms: ConsentForm[]) => void;
}

const ConsentEthicsManager: React.FC<Props> = ({ projectId, consentForms = [], consentRecords = [], onUpdate }) => {
  const [forms, setForms] = useState<ConsentForm[]>(consentForms.length > 0 ? consentForms : [
    {
      id: 'default',
      title: 'Informed Consent / 知情同意书',
      version: '1.0',
      content: `<h2>Research Study Consent Form / 研究知情同意书</h2>
<p><strong>Purpose / 目的：</strong> [Describe the purpose of this study / 描述研究目的]</p>
<p><strong>Procedures / 程序：</strong> [Describe what participants will do / 描述参与者需要做什么]</p>
<p><strong>Risks / 风险：</strong> [Describe any risks / 描述可能的风险]</p>
<p><strong>Benefits / 收益：</strong> [Describe any benefits / 描述可能的收益]</p>
<p><strong>Confidentiality / 保密性：</strong> Your responses will be kept confidential and stored securely. / 您的回答将被保密并安全存储。</p>
<p><strong>Voluntary Participation / 自愿参与：</strong> Your participation is voluntary. You may withdraw at any time without penalty. / 您的参与是自愿的。您可以随时退出，不会受到任何处罚。</p>
<p><strong>Contact / 联系方式：</strong> [PI contact information / 主要研究者联系信息]</p>`,
      is_active: true,
      requires_signature: true,
      irb_number: '',
      irb_expiry: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [activeFormId, setActiveFormId] = useState<string>(forms[0]?.id || '');
  const [editingContent, setEditingContent] = useState(false);
  const [tab, setTab] = useState<'forms' | 'records' | 'withdrawals'>('forms');

  const activeForm = forms.find(f => f.id === activeFormId);
  const records = consentRecords;
  const withdrawals = records.filter(r => r.withdrawn_at);
  const activeConsents = records.filter(r => !r.withdrawn_at);

  const updateForm = (id: string, updates: Partial<ConsentForm>) => {
    const updated = forms.map(f => f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f);
    setForms(updated);
    onUpdate?.(updated);
  };

  const addVersion = () => {
    if (!activeForm) return;
    const newVersion = `${parseFloat(activeForm.version) + 0.1}`;
    const newForm: ConsentForm = {
      ...activeForm,
      id: `consent-${Date.now()}`,
      version: newVersion.substring(0, 3),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Deactivate old version / 停用旧版本
    const updated = forms.map(f => f.id === activeForm.id ? { ...f, is_active: false } : f);
    updated.push(newForm);
    setForms(updated);
    setActiveFormId(newForm.id);
    onUpdate?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Consent & Ethics / 知情同意与伦理</h2>
            <p className="text-sm text-muted-foreground">IRB consent forms, e-signatures, and withdrawal tracking / IRB 知情同意书、电子签名和退出跟踪</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation / 标签导航 */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['forms', 'records', 'withdrawals'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'forms' && `Forms (${forms.length})`}
            {t === 'records' && `Consents (${activeConsents.length})`}
            {t === 'withdrawals' && `Withdrawals (${withdrawals.length})`}
          </button>
        ))}
      </div>

      {/* Forms Tab / 表单标签页 */}
      {tab === 'forms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form List / 表单列表 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Versions / 版本</span>
              <button onClick={addVersion} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> New Version / 新版本
              </button>
            </div>
            {forms.map(form => (
              <button
                key={form.id}
                onClick={() => setActiveFormId(form.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  activeFormId === form.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">v{form.version}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    form.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {form.is_active ? 'Active / 活跃' : 'Archived / 已归档'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{form.title}</p>
              </button>
            ))}
          </div>

          {/* Form Editor / 表单编辑器 */}
          {activeForm && (
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Title / 标题</label>
                  <input
                    value={activeForm.title}
                    onChange={e => updateForm(activeForm.id, { title: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">IRB Number / IRB 编号</label>
                  <input
                    value={activeForm.irb_number || ''}
                    onChange={e => updateForm(activeForm.id, { irb_number: e.target.value })}
                    placeholder="e.g. IRB-2026-0042"
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">IRB Expiry / IRB 到期日</label>
                  <input
                    type="date"
                    value={activeForm.irb_expiry || ''}
                    onChange={e => updateForm(activeForm.id, { irb_expiry: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={activeForm.requires_signature}
                      onChange={e => updateForm(activeForm.id, { requires_signature: e.target.checked })}
                      className="rounded"
                    />
                    Require e-signature / 需要电子签名
                  </label>
                </div>
              </div>

              {/* IRB Expiry Warning / IRB 到期警告 */}
              {activeForm.irb_expiry && new Date(activeForm.irb_expiry) < new Date(Date.now() + 30 * 86400000) && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    IRB approval expires soon ({activeForm.irb_expiry}). Please renew. / IRB 批准即将到期，请续期。
                  </span>
                </div>
              )}

              {/* Content Editor / 内容编辑器 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Consent Content (HTML) / 同意书内容</label>
                  <button onClick={() => setEditingContent(!editingContent)} className="text-xs text-primary hover:underline">
                    {editingContent ? 'Preview / 预览' : 'Edit HTML / 编辑'}
                  </button>
                </div>
                {editingContent ? (
                  <textarea
                    value={activeForm.content}
                    onChange={e => updateForm(activeForm.id, { content: e.target.value })}
                    rows={16}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg font-mono bg-background text-foreground"
                  />
                ) : (
                  <div
                    className="border border-border rounded-lg p-4 prose prose-sm max-w-none bg-background"
                    dangerouslySetInnerHTML={{ __html: activeForm.content }}
                  />
                )}
              </div>

              {/* Signature Preview / 签名预览 */}
              {activeForm.requires_signature && (
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">E-Signature Area (participant view) / 电子签名区域（参与者视图）</p>
                  <div className="h-20 border border-border rounded-lg bg-muted/30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground italic">Participant draws signature here / 参与者在此处签名</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" disabled checked /> I agree to participate / 我同意参与
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Records Tab / 记录标签页 */}
      {tab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{activeConsents.length} active consent records / 条有效同意记录</p>
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Download className="w-3 h-3" /> Export CSV / 导出
            </button>
          </div>
          {activeConsents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No consent records yet / 暂无同意记录</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Participant / 参与者</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Version / 版本</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Signed At / 签署时间</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status / 状态</th>
                  </tr>
                </thead>
                <tbody>
                  {activeConsents.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-2 text-foreground">{r.participant_email}</td>
                      <td className="px-4 py-2 text-muted-foreground">v{r.version}</td>
                      <td className="px-4 py-2 text-muted-foreground">{new Date(r.signed_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active / 有效</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Withdrawals Tab / 退出标签页 */}
      {tab === 'withdrawals' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{withdrawals.length} withdrawal records / 条退出记录</p>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Check className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No withdrawals recorded / 暂无退出记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w, i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{w.participant_email}</span>
                    <span className="text-xs text-muted-foreground">{new Date(w.withdrawn_at!).toLocaleDateString()}</span>
                  </div>
                  {w.withdrawal_reason && (
                    <p className="text-sm text-muted-foreground mt-1">Reason / 原因: {w.withdrawal_reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsentEthicsManager;
