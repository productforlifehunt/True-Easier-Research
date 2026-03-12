import React, { useState, useMemo } from 'react';
import { Save, Link, Clock, BarChart3, Settings, CheckCircle2, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

/* ────────────────────────────────────────────────────
 * Save & Continue (Partial Responses) Manager
 * 保存并继续（部分回复）管理器
 * ──────────────────────────────────────────────────── */

interface SaveContinueConfig {
  enabled: boolean;
  autoSaveInterval: number;
  resumeMethod: 'unique_link' | 'email_code' | 'login';
  expiryDays: number;
  showSaveButton: boolean;
  saveButtonText: string;
  saveButtonTextZh: string;
  resumeMessage: string;
  resumeMessageZh: string;
  notifyOnResume: boolean;
  maxResumes: number;
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
  const { t } = useI18n();
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
            <h2 className="text-lg font-bold text-stone-800">{t('sc.title')}</h2>
            <p className="text-xs text-stone-500">{t('sc.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {([['config', t('sc.configuration')], ['monitor', `${t('sc.monitor')} (${stats.active} ${t('sc.active')})`]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-700">{t('sc.enableSaveAndContinue')}</p>
                <p className="text-xs text-stone-400">{t('sc.enableDesc')}</p>
              </div>
              <button onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-10 h-5 rounded-full transition-colors ${config.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">{t('sc.autoSave')}</h4>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">{t('sc.intervalLabel')}</label>
              <input type="number" value={config.autoSaveInterval} onChange={e => setConfig(prev => ({ ...prev, autoSaveInterval: parseInt(e.target.value) || 0 }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">{t('sc.resumeMethod')}</label>
              <div className="flex gap-1 mt-1">
                {([['unique_link', t('sc.uniqueLink')], ['email_code', t('sc.emailCode')], ['login', t('sc.login')]] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setConfig(prev => ({ ...prev, resumeMethod: val as any }))}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg ${config.resumeMethod === val ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">{t('sc.expiryAndLimits')}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">{t('sc.expiryDays')}</label>
                <input type="number" value={config.expiryDays} onChange={e => setConfig(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 1 }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 uppercase">{t('sc.maxResumes')}</label>
                <input type="number" value={config.maxResumes} onChange={e => setConfig(prev => ({ ...prev, maxResumes: parseInt(e.target.value) || 0 }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-500 uppercase">{t('sc.participantUI')}</h4>
            <label className="flex items-center justify-between">
              <span className="text-xs text-stone-600">{t('sc.showSaveButton')}</span>
              <button onClick={() => setConfig(prev => ({ ...prev, showSaveButton: !prev.showSaveButton }))}
                className={`w-8 h-4 rounded-full transition-colors ${config.showSaveButton ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.showSaveButton ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">{t('sc.buttonTextEN')}</label>
              <input value={config.saveButtonText} onChange={e => setConfig(prev => ({ ...prev, saveButtonText: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">{t('sc.buttonTextZH')}</label>
              <input value={config.saveButtonTextZh} onChange={e => setConfig(prev => ({ ...prev, saveButtonTextZh: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
            </div>
            <label className="flex items-center justify-between">
              <span className="text-xs text-stone-600">{t('sc.notifyOnResume')}</span>
              <button onClick={() => setConfig(prev => ({ ...prev, notifyOnResume: !prev.notifyOnResume }))}
                className={`w-8 h-4 rounded-full transition-colors ${config.notifyOnResume ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.notifyOnResume ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </div>
      )}

      {/* MONITOR TAB */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              { label: t('sc.total'), value: stats.total, color: 'text-stone-700' },
              { label: t('sc.activeLabel'), value: stats.active, color: 'text-blue-600' },
              { label: t('sc.resumed'), value: stats.resumed, color: 'text-emerald-600' },
              { label: t('sc.expired'), value: stats.expired, color: 'text-red-500' },
              { label: t('sc.avgProgress'), value: `${stats.avgProgress}%`, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.participant')}</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.progress')}</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.lastSaved')}</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.expires')}</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.resumes')}</th>
                  <th className="text-left px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.status')}</th>
                  <th className="px-4 py-2 text-xs text-stone-500 font-semibold">{t('sc.link')}</th>
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
                        <button className="p-1 text-blue-500 hover:text-blue-700" title={t('sc.copyResumeLink')}>
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
