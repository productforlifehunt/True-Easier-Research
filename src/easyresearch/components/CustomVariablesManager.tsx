import React, { useState } from 'react';
import { Variable, Plus, Trash2, Copy, Link, Code } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Variables / URL Parameters / Embedded Data Manager
// 自定义变量 / URL 参数 / 嵌入式数据管理器
interface Props {
  projectId: string;
  surveyCode?: string;
  variables: CustomVariable[];
  onUpdate: (variables: CustomVariable[]) => void;
}

export interface CustomVariable {
  id: string;
  name: string;
  type: 'url_param' | 'embedded' | 'computed';
  defaultValue: string;
  description: string;
  source: string; // URL param key, or formula for computed
}

const CustomVariablesManager: React.FC<Props> = ({ projectId, surveyCode, variables, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newVar, setNewVar] = useState<Partial<CustomVariable>>({
    name: '', type: 'url_param', defaultValue: '', description: '', source: '',
  });

  const addVariable = () => {
    if (!newVar.name) return;
    const variable: CustomVariable = {
      id: crypto.randomUUID(),
      name: newVar.name!,
      type: newVar.type || 'url_param',
      defaultValue: newVar.defaultValue || '',
      description: newVar.description || '',
      source: newVar.source || newVar.name!,
    };
    onUpdate([...variables, variable]);
    setNewVar({ name: '', type: 'url_param', defaultValue: '', description: '', source: '' });
    setShowAdd(false);
  };

  const removeVariable = (id: string) => {
    onUpdate(variables.filter(v => v.id !== id));
  };

  const baseUrl = surveyCode
    ? `${window.location.origin}/easyresearch/s/${surveyCode}`
    : `${window.location.origin}/easyresearch/join/${projectId}`;

  // Build example URL with all params / 构建包含所有参数的示例 URL
  const exampleUrl = useMemo(() => {
    const urlParams = variables.filter(v => v.type === 'url_param');
    if (urlParams.length === 0) return baseUrl;
    const params = urlParams.map(v => `${encodeURIComponent(v.source || v.name)}=${encodeURIComponent(v.defaultValue || 'value')}`);
    return `${baseUrl}?${params.join('&')}`;
  }, [variables, baseUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied / 已复制');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Variable className="w-5 h-5" />
          Custom Variables / 自定义变量
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Variable / 添加变量
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Define URL parameters and embedded data that get captured with each response. Use <code className="bg-muted px-1 rounded">{'{{variable_name}}'}</code> in questions for piping.
        / 定义随每个回复一起捕获的 URL 参数和嵌入式数据。在问题中使用 <code className="bg-muted px-1 rounded">{'{{variable_name}}'}</code> 进行导流。
      </p>

      {/* Add new variable form / 添加新变量表单 */}
      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Variable Name / 变量名</label>
              <input
                value={newVar.name || ''}
                onChange={e => setNewVar(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. source, campaign_id"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type / 类型</label>
              <select
                value={newVar.type || 'url_param'}
                onChange={e => setNewVar(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              >
                <option value="url_param">URL Parameter / URL 参数</option>
                <option value="embedded">Embedded Data / 嵌入式数据</option>
                <option value="computed">Computed / 计算值</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {newVar.type === 'url_param' ? 'URL Param Key / URL 参数键' : 
                 newVar.type === 'computed' ? 'Formula / 公式' : 'Source / 来源'}
              </label>
              <input
                value={newVar.source || ''}
                onChange={e => setNewVar(prev => ({ ...prev, source: e.target.value }))}
                placeholder={newVar.type === 'url_param' ? 'e.g. utm_source' : 'e.g. response_count'}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Default Value / 默认值</label>
              <input
                value={newVar.defaultValue || ''}
                onChange={e => setNewVar(prev => ({ ...prev, defaultValue: e.target.value }))}
                placeholder="(empty if not provided)"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description / 描述</label>
            <input
              value={newVar.description || ''}
              onChange={e => setNewVar(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this variable for?"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addVariable} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">Add / 添加</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg">Cancel / 取消</button>
          </div>
        </div>
      )}

      {/* Variables list / 变量列表 */}
      {variables.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Variable / 变量</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Type / 类型</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Source / 来源</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Default / 默认</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Pipe Syntax / 导流语法</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {variables.map(v => (
                <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{v.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      v.type === 'url_param' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      v.type === 'embedded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {v.type === 'url_param' ? 'URL' : v.type === 'embedded' ? 'Embedded' : 'Computed'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{v.source}</td>
                  <td className="p-3 text-xs text-muted-foreground">{v.defaultValue || '—'}</td>
                  <td className="p-3">
                    <code
                      className="text-xs bg-muted px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/10"
                      onClick={() => copyToClipboard(`{{${v.name}}}`)}
                      title="Click to copy"
                    >
                      {`{{${v.name}}}`}
                    </code>
                  </td>
                  <td className="p-3">
                    <button onClick={() => removeVariable(v.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-lg">
          No custom variables defined / 未定义自定义变量
        </div>
      )}

      {/* Distribution URL / 分发链接 */}
      {variables.filter(v => v.type === 'url_param').length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <Link className="w-4 h-4" /> Distribution URL / 分发链接
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted p-2 rounded-lg overflow-x-auto font-mono text-foreground">
              {exampleUrl}
            </code>
            <button
              onClick={() => copyToClipboard(exampleUrl)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Replace values in the URL. Parameters will be captured automatically with each response.
            / 替换 URL 中的值。参数将随每个回复自动捕获。
          </p>
        </div>
      )}

      {/* Usage guide / 使用指南 */}
      <details className="bg-card border border-border rounded-lg">
        <summary className="p-3 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/30 flex items-center gap-2">
          <Code className="w-4 h-4" /> Usage Guide / 使用指南
        </summary>
        <div className="p-3 pt-0 text-xs text-muted-foreground space-y-2">
          <p><strong>URL Parameters / URL 参数:</strong> Add ?param=value to your survey link. Values are captured with responses. / 在调查链接后添加 ?param=value，值随回复一起捕获。</p>
          <p><strong>Answer Piping / 答案导流:</strong> Use {'{{variable_name}}'} in question text to display captured values. / 在问题文本中使用 {'{{variable_name}}'} 显示捕获的值。</p>
          <p><strong>Redirect with Variables / 带变量重定向:</strong> Use variables in the redirect URL: <code>https://example.com/thanks?id={'{{participant_id}}'}</code></p>
          <p><strong>Embedded Data / 嵌入式数据:</strong> Set values server-side or via JavaScript for each participant. / 通过服务端或 JavaScript 为每个参与者设置值。</p>
        </div>
      </details>
    </div>
  );
};

// Hook to extract URL params at survey load / 在调查加载时提取 URL 参数的钩子
function useMemo(fn: () => string, deps: any[]): string {
  return React.useMemo(fn, deps);
}

export const extractUrlVariables = (variableDefinitions: CustomVariable[]): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  variableDefinitions.forEach(v => {
    if (v.type === 'url_param') {
      result[v.name] = params.get(v.source || v.name) || v.defaultValue || '';
    } else if (v.type === 'embedded') {
      result[v.name] = v.defaultValue || '';
    }
  });
  return result;
};

export default CustomVariablesManager;
