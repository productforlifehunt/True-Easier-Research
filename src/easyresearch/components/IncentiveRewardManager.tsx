import React, { useState } from 'react';
import { Gift, DollarSign, Ticket, Users, Send, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

interface Participant { id: string; name: string; email: string; status: 'completed' | 'in_progress' | 'not_started'; rewardStatus: 'pending' | 'sent' | 'claimed' | 'failed'; rewardType?: string; rewardAmount?: number; completedAt?: string; sentAt?: string; }
interface RewardConfig { type: 'gift_card' | 'cash' | 'lottery' | 'points'; provider: string; amount: number; currency: string; lotteryWinners?: number; lotteryPrize?: number; autoSend: boolean; requireCompletion: boolean; minQualityScore?: number; }

interface Props { projectId: string; }

const IncentiveRewardManager: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'config' | 'participants' | 'analytics'>('config');
  const [config, setConfig] = useState<RewardConfig>({ type: 'gift_card', provider: 'Amazon', amount: 10, currency: 'USD', lotteryWinners: 5, lotteryPrize: 50, autoSend: false, requireCompletion: true, minQualityScore: 60 });
  const [participants] = useState<Participant[]>(Array.from({ length: 12 }, (_, i) => ({
    id: `p${i}`, name: `Participant ${i + 1}`, email: `user${i + 1}@example.com`,
    status: (['completed', 'in_progress', 'not_started'] as const)[i % 3],
    rewardStatus: (['pending', 'sent', 'claimed', 'failed'] as const)[i % 4],
    rewardType: 'Amazon Gift Card', rewardAmount: 10,
    completedAt: i % 3 === 0 ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
    sentAt: i % 4 === 1 ? new Date(Date.now() - i * 43200000).toISOString() : undefined,
  })));
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

  const completed = participants.filter(p => p.status === 'completed').length;
  const sent = participants.filter(p => p.rewardStatus === 'sent' || p.rewardStatus === 'claimed').length;
  const totalBudget = completed * config.amount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Gift className="w-5 h-5 text-amber-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Incentive & Reward Manager / 激励与奖励管理</h2>
            <p className="text-sm text-stone-500">{completed} eligible · ${totalBudget} budget · {sent} distributed</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['config', 'participants', 'analytics'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'config' ? '⚙️ Config' : v === 'participants' ? '👥 Distribute' : '📊 Analytics'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'config' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Reward Type / 奖励类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { type: 'gift_card' as const, icon: '🎁', label: 'Gift Card / 礼品卡' },
                { type: 'cash' as const, icon: '💵', label: 'Cash / 现金' },
                { type: 'lottery' as const, icon: '🎰', label: 'Lottery / 抽奖' },
                { type: 'points' as const, icon: '⭐', label: 'Points / 积分' },
              ]).map(r => (
                <button key={r.type} onClick={() => setConfig(prev => ({ ...prev, type: r.type }))}
                  className={`p-3 rounded-xl border-2 text-left ${config.type === r.type ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}>
                  <div className="text-xl mb-1">{r.icon}</div>
                  <div className="text-sm font-semibold text-stone-800">{r.label}</div>
                </button>
              ))}
            </div>

            {config.type === 'gift_card' && (
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Provider / 提供商</label>
                <select value={config.provider} onChange={e => setConfig(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                  {['Amazon', 'Visa', 'Starbucks', 'Apple', 'Google Play', 'PayPal', 'Tremendous', 'Custom'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}

            {config.type !== 'lottery' ? (
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Amount Per Participant / 每人金额</label>
                <div className="flex gap-2">
                  <select value={config.currency} onChange={e => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                    className="text-sm border border-stone-200 rounded-lg px-2 py-2 w-20">
                    {['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="number" value={config.amount} onChange={e => setConfig(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-stone-600 mb-1 block">Number of Winners / 中奖人数</label>
                  <input type="number" value={config.lotteryWinners} onChange={e => setConfig(prev => ({ ...prev, lotteryWinners: Number(e.target.value) }))}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs text-stone-600 mb-1 block">Prize Per Winner / 每位中奖者奖金</label>
                  <input type="number" value={config.lotteryPrize} onChange={e => setConfig(prev => ({ ...prev, lotteryPrize: Number(e.target.value) }))}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Eligibility Rules / 资格规则</h3>
            <div className="space-y-3">
              {[
                { label: 'Require survey completion / 要求完成调查', key: 'requireCompletion', checked: config.requireCompletion },
                { label: 'Auto-send on completion / 完成后自动发送', key: 'autoSend', checked: config.autoSend },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer p-3 bg-stone-50 rounded-xl">
                  <input type="checkbox" checked={opt.checked} onChange={() => setConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof RewardConfig] }))}
                    className="rounded text-amber-600" />
                  {opt.label}
                </label>
              ))}
              <div className="p-3 bg-stone-50 rounded-xl">
                <label className="text-xs text-stone-600 mb-1 block">Min Quality Score / 最低质量分: {config.minQualityScore}%</label>
                <input type="range" min={0} max={100} value={config.minQualityScore} onChange={e => setConfig(prev => ({ ...prev, minQualityScore: Number(e.target.value) }))}
                  className="w-full accent-amber-600" />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="text-sm font-bold text-amber-800 mb-2">💰 Budget Summary / 预算摘要</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-stone-600">Eligible participants:</span><span className="font-bold">{completed}</span></div>
                <div className="flex justify-between"><span className="text-stone-600">{config.type === 'lottery' ? 'Total prize pool:' : 'Per participant:'}</span><span className="font-bold">{config.currency} {config.type === 'lottery' ? (config.lotteryWinners || 0) * (config.lotteryPrize || 0) : config.amount}</span></div>
                <div className="flex justify-between border-t border-amber-200 pt-1 mt-1"><span className="text-stone-700 font-semibold">Total budget:</span><span className="font-bold text-amber-700">{config.currency} {config.type === 'lottery' ? (config.lotteryWinners || 0) * (config.lotteryPrize || 0) : totalBudget}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'participants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => { const eligible = participants.filter(p => p.status === 'completed' && p.rewardStatus === 'pending').map(p => p.id); setSelectedParticipants(new Set(eligible)); }}
                className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">Select All Eligible</button>
              <button className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg flex items-center gap-1" disabled={selectedParticipants.size === 0}>
                <Send className="w-3 h-3" /> Send Rewards ({selectedParticipants.size})
              </button>
            </div>
            <button className="text-xs px-3 py-1.5 bg-stone-100 rounded-lg flex items-center gap-1"><Download className="w-3 h-3" /> Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3"><input type="checkbox" className="rounded" /></th>
                <th className="text-left py-2 px-3 text-stone-600">Participant</th>
                <th className="text-left py-2 px-3 text-stone-600">Study Status</th>
                <th className="text-left py-2 px-3 text-stone-600">Reward</th>
                <th className="text-left py-2 px-3 text-stone-600">Status</th>
                <th className="text-left py-2 px-3 text-stone-600">Date</th>
              </tr></thead>
              <tbody>
                {participants.map(p => (
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-2 px-3"><input type="checkbox" checked={selectedParticipants.has(p.id)} onChange={() => { const next = new Set(selectedParticipants); next.has(p.id) ? next.delete(p.id) : next.add(p.id); setSelectedParticipants(next); }} className="rounded" /></td>
                    <td className="py-2 px-3"><div className="font-medium text-stone-800">{p.name}</div><div className="text-xs text-stone-500">{p.email}</div></td>
                    <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : p.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'}`}>{p.status}</span></td>
                    <td className="py-2 px-3 text-stone-700">{config.currency} {config.amount}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${p.rewardStatus === 'claimed' ? 'bg-emerald-100 text-emerald-700' : p.rewardStatus === 'sent' ? 'bg-blue-100 text-blue-700' : p.rewardStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {p.rewardStatus === 'claimed' ? <CheckCircle className="w-3 h-3" /> : p.rewardStatus === 'sent' ? <Send className="w-3 h-3" /> : p.rewardStatus === 'pending' ? <Clock className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {p.rewardStatus}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-stone-500">{p.sentAt ? new Date(p.sentAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              { label: 'Total Distributed', value: `${config.currency} ${sent * config.amount}`, sub: `${sent} recipients`, color: 'emerald' },
              { label: 'Pending', value: `${config.currency} ${(completed - sent) * config.amount}`, sub: `${completed - sent} waiting`, color: 'amber' },
              { label: 'Claim Rate', value: `${Math.round((participants.filter(p => p.rewardStatus === 'claimed').length / Math.max(sent, 1)) * 100)}%`, sub: 'Of sent rewards', color: 'blue' },
              { label: 'Failed Deliveries', value: participants.filter(p => p.rewardStatus === 'failed').length.toString(), sub: 'Need attention', color: 'red' },
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500">{stat.label}</div>
                <div className="text-xl font-bold text-stone-900">{stat.value}</div>
                <div className="text-xs text-stone-400">{stat.sub}</div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-3">Distribution Timeline / 分发时间线</h3>
            <div className="space-y-3">
              {participants.filter(p => p.sentAt).slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-stone-800 flex-1">{p.name}</span>
                  <span className="text-xs text-stone-500">{p.sentAt && new Date(p.sentAt).toLocaleDateString()}</span>
                  <span className="text-xs font-medium text-emerald-600">{config.currency}{config.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentiveRewardManager;
