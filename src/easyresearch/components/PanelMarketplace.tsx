import React, { useState } from 'react';
import { Globe, Users, Zap, Shield, Clock, DollarSign, Filter, ExternalLink, CheckCircle } from 'lucide-react';

interface PanelProvider { id: string; name: string; logo: string; avgCostPerResponse: number; avgResponseTime: string; totalPanelists: string; qualityScore: number; regions: string[]; features: string[]; connected: boolean; }

interface Props { projectId: string; }

const PanelMarketplace: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'marketplace' | 'recruitment' | 'monitor'>('marketplace');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [targetN, setTargetN] = useState(100);
  const [targetDemographics, setTargetDemographics] = useState({ ageRange: '18-65', gender: 'all', country: 'US' });

  const providers: PanelProvider[] = [
    { id: 'prolific', name: 'Prolific', logo: 'P', avgCostPerResponse: 8, avgResponseTime: '< 1 hour', totalPanelists: '200K+', qualityScore: 95, regions: ['Global'], features: ['Pre-screening', 'Longitudinal', 'Naivety checks'], connected: true },
    { id: 'cint', name: 'Cint / Lucid', logo: 'C', avgCostPerResponse: 5, avgResponseTime: '2-4 hours', totalPanelists: '300M+', regions: ['Global'], qualityScore: 88, features: ['Massive scale', 'B2B panels', 'Multi-market'], connected: false },
    { id: 'mturk', name: 'Amazon MTurk', logo: 'M', avgCostPerResponse: 2, avgResponseTime: '< 30 min', totalPanelists: '500K+', regions: ['US-heavy'], qualityScore: 75, features: ['Cheapest', 'Fastest', 'Custom quals'], connected: false },
    { id: 'respondent', name: 'Respondent.io', logo: 'R', avgCostPerResponse: 15, avgResponseTime: '1-3 days', totalPanelists: '3M+', regions: ['US, UK, EU'], qualityScore: 92, features: ['B2B professionals', 'Interview recruits', 'High quality'], connected: false },
    { id: 'userinterviews', name: 'User Interviews', logo: 'U', avgCostPerResponse: 12, avgResponseTime: '1-2 days', totalPanelists: '2M+', regions: ['US, UK, CA'], qualityScore: 90, features: ['UX research focus', 'Scheduling', 'Screener integration'], connected: false },
    { id: 'positionly', name: 'Positly', logo: 'P', avgCostPerResponse: 3, avgResponseTime: '< 1 hour', totalPanelists: '100K+', regions: ['US'], qualityScore: 82, features: ['Academic focused', 'CloudResearch integration', 'Attention checks'], connected: false },
  ];

  const mockRecruitment = { requested: targetN, recruited: Math.floor(targetN * 0.72), completed: Math.floor(targetN * 0.58), rejected: Math.floor(targetN * 0.08), avgTime: '4m 23s', costSoFar: Math.floor(targetN * 0.58 * (providers.find(p => p.id === (selectedProvider || 'prolific'))?.avgCostPerResponse || 8)) };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center"><Globe className="w-5 h-5 text-cyan-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Panel Marketplace / 面板市场</h2>
            <p className="text-sm text-stone-500">Recruit from {providers.length} panel providers / 从{providers.length}个面板提供商招募</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['marketplace', 'recruitment', 'monitor'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-cyan-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'marketplace' ? '🏪 Panels' : v === 'recruitment' ? '🎯 Recruit' : '📡 Monitor'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'marketplace' && (
        <div className="grid grid-cols-2 gap-4">
          {providers.map(p => (
            <div key={p.id} onClick={() => setSelectedProvider(p.id)}
              className={`p-4 bg-white rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedProvider === p.id ? 'border-cyan-500' : 'border-stone-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.logo}</span>
                  <div>
                    <div className="font-bold text-stone-900">{p.name}</div>
                    <div className="text-xs text-stone-500">{p.totalPanelists} panelists</div>
                  </div>
                </div>
                {p.connected && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Connected</span>}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><div className="text-xs text-stone-500">Cost/resp</div><div className="text-sm font-bold text-stone-800">${p.avgCostPerResponse}</div></div>
                <div><div className="text-xs text-stone-500">Speed</div><div className="text-sm font-bold text-stone-800">{p.avgResponseTime}</div></div>
                <div><div className="text-xs text-stone-500">Quality</div><div className="text-sm font-bold text-stone-800">{p.qualityScore}/100</div></div>
              </div>
              <div className="flex flex-wrap gap-1">{p.features.map((f, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-stone-100 rounded-full text-stone-600">{f}</span>)}</div>
              <div className="flex gap-1 mt-2">{p.regions.map((r, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full">{r}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'recruitment' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Recruitment Setup / 招募设置</h3>
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Panel Provider</label>
              <select value={selectedProvider || ''} onChange={e => setSelectedProvider(e.target.value)} className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                <option value="">Select provider...</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name} (${p.avgCostPerResponse}/resp)</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Target Sample Size: {targetN}</label>
              <input type="range" min={10} max={1000} value={targetN} onChange={e => setTargetN(Number(e.target.value))} className="w-full accent-cyan-600" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs text-stone-600 mb-1 block">Age Range</label>
                <input value={targetDemographics.ageRange} onChange={e => setTargetDemographics(p => ({ ...p, ageRange: e.target.value }))} className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5" /></div>
              <div><label className="text-xs text-stone-600 mb-1 block">Gender</label>
                <select value={targetDemographics.gender} onChange={e => setTargetDemographics(p => ({ ...p, gender: e.target.value }))} className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5">
                  <option value="all">All</option><option value="male">Male</option><option value="female">Female</option><option value="balanced">Balanced</option>
                </select></div>
              <div><label className="text-xs text-stone-600 mb-1 block">Country</label>
                <select value={targetDemographics.country} onChange={e => setTargetDemographics(p => ({ ...p, country: e.target.value }))} className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5">
                  {['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'IN', 'Global'].map(c => <option key={c}>{c}</option>)}
                </select></div>
            </div>
            <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
              <h4 className="text-sm font-bold text-cyan-800 mb-2">💰 Cost Estimate / 费用估算</h4>
              <div className="text-2xl font-bold text-cyan-900">${targetN * (providers.find(p => p.id === selectedProvider)?.avgCostPerResponse || 8)}</div>
              <div className="text-xs text-cyan-600">{targetN} × ${providers.find(p => p.id === selectedProvider)?.avgCostPerResponse || 8}/response</div>
            </div>
            <button className="w-full py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Launch Recruitment / 启动招募
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Screening Pass-through / 筛选直通</h3>
            <p className="text-sm text-stone-500">Your project screener will be applied to panel participants / 项目筛选器将应用于面板参与者</p>
            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
              {['Age: 18-65', 'Gender: All', 'Has used product X: Yes', 'English proficiency: Native/Fluent'].map((crit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-stone-700">{crit}</span></div>
              ))}
            </div>
            <div className="text-xs text-stone-500">Estimated qualification rate: <span className="font-bold text-cyan-600">~65%</span></div>
          </div>
        </div>
      )}

      {activeView === 'monitor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Requested', value: mockRecruitment.requested, icon: '🎯' },
              { label: 'Recruited', value: mockRecruitment.recruited, icon: '👥' },
              { label: 'Completed', value: mockRecruitment.completed, icon: '✅' },
              { label: 'Rejected', value: mockRecruitment.rejected, icon: '❌' },
              { label: 'Cost So Far', value: `$${mockRecruitment.costSoFar}`, icon: '💵' },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-stone-900">{s.value}</div>
                <div className="text-[10px] text-stone-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-3">Recruitment Progress / 招募进度</h3>
            <div className="h-4 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${(mockRecruitment.completed / mockRecruitment.requested) * 100}%` }} />
            </div>
            <div className="text-sm text-stone-600">{mockRecruitment.completed} / {mockRecruitment.requested} completed ({Math.round((mockRecruitment.completed / mockRecruitment.requested) * 100)}%)</div>
            <div className="text-xs text-stone-500 mt-1">Avg completion time: {mockRecruitment.avgTime}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelMarketplace;
