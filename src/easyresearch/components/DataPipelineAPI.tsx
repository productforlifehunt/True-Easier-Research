/**
 * Data Pipeline & API Access — REST API endpoint generator with key management
 * 数据管道与 API 访问 — REST API 端点生成器与密钥管理
 */
import React, { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, Code, Globe, Lock, Check, Zap } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key_preview: string; // Last 8 chars visible / 只显示最后8个字符
  full_key?: string; // Only shown on creation / 仅在创建时显示
  permissions: ('read' | 'write' | 'delete')[];
  rate_limit: number; // requests per minute / 每分钟请求数
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  description_zh: string;
  params?: { name: string; type: string; required: boolean }[];
  example_response?: string;
}

interface Props {
  projectId: string;
}

const DataPipelineAPI: React.FC<Props> = ({ projectId }) => {
  const [tab, setTab] = useState<'endpoints' | 'keys' | 'playground'>('endpoints');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: 'key-1',
      name: 'Production Key / 生产密钥',
      key_preview: '****a1b2c3d4',
      permissions: ['read'],
      rate_limit: 60,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      last_used_at: new Date(Date.now() - 3600000).toISOString(),
      is_active: true,
    },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState(0);
  const [playgroundResult, setPlaygroundResult] = useState<string | null>(null);

  const baseUrl = `https://yekarqanirdkdckimpna.supabase.co/rest/v1`;

  const endpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: `/survey_response?project_id=eq.${projectId}&select=*`,
      description: 'List all responses for this project',
      description_zh: '列出此项目的所有响应',
      params: [
        { name: 'status', type: 'string', required: false },
        { name: 'limit', type: 'integer', required: false },
        { name: 'offset', type: 'integer', required: false },
      ],
      example_response: `[
  {
    "id": "resp-001",
    "project_id": "${projectId}",
    "participant_id": "part-001",
    "answers": { "Q1": "Yes", "Q2": 4 },
    "status": "completed",
    "created_at": "2026-03-09T10:00:00Z"
  }
]`,
    },
    {
      method: 'GET',
      path: `/enrollment?project_id=eq.${projectId}&select=*`,
      description: 'List all enrolled participants',
      description_zh: '列出所有已注册的参与者',
      params: [
        { name: 'status', type: 'string', required: false },
      ],
    },
    {
      method: 'GET',
      path: `/question?project_id=eq.${projectId}&select=*&order=order_index`,
      description: 'Get all questions for this project',
      description_zh: '获取此项目的所有问题',
    },
    {
      method: 'POST',
      path: `/survey_response`,
      description: 'Submit a new response programmatically',
      description_zh: '通过编程方式提交新的响应',
      params: [
        { name: 'project_id', type: 'uuid', required: true },
        { name: 'participant_id', type: 'string', required: true },
        { name: 'answers', type: 'jsonb', required: true },
      ],
    },
    {
      method: 'GET',
      path: `/questionnaire?project_id=eq.${projectId}&select=*`,
      description: 'List all questionnaires in this project',
      description_zh: '列出此项目中的所有问卷',
    },
  ];

  const createApiKey = () => {
    if (!newKeyName.trim()) return;
    const fullKey = `er_${projectId.substring(0, 8)}_${Math.random().toString(36).substring(2, 18)}`;
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key_preview: `****${fullKey.slice(-8)}`,
      full_key: fullKey,
      permissions: ['read'],
      rate_limit: 60,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    setApiKeys(prev => [...prev, newKey]);
    setShowNewKey(fullKey);
    setNewKeyName('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const methodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-100 text-emerald-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-amber-100 text-amber-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const runPlayground = () => {
    const ep = endpoints[playgroundEndpoint];
    setPlaygroundResult(ep.example_response || JSON.stringify({ message: 'Success', status: 200 }, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Header / 头部 */}
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-violet-600" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Data Pipeline & API / 数据管道与 API</h2>
          <p className="text-sm text-muted-foreground">Programmatic access to research data / 编程方式访问研究数据</p>
        </div>
      </div>

      {/* Tabs / 标签 */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['endpoints', 'keys', 'playground'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'endpoints' && 'Endpoints / 端点'}
            {t === 'keys' && `API Keys (${apiKeys.length})`}
            {t === 'playground' && 'Playground / 测试'}
          </button>
        ))}
      </div>

      {/* Endpoints Tab / 端点标签页 */}
      {tab === 'endpoints' && (
        <div className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-foreground font-medium">Base URL / 基础地址</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground flex-1">{baseUrl}</code>
              <button onClick={() => copyToClipboard(baseUrl, 'base')} className="text-xs text-primary hover:underline">
                {copied === 'base' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Include header: <code className="bg-muted px-1 rounded">apikey: YOUR_API_KEY</code> and <code className="bg-muted px-1 rounded">Accept-Profile: care_connector</code>
            </p>
          </div>

          {endpoints.map((ep, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${methodColor(ep.method)}`}>{ep.method}</span>
                <code className="text-sm font-mono text-foreground break-all">{ep.path}</code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{ep.description} / {ep.description_zh}</p>
              {ep.params && ep.params.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Parameters / 参数:</p>
                  <div className="space-y-1">
                    {ep.params.map(p => (
                      <div key={p.name} className="flex items-center gap-2 text-xs">
                        <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">{p.name}</code>
                        <span className="text-muted-foreground">{p.type}</span>
                        {p.required && <span className="text-red-500 text-[10px]">required</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {ep.example_response && (
                <details className="mt-3">
                  <summary className="text-xs text-primary cursor-pointer hover:underline">Example Response / 示例响应</summary>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono text-foreground overflow-x-auto">{ep.example_response}</pre>
                </details>
              )}
              <button
                onClick={() => copyToClipboard(`curl -H "apikey: YOUR_KEY" -H "Accept-Profile: care_connector" "${baseUrl}${ep.path}"`, `curl-${i}`)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {copied === `curl-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy cURL / 复制
              </button>
            </div>
          ))}
        </div>
      )}

      {/* API Keys Tab / API 密钥标签页 */}
      {tab === 'keys' && (
        <div className="space-y-4">
          {/* Create Key / 创建密钥 */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Create API Key / 创建 API 密钥</p>
            <div className="flex gap-2">
              <input
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. Dashboard Integration) / 密钥名称"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
              <button onClick={createApiKey} disabled={!newKeyName.trim()} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Create / 创建
              </button>
            </div>
            {showNewKey && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-700 font-medium mb-1">Copy this key now — it won't be shown again / 立即复制此密钥，它不会再次显示</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-emerald-800 break-all">{showNewKey}</code>
                  <button onClick={() => { copyToClipboard(showNewKey, 'new'); }} className="shrink-0">
                    {copied === 'new' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Key List / 密钥列表 */}
          <div className="space-y-2">
            {apiKeys.map(key => (
              <div key={key.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{key.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${key.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {key.is_active ? 'Active / 活跃' : 'Revoked / 已撤销'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <code className="text-xs font-mono text-muted-foreground">{key.key_preview}</code>
                    <span className="text-xs text-muted-foreground">Rate: {key.rate_limit}/min</span>
                    <span className="text-xs text-muted-foreground">Perms: {key.permissions.join(', ')}</span>
                    {key.last_used_at && (
                      <span className="text-xs text-muted-foreground">Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setApiKeys(prev => prev.map(k => k.id === key.id ? { ...k, is_active: false } : k))}
                  className="text-xs text-red-500 hover:text-red-700"
                  title="Revoke / 撤销"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playground Tab / 测试标签页 */}
      {tab === 'playground' && (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">API Playground / API 测试场</p>
            <select
              value={playgroundEndpoint}
              onChange={e => { setPlaygroundEndpoint(Number(e.target.value)); setPlaygroundResult(null); }}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
            >
              {endpoints.map((ep, i) => (
                <option key={i} value={i}>{ep.method} {ep.path.substring(0, 60)}...</option>
              ))}
            </select>
            <button onClick={runPlayground} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1">
              <Zap className="w-4 h-4" /> Run / 运行
            </button>
            {playgroundResult && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Response / 响应:</p>
                <pre className="p-3 bg-muted rounded-lg text-xs font-mono text-foreground overflow-x-auto max-h-64">{playgroundResult}</pre>
              </div>
            )}
          </div>

          {/* Code Snippets / 代码片段 */}
          <div className="border border-border rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-3">Quick Start / 快速开始</p>
            <div className="space-y-3">
              {[
                { lang: 'cURL', code: `curl -H "apikey: YOUR_KEY" \\\n  -H "Accept-Profile: care_connector" \\\n  "${baseUrl}/survey_response?project_id=eq.${projectId}&select=*"` },
                { lang: 'Python', code: `import requests\n\nheaders = {\n  "apikey": "YOUR_KEY",\n  "Accept-Profile": "care_connector"\n}\nr = requests.get("${baseUrl}/survey_response",\n  params={"project_id": "eq.${projectId}"},\n  headers=headers)\ndata = r.json()` },
                { lang: 'JavaScript', code: `const res = await fetch(\n  "${baseUrl}/survey_response?project_id=eq.${projectId}",\n  { headers: {\n    "apikey": "YOUR_KEY",\n    "Accept-Profile": "care_connector"\n  }}\n);\nconst data = await res.json();` },
              ].map(snippet => (
                <details key={snippet.lang}>
                  <summary className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                    <Code className="w-3 h-3" /> {snippet.lang}
                  </summary>
                  <div className="relative mt-1">
                    <pre className="p-3 bg-muted rounded-lg text-xs font-mono text-foreground overflow-x-auto">{snippet.code}</pre>
                    <button
                      onClick={() => copyToClipboard(snippet.code, `snippet-${snippet.lang}`)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    >
                      {copied === `snippet-${snippet.lang}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPipelineAPI;
