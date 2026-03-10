/**
 * Audit Trail & Compliance Log — Timestamped log of all project changes
 * 审计追踪与合规日志 — 所有项目更改的时间戳日志
 */
import React, { useState, useMemo } from 'react';
import { Shield, Clock, Filter, Download, Search, User, FileText, Settings, Eye, FolderOpen, ClipboardList, HelpCircle, UserCheck, MessageCircle, Lock, Palette, Upload, File } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: 'project' | 'questionnaire' | 'question' | 'enrollment' | 'response' | 'consent' | 'setting' | 'layout' | 'export';
  entity_id?: string;
  entity_name?: string;
  details?: Record<string, any>;
  ip_address?: string;
}

interface Props {
  projectId: string;
  auditLog?: AuditEntry[];
}

const AuditTrail: React.FC<Props> = ({ projectId, auditLog: inputLog }) => {
  // Demo data / 演示数据
  const auditLog: AuditEntry[] = inputLog || [
    { id: 'a1', timestamp: new Date(Date.now() - 300000).toISOString(), user_id: 'u1', user_name: 'Dr. Sarah Chen', action: 'Published project', entity_type: 'project', entity_name: 'UX Study 2026', details: { status: 'published' } },
    { id: 'a2', timestamp: new Date(Date.now() - 1200000).toISOString(), user_id: 'u1', user_name: 'Dr. Sarah Chen', action: 'Added question', entity_type: 'question', entity_name: 'Q12: Overall satisfaction', details: { question_type: 'likert' } },
    { id: 'a3', timestamp: new Date(Date.now() - 3600000).toISOString(), user_id: 'u2', user_name: 'James Park', action: 'Updated logic rule', entity_type: 'questionnaire', entity_name: 'Screening Survey' },
    { id: 'a4', timestamp: new Date(Date.now() - 7200000).toISOString(), user_id: 'u1', user_name: 'Dr. Sarah Chen', action: 'Exported responses', entity_type: 'export', details: { format: 'CSV', count: 142 } },
    { id: 'a5', timestamp: new Date(Date.now() - 86400000).toISOString(), user_id: 'u2', user_name: 'James Park', action: 'Modified consent form', entity_type: 'consent', entity_name: 'v1.2' },
    { id: 'a6', timestamp: new Date(Date.now() - 172800000).toISOString(), user_id: 'u1', user_name: 'Dr. Sarah Chen', action: 'Created version snapshot', entity_type: 'project', details: { version: 'v3.0' } },
    { id: 'a7', timestamp: new Date(Date.now() - 259200000).toISOString(), user_id: 'u3', user_name: 'Wei Li', action: 'Updated layout', entity_type: 'layout', entity_name: 'Home Tab' },
    { id: 'a8', timestamp: new Date(Date.now() - 345600000).toISOString(), user_id: 'u1', user_name: 'Dr. Sarah Chen', action: 'Changed notification schedule', entity_type: 'setting', details: { interval: '2h' } },
    { id: 'a9', timestamp: new Date(Date.now() - 432000000).toISOString(), user_id: 'u1', user_name: 'Dr. Sarah Chen', action: 'Created project', entity_type: 'project', entity_name: 'UX Study 2026' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Get unique users / 获取唯一用户
  const uniqueUsers = useMemo(() => [...new Map(auditLog.map(e => [e.user_id, e.user_name])).entries()], [auditLog]);

  const filteredLog = useMemo(() => {
    return auditLog.filter(entry => {
      if (entityFilter !== 'all' && entry.entity_type !== entityFilter) return false;
      if (userFilter !== 'all' && entry.user_id !== userFilter) return false;
      if (searchTerm && !entry.action.toLowerCase().includes(searchTerm.toLowerCase()) && !(entry.entity_name || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [auditLog, entityFilter, userFilter, searchTerm]);

  const entityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      project: <FolderOpen size={12} className="text-stone-500" />,
      questionnaire: <ClipboardList size={12} className="text-stone-500" />,
      question: <HelpCircle size={12} className="text-stone-500" />,
      enrollment: <UserCheck size={12} className="text-stone-500" />,
      response: <MessageCircle size={12} className="text-stone-500" />,
      consent: <Lock size={12} className="text-stone-500" />,
      setting: <Settings size={12} className="text-stone-500" />,
      layout: <Palette size={12} className="text-stone-500" />,
      export: <Upload size={12} className="text-stone-500" />,
    };
    return iconMap[type] || <File size={12} className="text-stone-500" />;
  };

  const entityColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-700';
      case 'questionnaire': return 'bg-purple-100 text-purple-700';
      case 'question': return 'bg-indigo-100 text-indigo-700';
      case 'consent': return 'bg-emerald-100 text-emerald-700';
      case 'setting': return 'bg-amber-100 text-amber-700';
      case 'export': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group by date / 按日期分组
  const groupedLog = useMemo(() => {
    const groups = new Map<string, AuditEntry[]>();
    for (const entry of filteredLog) {
      const day = new Date(entry.timestamp).toLocaleDateString();
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(entry);
    }
    return groups;
  }, [filteredLog]);

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-slate-600" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Audit Trail / 审计追踪</h2>
            <p className="text-sm text-muted-foreground">{auditLog.length} events recorded / 条事件已记录</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-primary hover:underline">
          <Download className="w-3 h-3" /> Export Log / 导出日志
        </button>
      </div>

      {/* Filters / 筛选 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search actions... / 搜索操作..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          />
        </div>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground">
          <option value="all">All Types / 所有类型</option>
          <option value="project">Project / 项目</option>
          <option value="questionnaire">Questionnaire / 问卷</option>
          <option value="question">Question / 问题</option>
          <option value="consent">Consent / 同意书</option>
          <option value="setting">Setting / 设置</option>
          <option value="export">Export / 导出</option>
          <option value="layout">Layout / 布局</option>
        </select>
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground">
          <option value="all">All Users / 所有用户</option>
          {uniqueUsers.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      {/* Summary Stats / 摘要统计 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Events / 总事件', value: auditLog.length },
          { label: 'Today / 今日', value: auditLog.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length },
          { label: 'Contributors / 贡献者', value: uniqueUsers.length },
          { label: 'Entity Types / 实体类型', value: new Set(auditLog.map(e => e.entity_type)).size },
        ].map((stat, i) => (
          <div key={i} className="border border-border rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline / 时间线 */}
      <div className="space-y-6">
        {[...groupedLog.entries()].map(([date, entries]) => (
          <div key={date}>
            <h3 className="text-xs font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">{date}</h3>
            <div className="space-y-1">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  {/* Icon / 图标 */}
                  <span className="text-lg mt-0.5">{entityIcon(entry.entity_type)}</span>

                  {/* Content / 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{entry.action}</span>
                      {entry.entity_name && (
                        <span className="text-xs text-muted-foreground">— {entry.entity_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {entry.user_name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${entityColor(entry.entity_type)}`}>{entry.entity_type}</span>
                      {entry.details && (
                        <span className="text-[10px] text-muted-foreground">
                          {Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time / 时间 */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredLog.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No matching audit entries / 无匹配的审计记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
