/**
 * Incentive & Rewards Manager — Participant compensation tracking
 * 激励与奖励管理器 — 参与者报酬追踪
 */
import React, { useState, useMemo } from 'react';
import { Gift, DollarSign, Users, TrendingUp, Plus, Check, X, Download, Clock, Award } from 'lucide-react';

interface Incentive {
  id: string;
  type: 'fixed' | 'per_response' | 'lottery' | 'gift_card' | 'points';
  name: string;
  amount: number;
  currency: string;
  total_budget: number;
  spent: number;
  recipients: number;
  criteria?: string; // e.g. "complete_all", "first_100", "random_10%"
  is_active: boolean;
}

interface Disbursement {
  id: string;
  incentive_id: string;
  participant_email: string;
  amount: number;
  status: 'pending' | 'sent' | 'claimed' | 'expired';
  sent_at?: string;
  claimed_at?: string;
  code?: string;
}

interface Props {
  projectId: string;
  incentives?: Incentive[];
  disbursements?: Disbursement[];
  onUpdate?: (incentives: Incentive[]) => void;
}

const IncentiveManager: React.FC<Props> = ({ projectId, incentives: initialIncentives, disbursements: initialDisbursements, onUpdate }) => {
  const [incentives, setIncentives] = useState<Incentive[]>(initialIncentives || [
    { id: 'inc-1', type: 'fixed', name: 'Completion Bonus / 完成奖金', amount: 10, currency: 'USD', total_budget: 500, spent: 120, recipients: 12, criteria: 'complete_all', is_active: true },
    { id: 'inc-2', type: 'lottery', name: 'Lucky Draw / 抽奖', amount: 50, currency: 'USD', total_budget: 200, spent: 0, recipients: 0, criteria: 'random_10%', is_active: true },
  ]);
  const [disbursements] = useState<Disbursement[]>(initialDisbursements || []);
  const [tab, setTab] = useState<'overview' | 'incentives' | 'disbursements'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIncentive, setNewIncentive] = useState<Partial<Incentive>>({ type: 'fixed', currency: 'USD', amount: 10, total_budget: 500, is_active: true });

  const totalBudget = incentives.reduce((s, i) => s + i.total_budget, 0);
  const totalSpent = incentives.reduce((s, i) => s + i.spent, 0);
  const totalRecipients = incentives.reduce((s, i) => s + i.recipients, 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const addIncentive = () => {
    if (!newIncentive.name) return;
    const inc: Incentive = {
      id: `inc-${Date.now()}`,
      type: newIncentive.type || 'fixed',
      name: newIncentive.name || '',
      amount: newIncentive.amount || 0,
      currency: newIncentive.currency || 'USD',
      total_budget: newIncentive.total_budget || 0,
      spent: 0,
      recipients: 0,
      criteria: newIncentive.criteria,
      is_active: true,
    };
    const updated = [...incentives, inc];
    setIncentives(updated);
    onUpdate?.(updated);
    setShowAddForm(false);
    setNewIncentive({ type: 'fixed', currency: 'USD', amount: 10, total_budget: 500, is_active: true });
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'fixed': return 'Fixed / 固定';
      case 'per_response': return 'Per Response / 每次响应';
      case 'lottery': return 'Lottery / 抽奖';
      case 'gift_card': return 'Gift Card / 礼品卡';
      case 'points': return 'Points / 积分';
      default: return type;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'claimed': return 'bg-emerald-100 text-emerald-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-amber-600" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Incentives & Rewards / 激励与奖励</h2>
            <p className="text-sm text-muted-foreground">Manage participant compensation and budgets / 管理参与者报酬和预算</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          <Plus className="w-3 h-3" /> Add Incentive / 添加激励
        </button>
      </div>

      {/* Tabs / 标签 */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['overview', 'incentives', 'disbursements'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === t ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'overview' && 'Overview / 概览'}
            {t === 'incentives' && `Programs (${incentives.length})`}
            {t === 'disbursements' && `Disbursements (${disbursements.length})`}
          </button>
        ))}
      </div>

      {/* Overview / 概览 */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Budget / 总预算', value: `$${totalBudget.toLocaleString()}`, icon: DollarSign, color: 'text-foreground' },
              { label: 'Spent / 已支出', value: `$${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600' },
              { label: 'Recipients / 接收者', value: totalRecipients, icon: Users, color: 'text-blue-600' },
              { label: 'Utilization / 利用率', value: `${budgetUtilization}%`, icon: Award, color: budgetUtilization > 80 ? 'text-red-500' : 'text-emerald-600' },
            ].map((stat, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Budget Bar / 预算进度条 */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Budget Utilization / 预算利用率</span>
              <span className="text-sm text-muted-foreground">${totalSpent} / ${totalBudget}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${budgetUtilization}%`, backgroundColor: budgetUtilization > 80 ? '#ef4444' : budgetUtilization > 50 ? '#f59e0b' : '#10b981' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Incentives List / 激励列表 */}
      {tab === 'incentives' && (
        <div className="space-y-3">
          {incentives.map(inc => (
            <div key={inc.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{typeLabel(inc.type).split(' ')[0]}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{inc.name}</p>
                    <p className="text-xs text-muted-foreground">{typeLabel(inc.type)} • {inc.currency} {inc.amount} per unit</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${inc.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                  {inc.is_active ? 'Active / 活跃' : 'Paused / 已暂停'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Budget / 预算</p>
                  <p className="text-sm font-medium text-foreground">${inc.total_budget}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spent / 已支出</p>
                  <p className="text-sm font-medium text-foreground">${inc.spent}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recipients / 接收者</p>
                  <p className="text-sm font-medium text-foreground">{inc.recipients}</p>
                </div>
              </div>
              {inc.criteria && <p className="text-xs text-muted-foreground mt-2">Criteria / 条件: {inc.criteria}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Disbursements / 发放记录 */}
      {tab === 'disbursements' && (
        <div className="space-y-4">
          {disbursements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No disbursements yet / 暂无发放记录</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Participant / 参与者</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Amount / 金额</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status / 状态</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Date / 日期</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursements.map(d => (
                    <tr key={d.id} className="border-t border-border">
                      <td className="px-4 py-2 text-foreground">{d.participant_email}</td>
                      <td className="px-4 py-2 text-foreground">${d.amount}</td>
                      <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>{d.status}</span></td>
                      <td className="px-4 py-2 text-muted-foreground">{d.sent_at ? new Date(d.sent_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Form Modal / 添加表单 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
          <div className="bg-background rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground mb-4">New Incentive / 新激励</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name / 名称</label>
                <input value={newIncentive.name || ''} onChange={e => setNewIncentive(p => ({ ...p, name: e.target.value }))} className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground" placeholder="e.g. Completion Bonus" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Type / 类型</label>
                  <select value={newIncentive.type} onChange={e => setNewIncentive(p => ({ ...p, type: e.target.value as any }))} className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                    <option value="fixed">Fixed / 固定</option>
                    <option value="per_response">Per Response / 每次响应</option>
                    <option value="lottery">Lottery / 抽奖</option>
                    <option value="gift_card">Gift Card / 礼品卡</option>
                    <option value="points">Points / 积分</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Currency / 货币</label>
                  <select value={newIncentive.currency} onChange={e => setNewIncentive(p => ({ ...p, currency: e.target.value }))} className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                    <option value="USD">USD</option>
                    <option value="CNY">CNY ¥</option>
                    <option value="EUR">EUR €</option>
                    <option value="GBP">GBP £</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Amount per unit / 每单位金额</label>
                  <input type="number" value={newIncentive.amount || ''} onChange={e => setNewIncentive(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Total Budget / 总预算</label>
                  <input type="number" value={newIncentive.total_budget || ''} onChange={e => setNewIncentive(p => ({ ...p, total_budget: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel / 取消</button>
                <button onClick={addIncentive} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Create / 创建</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentiveManager;
