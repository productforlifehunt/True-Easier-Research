import React, { useState, useMemo } from 'react';
import { Mail, Upload, Send, Users, Clock, Search, Plus, Trash2, Edit, Copy, BarChart3, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

/* ────────────────────────────────────────────────────
 * Contact List & Email Campaign Engine
 * Import contacts, manage lists, create & schedule
 * email campaigns with personalized survey links.
 *
 * 联系人列表与邮件活动引擎
 * 导入联系人、管理列表、创建和调度
 * 带个性化调查链接的邮件活动。
 * ──────────────────────────────────────────────────── */

interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  embeddedData: Record<string, string>;
  status: 'active' | 'unsubscribed' | 'bounced';
  lastContacted?: string;
  responseCount: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'invitation' | 'reminder' | 'thank_you' | 'custom';
}

interface Campaign {
  id: string;
  name: string;
  templateId: string;
  contactListId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  createdAt: string;
}

interface Props {
  projectId: string;
}

const ContactListEmailCampaign: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'templates' | 'campaigns'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Mock data / 模拟数据
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'c1', email: 'alice@example.com', firstName: 'Alice', lastName: 'Wang', tags: ['pilot', 'group-a'], embeddedData: { role: 'manager' }, status: 'active', responseCount: 3 },
    { id: 'c2', email: 'bob@example.com', firstName: 'Bob', lastName: 'Chen', tags: ['pilot'], embeddedData: { role: 'developer' }, status: 'active', responseCount: 1 },
    { id: 'c3', email: 'carol@test.com', firstName: 'Carol', lastName: 'Li', tags: ['group-b'], embeddedData: {}, status: 'unsubscribed', responseCount: 0 },
    { id: 'c4', email: 'dave@test.com', firstName: 'Dave', lastName: 'Zhang', tags: ['group-a'], embeddedData: { role: 'designer' }, status: 'bounced', responseCount: 0 },
  ]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    { id: 'tmpl1', name: 'Survey Invitation', subject: 'You\'re invited to participate in our study', body: 'Hi {{firstName}},\n\nWe\'d love your input on our latest research.\n\nClick here to participate: {{surveyLink}}\n\nThank you,\n{{researcherName}}', type: 'invitation' },
    { id: 'tmpl2', name: 'Reminder', subject: 'Reminder: Complete your survey', body: 'Hi {{firstName}},\n\nJust a friendly reminder to complete the survey.\n\n{{surveyLink}}\n\nBest,\n{{researcherName}}', type: 'reminder' },
    { id: 'tmpl3', name: 'Thank You', subject: 'Thank you for participating!', body: 'Hi {{firstName}},\n\nThank you for completing our survey. Your feedback is invaluable.\n\nBest regards,\n{{researcherName}}', type: 'thank_you' },
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: 'camp1', name: 'Wave 1 Invitation', templateId: 'tmpl1', contactListId: 'all', status: 'sent', sentCount: 150, openCount: 98, clickCount: 72, bounceCount: 3, createdAt: '2026-03-01' },
    { id: 'camp2', name: 'Wave 1 Reminder', templateId: 'tmpl2', contactListId: 'all', status: 'scheduled', scheduledAt: '2026-03-10T09:00', sentCount: 0, openCount: 0, clickCount: 0, bounceCount: 0, createdAt: '2026-03-05' },
  ]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(c => c.email.includes(q) || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.tags.some(t => t.includes(q)));
  }, [contacts, searchQuery]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600', unsubscribed: 'bg-stone-100 text-stone-500',
      bounced: 'bg-red-50 text-red-500', draft: 'bg-stone-100 text-stone-500',
      scheduled: 'bg-blue-50 text-blue-600', sending: 'bg-amber-50 text-amber-600',
      sent: 'bg-emerald-50 text-emerald-600', paused: 'bg-orange-50 text-orange-600',
    };
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || ''}`}>{status}</span>;
  };

  const contactStats = useMemo(() => ({
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    unsubscribed: contacts.filter(c => c.status === 'unsubscribed').length,
    bounced: contacts.filter(c => c.status === 'bounced').length,
  }), [contacts]);

  const MERGE_FIELDS = ['{{firstName}}', '{{lastName}}', '{{email}}', '{{surveyLink}}', '{{researcherName}}', '{{projectTitle}}', '{{completionCode}}'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Contact List & Email Campaigns / 联系人与邮件活动</h2>
            <p className="text-xs text-stone-500">Manage participants, design emails, automate outreach / 管理参与者、设计邮件、自动化触达</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs / 子标签 */}
      <div className="flex gap-1 border-b border-stone-200">
        {([['contacts', `Contacts (${contacts.length}) / 联系人`], ['templates', 'Templates / 模板'], ['campaigns', 'Campaigns / 活动']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* CONTACTS TAB / 联系人标签 */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {/* Stats / 统计 */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Total / 总数', value: contactStats.total, icon: Users, color: 'text-blue-600' },
              { label: 'Active / 活跃', value: contactStats.active, icon: CheckCircle2, color: 'text-emerald-600' },
              { label: 'Unsubscribed / 退订', value: contactStats.unsubscribed, icon: AlertCircle, color: 'text-stone-500' },
              { label: 'Bounced / 退信', value: contactStats.bounced, icon: AlertCircle, color: 'text-red-500' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3">
                <stat.icon size={16} className={stat.color} />
                <div>
                  <p className="text-lg font-bold text-stone-800">{stat.value}</p>
                  <p className="text-[10px] text-stone-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Import / 搜索和导入 */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search contacts... / 搜索联系人..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <button onClick={() => setShowImportModal(true)}
              className="px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1">
              <Upload size={12} /> Import CSV / 导入CSV
            </button>
            <button className="px-3 py-2 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 flex items-center gap-1">
              <Plus size={12} /> Add / 添加
            </button>
          </div>

          {/* Contact table / 联系人表格 */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Email</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Name / 姓名</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Tags / 标签</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Status / 状态</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Responses / 回复</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(c => (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-2.5 text-stone-700">{c.email}</td>
                    <td className="px-4 py-2.5 text-stone-600">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">{c.tags.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded">{t}</span>
                      ))}</div>
                    </td>
                    <td className="px-4 py-2.5">{statusBadge(c.status)}</td>
                    <td className="px-4 py-2.5 text-stone-600">{c.responseCount}</td>
                    <td className="px-4 py-2.5">
                      <button className="p-1 text-stone-400 hover:text-stone-600"><Edit size={12} /></button>
                      <button className="p-1 text-stone-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEMPLATES TAB / 模板标签 */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-xs text-stone-500">{templates.length} templates / 模板</p>
            <button onClick={() => { setEditingTemplate({ id: `tmpl_${Date.now()}`, name: '', subject: '', body: '', type: 'custom' }); setShowTemplateEditor(true); }}
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1">
              <Plus size={12} /> New Template / 新建模板
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tmpl.type === 'invitation' ? 'bg-blue-50 text-blue-600' : tmpl.type === 'reminder' ? 'bg-amber-50 text-amber-600' : tmpl.type === 'thank_you' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                    {tmpl.type}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1 text-stone-400 hover:text-stone-600"><Copy size={12} /></button>
                    <button onClick={() => { setEditingTemplate(tmpl); setShowTemplateEditor(true); }} className="p-1 text-stone-400 hover:text-stone-600"><Edit size={12} /></button>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-stone-700 mb-1">{tmpl.name}</h4>
                <p className="text-xs text-stone-500 mb-2">Subject: {tmpl.subject}</p>
                <p className="text-[10px] text-stone-400 line-clamp-3">{tmpl.body}</p>
              </div>
            ))}
          </div>

          {/* Merge fields reference / 合并字段参考 */}
          <div className="bg-stone-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-stone-500 uppercase mb-2">Available Merge Fields / 可用合并字段</h4>
            <div className="flex flex-wrap gap-2">
              {MERGE_FIELDS.map(f => (
                <code key={f} className="text-[10px] px-2 py-1 bg-white border border-stone-200 rounded text-emerald-600 font-mono">{f}</code>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB / 活动标签 */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-xs text-stone-500">{campaigns.length} campaigns / 活动</p>
            <button className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1">
              <Plus size={12} /> New Campaign / 新建活动
            </button>
          </div>

          {campaigns.map(camp => (
            <div key={camp.id} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-stone-700">{camp.name}</h4>
                  {statusBadge(camp.status)}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400">
                  {camp.scheduledAt && <span className="flex items-center gap-1"><Calendar size={10} /> {camp.scheduledAt}</span>}
                  <span>{camp.createdAt}</span>
                </div>
              </div>

              {/* Campaign metrics / 活动指标 */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Sent / 已发送', value: camp.sentCount, icon: Send },
                  { label: 'Opened / 已打开', value: camp.openCount, rate: camp.sentCount > 0 ? Math.round((camp.openCount / camp.sentCount) * 100) : 0 },
                  { label: 'Clicked / 已点击', value: camp.clickCount, rate: camp.sentCount > 0 ? Math.round((camp.clickCount / camp.sentCount) * 100) : 0 },
                  { label: 'Bounced / 退信', value: camp.bounceCount, rate: camp.sentCount > 0 ? Math.round((camp.bounceCount / camp.sentCount) * 100) : 0 },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <p className="text-lg font-bold text-stone-700">{m.value}</p>
                    <p className="text-[10px] text-stone-400">{m.label}</p>
                    {'rate' in m && m.rate !== undefined && <p className="text-[9px] text-stone-400">{m.rate}%</p>}
                  </div>
                ))}
              </div>

              {/* Progress bar for sent campaigns / 已发送活动的进度条 */}
              {camp.status === 'sent' && camp.sentCount > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${(camp.openCount / camp.sentCount) * 100}%` }} />
                    <div className="h-full bg-blue-400" style={{ width: `${((camp.clickCount - 0) / camp.sentCount) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-stone-400">{Math.round((camp.openCount / camp.sentCount) * 100)}% open rate</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Import CSV Modal / 导入CSV弹窗 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-stone-800 mb-4">Import Contacts / 导入联系人</h3>
            <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center mb-4">
              <Upload size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">Drop CSV file here or click to browse</p>
              <p className="text-xs text-stone-400 mt-1">Required columns: email. Optional: firstName, lastName, tags</p>
              <p className="text-xs text-stone-400">必填列: email。可选: firstName, lastName, tags</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowImportModal(false)} className="flex-1 px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-lg">Cancel / 取消</button>
              <button className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Import / 导入</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal / 模板编辑弹窗 */}
      {showTemplateEditor && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowTemplateEditor(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-stone-800 mb-4">Edit Template / 编辑模板</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Name / 名称</label>
                <input value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Subject / 主题</label>
                <input value={editingTemplate.subject} onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Type / 类型</label>
                <select value={editingTemplate.type} onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white">
                  <option value="invitation">Invitation / 邀请</option>
                  <option value="reminder">Reminder / 提醒</option>
                  <option value="thank_you">Thank You / 感谢</option>
                  <option value="custom">Custom / 自定义</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Body / 正文</label>
                <textarea value={editingTemplate.body} onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  rows={8} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg font-mono resize-y" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowTemplateEditor(false)} className="flex-1 px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-lg">Cancel</button>
              <button onClick={() => {
                setTemplates(prev => {
                  const exists = prev.find(t => t.id === editingTemplate.id);
                  return exists ? prev.map(t => t.id === editingTemplate.id ? editingTemplate : t) : [...prev, editingTemplate];
                });
                setShowTemplateEditor(false);
              }} className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save / 保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactListEmailCampaign;
