import React, { useState, useMemo } from 'react';
import { Save, Link, Clock, BarChart3, Settings, CheckCircle2, AlertCircle, RefreshCw, Users } from 'lucide-react';

/* ────────────────────────────────────────────────────
 * Save & Continue (Partial Responses) Manager
 * Configure and monitor partial response saving,
 * allowing participants to resume later via unique link.
 *
 * 保存并继续（部分回复）管理器
 * 配置和监控部分回复保存，
 * 允许参与者通过唯一链接稍后继续。
 * ──────────────────────────────────────────────────── */

interface SaveContinueConfig {
  enabled: boolean;
  autoSaveInterval: number; // seconds, 0 = disabled
  resumeMethod: 'unique_link' | 'email_code' | 'login';
  expiryDays: number;
  showSaveButton: boolean;
  saveButtonText: string;
  saveButtonTextZh: string;
  resumeMessage: string;
  resumeMessageZh: string;
  notifyOnResume: boolean;
  maxResumes: number; // 0 = unlimited
}

interface PartialResponse {
  id: string;
  participantEmail: string;
  resumeToken: string;
  questionsAnswered: number;
  totalQuestions: number;
  lastSavedAt: string;
  expiresAt: string;
  status: 'active' | 'resumed' | 'expired' | 'completed';
  resumeCount: number;
}

interface Props {
  projectId: string;
}

const SaveAndContinueManager: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'monitor'>('config');
  const [config, setConfig] = useState<SaveContinueConfig>({
    enabled: true,
    autoSaveInterval: 30,
    resumeMethod: 'unique_link',
    expiryDays: 7,
    showSaveButton: true,
    saveButtonText: 'Save & Continue Later',
    saveButtonTextZh: '保存并稍后继续',
    resumeMessage: 'Your progress has been saved. Use the link below to continue later.',
    resumeMessageZh: '您的进度已保存。使用以下链接稍后继续。',
    notifyOnResume: true,
    maxResumes: 0,
  });

  // Mock partial responses / 模拟部分回复
  const partialResponses: PartialResponse[] = useMemo(() => [
    { id: 'pr1', participantEmail: 'alice@example.com', resumeToken: 'tk_abc123', questionsAnswered: 8, totalQuestions: 20, lastSavedAt: '2026-03-08T14:30:00', expiresAt: '2026-03-15T14:30:00', status: 'active', resumeCount: 0 },
    { id: 'pr2', participantEmail: 'bob@example.com', resumeToken: 'tk_def456', questionsAnswered: 15, totalQuestions: 20, lastSavedAt: '2026-03-07T10:15:00', expiresAt: '2026-03-14T10:15:00', status: 'resumed', resumeCount: 1 },
    { id: 'pr3', participantEmail: 'carol@example.com', resumeToken: 'tk_ghi789', questionsAnswered: 3, totalQuestions: 20, lastSavedAt: '2026-02-28T09:00:00', expiresAt: '2026-03-07T09:00:00', status: 'expired', resumeCount: 0 },
    { id: 'pr4', participantEmail: 'dave@example.com', resumeToken: 'tk_jkl012', questionsAnswered: 20, totalQuestions: 20, lastSavedAt: '2026-03-06T16:45:00', expiresAt: '2026-03-13T16:45:00', status: 'completed', resumeCount: 2 },
  ], []);

  const stats = useMemo(() => ({
    total: partialResponses.length,
    active: partialResponses.filter(r => r.status === 'active').length,
    resumed: partialResponses.filter(r => r.status === 'resumed').length,
    expired: partialResponses.filter(r => r.status === 'expired').length,
    completed: partialResponses.filter(r => r.status === 'completed').length,
    avgProgress: partialResponses.length > 0 ? Math.round(partialResponses.reduce((a, r) => a + (r.questionsAnswered / r.totalQuestions) * 100, 0) / partialResponses.length) : 0,
  }), [partialResponses]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-blue-50 text-blue-600', resumed: 'bg-emerald-50 text-emerald-600',
      expired: 'bg-red-50 text-red-500', completed: 'bg-emerald-50 text-emerald-600',
    };
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Save size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Save & Continue / 保存并继续</h2>
            <p className="text-xs text-stone-500">Allow participants to save progress and resume later / 允许参与者保存进度并稍后继续</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs / 子标签 */}
      <div className="flex gap-1 border-b border-stone-200">
        {([['config', 'Configuration / 配置'], ['monitor', `Monitor (${stats.active} active) / 监控`]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* CONFIG TAB / 配置标签 */}
      {activeTab === 'config' && (
        <div className="space-y-4 max-w-2xl">
          {/* Enable toggle / 启用开关 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-700">Enable Save & Continue / 启用保存并继续</p>
                <p className="text-xs text-stone-400">Participants can save progress and return via a unique link / 参与者可以保存进度并通过唯一链接返回</p>
              </div>
              <button onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-10 h-5 rounded-full transition-colors ${config.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>

          {/* Auto-save / 自动保存 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">Auto-Save / 自动保存</h4>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Interval (seconds, 0 = disabled) / 间隔（秒，0=禁用）</label>
              <input type="number" value={config.autoSaveInterval} onChange={e => setConfig(prev => ({ ...prev, autoSaveInterval: parseInt(e.target.value) || 0 }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Resume Method / 恢复方式</label>
              <div className="flex gap-1 mt-1">
                {([['unique_link', 'Unique Link / 唯一链接'], ['email_code', 'Email Code / 邮件验证码'], ['login', 'Login / 登录']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setConfig(prev => ({ ...prev, resumeMethod: val }))}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg ${config.resumeMethod === val ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expiry / 过期 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">Expiry & Limits / 过期与限制</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Expiry (days) / 过期天数</label>
                <input type="number" value={config.expiryDays} onChange={e => setConfig(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 1 }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">Max Resumes (0 = unlimited) / 最大恢复次数</label>
                <input type="number" value={config.maxResumes} onChange={e => setConfig(prev => ({ ...prev, maxResumes: parseInt(e.target.value) || 0 }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* UI Settings / UI设置 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">Participant UI / 参与者界面</h4>
            <label className="flex items-center justify-between">
              <span className="text-xs text-stone-600">Show Save Button / 显示保存按钮</span>
              <button onClick={() => setConfig(prev => ({ ...prev, showSaveButton: !prev.showSaveButton }))}
                className={`w-8 h-4 rounded-full transition-colors ${config.showSaveButton ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.showSaveButton ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Button Text (EN)</label>
              <input value={config.saveButtonText} onChange={e => setConfig(prev => ({ ...prev, saveButtonText: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Button Text (ZH)</label>
              <input value={config.saveButtonTextZh} onChange={e => setConfig(prev => ({ ...prev, saveButtonTextZh: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <label className="flex items-center justify-between">
              <span className="text-xs text-stone-600">Notify researcher on resume / 恢复时通知研究员</span>
              <button onClick={() => setConfig(prev => ({ ...prev, notifyOnResume: !prev.notifyOnResume }))}
                className={`w-8 h-4 rounded-full transition-colors ${config.notifyOnResume ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.notifyOnResume ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </div>
      )}

      {/* MONITOR TAB / 监控标签 */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">
          {/* Stats / 统计 */}
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              { label: 'Total / 总数', value: stats.total, color: 'text-stone-700' },
              { label: 'Active / 活跃', value: stats.active, color: 'text-blue-600' },
              { label: 'Resumed / 已恢复', value: stats.resumed, color: 'text-emerald-600' },
              { label: 'Expired / 已过期', value: stats.expired, color: 'text-red-500' },
              { label: 'Avg Progress / 平均进度', value: `${stats.avgProgress}%`, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table / 表格 */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Participant / 参与者</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Progress / 进度</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Last Saved / 最后保存</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Expires / 过期</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Resumes / 恢复次数</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">Status / 状态</th>
                  <th className="px-4 py-2 text-xs text-stone-500 font-semibold">Link / 链接</th>
                </tr>
              </thead>
              <tbody>
                {partialResponses.map(r => (
                  <tr key={r.id} className="border-b border-stone-50">
                    <td className="px-4 py-2.5 text-stone-700">{r.participantEmail}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(r.questionsAnswered / r.totalQuestions) * 100}%` }} />
                        </div>
                        <span className="text-xs text-stone-500">{r.questionsAnswered}/{r.totalQuestions}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-stone-500">{new Date(r.lastSavedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-xs text-stone-500">{new Date(r.expiresAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-xs text-stone-600">{r.resumeCount}</td>
                    <td className="px-4 py-2.5">{statusBadge(r.status)}</td>
                    <td className="px-4 py-2.5">
                      {r.status === 'active' && (
                        <button className="p-1 text-blue-500 hover:text-blue-700" title="Copy resume link">
                          <Link size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveAndContinueManager;
