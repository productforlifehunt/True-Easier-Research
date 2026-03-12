import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Webhook, Plus, Trash2, Play, Check, X, Loader2, Zap } from 'lucide-react';
import { bToast, toast } from '../utils/bilingualToast';

// Webhook / Integration Manager — trigger external actions on survey events
// Webhook / 集成管理器 — 在调查事件上触发外部操作
interface Props {
  projectId: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers: Record<string, string>;
  active: boolean;
  secret?: string;
  retryCount: number;
  lastTriggered?: string;
  lastStatus?: number;
}

type WebhookEvent = 
  | 'response.created'
  | 'response.completed'
  | 'enrollment.created'
  | 'enrollment.completed'
  | 'quota.reached'
  | 'quality.flagged'
  | 'survey.published'
  | 'survey.closed';

const EVENT_LABELS: Record<WebhookEvent, { en: string; zh: string }> = {
  'response.created': { en: 'New Response', zh: '新回复' },
  'response.completed': { en: 'Survey Completed', zh: '调查完成' },
  'enrollment.created': { en: 'New Enrollment', zh: '新入组' },
  'enrollment.completed': { en: 'Enrollment Complete', zh: '入组完成' },
  'quota.reached': { en: 'Quota Reached', zh: '配额达到' },
  'quality.flagged': { en: 'Quality Flagged', zh: '质量标记' },
  'survey.published': { en: 'Survey Published', zh: '调查发布' },
  'survey.closed': { en: 'Survey Closed', zh: '调查关闭' },
};

const WebhookManager: React.FC<Props> = ({ projectId }) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    name: '', url: '', events: [], headers: {}, active: true, retryCount: 3,
  });
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // Load webhooks from project settings / 从项目设置加载 webhooks
  useEffect(() => {
    loadWebhooks();
  }, [projectId]);

  const loadWebhooks = async () => {
    try {
      const { data } = await supabase
        .from('research_project')
        .select('setting')
        .eq('id', projectId)
        .single();
      
      if (data?.setting?.webhooks) {
        setWebhooks(data.setting.webhooks);
      }
    } catch (e) {
      // Setting might not exist yet
    }
  };

  const saveWebhooks = async (updated: WebhookConfig[]) => {
    try {
      const { data: existing } = await supabase
        .from('research_project')
        .select('setting')
        .eq('id', projectId)
        .single();

      const currentSetting = existing?.setting || {};
      await supabase
        .from('research_project')
        .update({ setting: { ...currentSetting, webhooks: updated } })
        .eq('id', projectId);

      setWebhooks(updated);
    } catch (e: any) {
      toast.error('Failed to save webhooks / 保存 webhooks 失败');
    }
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error('Name and URL required / 需要名称和 URL');
      return;
    }
    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      name: newWebhook.name!,
      url: newWebhook.url!,
      events: newWebhook.events || [],
      headers: newWebhook.headers || {},
      active: true,
      retryCount: newWebhook.retryCount || 3,
    };
    const updated = [...webhooks, webhook];
    saveWebhooks(updated);
    setNewWebhook({ name: '', url: '', events: [], headers: {}, active: true, retryCount: 3 });
    setShowAdd(false);
    toast.success('Webhook added / Webhook 已添加');
  };

  const removeWebhook = (id: string) => {
    saveWebhooks(webhooks.filter(w => w.id !== id));
    toast.success('Webhook removed / Webhook 已移除');
  };

  const toggleWebhook = (id: string) => {
    saveWebhooks(webhooks.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const toggleEvent = (event: WebhookEvent) => {
    setNewWebhook(prev => {
      const events = prev.events || [];
      return {
        ...prev,
        events: events.includes(event) ? events.filter(e => e !== event) : [...events, event],
      };
    });
  };

  const addHeader = () => {
    if (!newHeaderKey) return;
    setNewWebhook(prev => ({
      ...prev,
      headers: { ...(prev.headers || {}), [newHeaderKey]: newHeaderValue },
    }));
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  // Test webhook / 测试 webhook
  const testWebhook = async (webhook: WebhookConfig) => {
    setTesting(webhook.id);
    try {
      const payload = {
        event: 'test',
        project_id: projectId,
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from Easier Research / 这是来自 Easier Research 的测试 webhook',
        },
      };

      const resp = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers,
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        toast.success(`Webhook test successful (${resp.status}) / 测试成功`);
      } else {
        toast.error(`Webhook test failed (${resp.status}) / 测试失败`);
      }

      // Update last triggered
      saveWebhooks(webhooks.map(w => 
        w.id === webhook.id ? { ...w, lastTriggered: new Date().toISOString(), lastStatus: resp.status } : w
      ));
    } catch (e: any) {
      toast.error(`Webhook test error: ${e.message} / 测试错误`);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Webhooks & Integrations / Webhooks 与集成
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Webhook
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Send HTTP POST notifications to external services when events occur.
        / 当事件发生时，向外部服务发送 HTTP POST 通知。
      </p>

      {/* Add webhook form / 添加 webhook 表单 */}
      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name / 名称</label>
              <input
                value={newWebhook.name || ''}
                onChange={e => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Slack Notification"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Endpoint URL</label>
              <input
                value={newWebhook.url || ''}
                onChange={e => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Events / 事件</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(EVENT_LABELS) as [WebhookEvent, { en: string; zh: string }][]).map(([event, label]) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                    newWebhook.events?.includes(event)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted/30'
                  }`}
                >
                  {newWebhook.events?.includes(event) && <Check className="w-3 h-3 inline mr-1" />}
                  {label.en} / {label.zh}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Custom Headers / 自定义请求头</label>
            <div className="flex gap-2">
              <input
                value={newHeaderKey}
                onChange={e => setNewHeaderKey(e.target.value)}
                placeholder="Header name"
                className="flex-1 px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground"
              />
              <input
                value={newHeaderValue}
                onChange={e => setNewHeaderValue(e.target.value)}
                placeholder="Header value"
                className="flex-1 px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground"
              />
              <button onClick={addHeader} className="px-2 py-1.5 text-xs bg-muted text-foreground rounded">Add</button>
            </div>
            {Object.keys(newWebhook.headers || {}).length > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(newWebhook.headers || {}).map(([k, v]) => (
                  <div key={k} className="text-xs text-muted-foreground font-mono">
                    {k}: {v}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={addWebhook} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
              Create Webhook / 创建
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg">
              Cancel / 取消
            </button>
          </div>
        </div>
      )}

      {/* Webhook list / Webhook 列表 */}
      {webhooks.length > 0 ? (
        <div className="space-y-3">
          {webhooks.map(webhook => (
            <div key={webhook.id} className={`border rounded-lg p-4 transition ${webhook.active ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Webhook className={`w-4 h-4 ${webhook.active ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm text-foreground">{webhook.name}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] rounded ${webhook.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                    {webhook.active ? 'Active / 活跃' : 'Paused / 暂停'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => testWebhook(webhook)}
                    disabled={testing === webhook.id}
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground"
                    title="Test / 测试"
                  >
                    {testing === webhook.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toggleWebhook(webhook.id)}
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground"
                    title={webhook.active ? 'Pause / 暂停' : 'Resume / 恢复'}
                  >
                    {webhook.active ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => removeWebhook(webhook.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono mb-2 truncate">{webhook.url}</div>
              <div className="flex flex-wrap gap-1">
                {webhook.events.map(event => (
                  <span key={event} className="px-2 py-0.5 text-[10px] bg-muted rounded text-muted-foreground">
                    {EVENT_LABELS[event]?.en || event}
                  </span>
                ))}
              </div>
              {webhook.lastTriggered && (
                <div className="text-[10px] text-muted-foreground mt-2">
                  Last triggered / 最后触发: {new Date(webhook.lastTriggered).toLocaleString()}
                  {webhook.lastStatus && (
                    <span className={`ml-2 ${webhook.lastStatus < 300 ? 'text-green-600' : 'text-red-500'}`}>
                      Status: {webhook.lastStatus}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-lg">
          No webhooks configured / 未配置 webhooks
        </div>
      )}

      {/* Payload example / 载荷示例 */}
      <details className="bg-card border border-border rounded-lg">
        <summary className="p-3 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/30">
          Payload Format / 载荷格式
        </summary>
        <pre className="p-3 pt-0 text-xs text-muted-foreground font-mono overflow-auto">
{`{
  "event": "response.created",
  "project_id": "${projectId}",
  "timestamp": "2026-03-09T12:00:00Z",
  "data": {
    "enrollment_id": "uuid",
    "question_id": "uuid",
    "response_text": "...",
    "response_value": "...",
    "participant_email": "...",
    "quality_flags": []
  }
}`}
        </pre>
      </details>
    </div>
  );
};

export default WebhookManager;
