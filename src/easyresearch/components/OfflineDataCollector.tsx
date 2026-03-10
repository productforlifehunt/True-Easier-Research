import React, { useState } from 'react';
import { WifiOff, Wifi, RefreshCw, Smartphone, Database, CheckCircle, AlertTriangle, Clock, Download, Upload } from 'lucide-react';

interface QueuedResponse { id: string; questionnaireId: string; questionnaireName: string; capturedAt: string; syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'; retryCount: number; size: string; }
interface OfflineConfig { enabled: boolean; autoSync: boolean; syncInterval: number; maxQueueSize: number; compressData: boolean; cacheQuestions: boolean; showOfflineBadge: boolean; }

interface Props { projectId: string; }

const OfflineDataCollector: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'config' | 'queue' | 'status'>('config');
  const [isOnline, setIsOnline] = useState(true);
  const [config, setConfig] = useState<OfflineConfig>({ enabled: true, autoSync: true, syncInterval: 30, maxQueueSize: 500, compressData: true, cacheQuestions: true, showOfflineBadge: true });
  const [queue] = useState<QueuedResponse[]>(Array.from({ length: 6 }, (_, i) => ({
    id: `q${i}`, questionnaireId: `qn${i % 3}`, questionnaireName: ['Daily Mood Log', 'Activity Survey', 'Health Check'][i % 3],
    capturedAt: new Date(Date.now() - i * 1800000).toISOString(),
    syncStatus: (['pending', 'syncing', 'synced', 'failed'] as const)[i % 4],
    retryCount: i % 4 === 3 ? 3 : 0, size: `${(2 + Math.random() * 8).toFixed(1)} KB`,
  })));

  const pendingCount = queue.filter(q => q.syncStatus === 'pending').length;
  const syncedCount = queue.filter(q => q.syncStatus === 'synced').length;
  const failedCount = queue.filter(q => q.syncStatus === 'failed').length;
  const totalSize = queue.reduce((s, q) => s + parseFloat(q.size), 0).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            {isOnline ? <Wifi className="w-5 h-5 text-emerald-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Offline Data Collection / 离线数据收集</h2>
            <p className="text-sm text-stone-500">{isOnline ? 'Online' : 'Offline'} · {pendingCount} pending · {totalSize} KB queued</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsOnline(!isOnline)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {isOnline ? 'Online' : 'Simulate Offline'}
          </button>
          {(['config', 'queue', 'status'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-slate-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'config' ? 'Config' : v === 'queue' ? 'Queue' : 'Status'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'config' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Offline Settings / 离线设置</h3>
            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
              {[
                { key: 'enabled' as const, label: 'Enable offline mode / 启用离线模式' },
                { key: 'autoSync' as const, label: 'Auto-sync when online / 联网时自动同步' },
                { key: 'compressData' as const, label: 'Compress queued data / 压缩排队数据' },
                { key: 'cacheQuestions' as const, label: 'Cache survey questions / 缓存调查问题' },
                { key: 'showOfflineBadge' as const, label: 'Show offline badge to participant / 向参与者显示离线徽章' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={config[opt.key]} onChange={() => setConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))} className="rounded text-slate-600" />
                  {opt.label}
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Sync Interval (seconds) / 同步间隔: {config.syncInterval}s</label>
              <input type="range" min={5} max={300} step={5} value={config.syncInterval} onChange={e => setConfig(prev => ({ ...prev, syncInterval: Number(e.target.value) }))} className="w-full accent-slate-600" />
            </div>
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Max Queue Size / 最大队列: {config.maxQueueSize} responses</label>
              <input type="range" min={50} max={2000} step={50} value={config.maxQueueSize} onChange={e => setConfig(prev => ({ ...prev, maxQueueSize: Number(e.target.value) }))} className="w-full accent-slate-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">How It Works / 工作原理</h3>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Cache / 缓存', desc: 'Survey questions cached in IndexedDB / 调查问题缓存在IndexedDB中', icon: '1' },
                { step: '2', title: 'Collect / 收集', desc: 'Responses queued locally when offline / 离线时响应本地排队', icon: '2' },
                { step: '3', title: 'Detect / 检测', desc: 'Auto-detect connectivity changes / 自动检测网络变化', icon: '3' },
                { step: '4', title: 'Sync / 同步', desc: 'Queue-based sync with retry logic / 基于队列的同步与重试逻辑', icon: '4' },
                { step: '5', title: 'Verify / 验证', desc: 'Server confirms receipt, removes from queue / 服务器确认接收后从队列移除', icon: '5' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Step {s.step}: {s.title}</div>
                    <div className="text-xs text-stone-500">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile Optimization / 移动优化</h4>
              <p className="text-xs text-stone-500">Works with Capacitor for native offline support on iOS/Android. Uses ServiceWorker for PWA fallback. / 配合Capacitor实现iOS/Android原生离线支持，使用ServiceWorker作为PWA回退。</p>
            </div>
          </div>
        </div>
      )}

      {activeView === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-xs">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">⏳ Pending: {pendingCount}</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">✅ Synced: {syncedCount}</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">❌ Failed: {failedCount}</span>
            </div>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 bg-slate-600 text-white rounded-lg flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Sync Now</button>
              <button className="text-xs px-3 py-1.5 bg-stone-100 rounded-lg flex items-center gap-1"><Download className="w-3 h-3" /> Export Queue</button>
            </div>
          </div>
          <div className="space-y-2">
            {queue.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-stone-200">
                {item.syncStatus === 'synced' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : item.syncStatus === 'failed' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : item.syncStatus === 'syncing' ? <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" /> : <Clock className="w-5 h-5 text-amber-500" />}
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">{item.questionnaireName}</div>
                  <div className="text-xs text-stone-500">{new Date(item.capturedAt).toLocaleString()} · {item.size}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-700' : item.syncStatus === 'failed' ? 'bg-red-100 text-red-700' : item.syncStatus === 'syncing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{item.syncStatus}</span>
                {item.retryCount > 0 && <span className="text-xs text-red-500">Retries: {item.retryCount}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'status' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cache Status', value: 'Active', icon: '💾', color: 'emerald' },
                { label: 'Storage Used', value: `${totalSize} KB`, icon: '📊', color: 'blue' },
                { label: 'Queue Capacity', value: `${queue.length}/${config.maxQueueSize}`, icon: '📦', color: 'amber' },
                { label: 'Last Sync', value: '2 min ago', icon: '🔄', color: 'stone' },
              ].map((s, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-stone-200">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-sm font-bold text-stone-900">{s.value}</div>
                  <div className="text-[10px] text-stone-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-3">Cached Questionnaires / 缓存的问卷</h3>
            <div className="space-y-2">
              {['Daily Mood Log (12 questions)', 'Activity Survey (8 questions)', 'Health Check (20 questions)'].map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 bg-stone-50 rounded-lg">
                  <Database className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-700 flex-1">{q}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 mt-3">Last updated: 5 minutes ago / 最后更新：5分钟前</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineDataCollector;
