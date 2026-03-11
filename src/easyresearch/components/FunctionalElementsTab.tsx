import React, { useState, useEffect } from 'react';
import { Plus, Link2, BarChart3, Calendar, MessageCircle, Copy, Edit3, Lock, Mail, Sparkles, icons, ChevronDown, ChevronUp, Save, X, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import toast from 'react-hot-toast';

// Public function elements — which ones can be customized / 公共功能部件——哪些可自定义
const PUBLIC_FUNCTION_ELEMENTS = [
  { type: 'ecogram', label_en: 'Ecogram', label_zh: '生态图', icon: 'Link2', desc_en: 'Care network diagram', desc_zh: '照护网络图', customizable: true },
  { type: 'progress', label_en: 'Progress', label_zh: '进度', icon: 'BarChart3', desc_en: 'Study progress overview', desc_zh: '研究进度概览', customizable: true },
  { type: 'timeline', label_en: 'Timeline', label_zh: '时间线', icon: 'Calendar', desc_en: 'Study timeline view', desc_zh: '研究时间线视图', customizable: true },
  { type: 'start_date_picker', label_en: 'Set Start Date', label_zh: '设置开始日期', icon: 'Calendar', desc_en: 'Custom study start date picker', desc_zh: '自定义研究开始日期选择器', customizable: false },
  { type: 'direct_message', label_en: 'Message Researcher', label_zh: '联系研究者', icon: 'MessageCircle', desc_en: 'Direct message with researcher', desc_zh: '与研究者直接消息', customizable: false },
  { type: 'ai_assistant', label_en: 'AI Assistant', label_zh: 'AI 助手', icon: 'MessageCircle', desc_en: 'Project-level AI chatbot', desc_zh: '项目级AI聊天机器人', customizable: false },
];

// Available icons for picker / 可选图标
const ICON_OPTIONS = ['Link2', 'BarChart3', 'Calendar', 'MessageCircle', 'Sparkles', 'Eye', 'Edit3', 'Star', 'Heart', 'Zap', 'Target', 'Award', 'BookOpen', 'Clock', 'Users', 'Bell', 'Shield', 'Activity'];

interface UserFunctionElement {
  id: string;
  user_id: string;
  project_id: string | null;
  base_type: string;
  name_en: string;
  name_zh: string;
  description_en: string | null;
  description_zh: string | null;
  icon: string;
  element_config: any;
}

interface CustomFunctionElement {
  id: string;
  name_en: string;
  name_zh: string;
  description_en: string | null;
  description_zh: string | null;
  icon: string;
  is_public: boolean;
}

interface Props {
  projectId?: string;
}

const FunctionalElementsTab: React.FC<Props> = ({ projectId }) => {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [userElements, setUserElements] = useState<UserFunctionElement[]>([]);
  const [customElements, setCustomElements] = useState<CustomFunctionElement[]>([]);
  const [showCloneForm, setShowCloneForm] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState({ en: '', zh: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserFunctionElement>>({});
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchElements();
  }, [user, projectId]);

  const fetchElements = async () => {
    const [userRes, customRes] = await Promise.all([
      (supabase as any).from('user_function_element').select('*').order('created_at', { ascending: false }),
      (supabase as any).from('custom_function_element').select('*'),
    ]);
    if (userRes.data) setUserElements(userRes.data);
    if (customRes.data) setCustomElements(customRes.data);
  };

  const cloneElement = async (baseType: string) => {
    if (!user) return;
    const base = PUBLIC_FUNCTION_ELEMENTS.find(e => e.type === baseType);
    if (!base) return;
    const { error } = await (supabase as any).from('user_function_element').insert({
      user_id: user.id,
      project_id: projectId || null,
      base_type: baseType,
      name_en: cloneName.en || `My ${base.label_en}`,
      name_zh: cloneName.zh || `我的${base.label_zh}`,
      description_en: base.desc_en,
      description_zh: base.desc_zh,
      icon: base.icon,
      element_config: {},
    });
    if (error) { toast.error(lang === 'zh' ? '失败: ' + error.message : 'Failed: ' + error.message); return; }
    toast.success(lang === 'zh' ? '已创建自定义部件' : 'Custom element created');
    setShowCloneForm(null);
    setCloneName({ en: '', zh: '' });
    fetchElements();
  };

  const startEdit = (el: UserFunctionElement) => {
    setEditingId(el.id);
    setEditForm({ ...el });
    setShowIconPicker(false);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    const { error } = await (supabase as any).from('user_function_element').update({
      name_en: editForm.name_en,
      name_zh: editForm.name_zh,
      description_en: editForm.description_en,
      description_zh: editForm.description_zh,
      icon: editForm.icon,
      element_config: editForm.element_config,
    }).eq('id', editingId);
    if (error) { toast.error(lang === 'zh' ? '失败: ' + error.message : 'Failed: ' + error.message); return; }
    toast.success(lang === 'zh' ? '已保存' : 'Saved');
    setEditingId(null);
    setEditForm({});
    fetchElements();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setShowIconPicker(false);
  };

  const deleteUserElement = async (id: string) => {
    await (supabase as any).from('user_function_element').delete().eq('id', id);
    toast.success(lang === 'zh' ? '已删除' : 'Deleted');
    fetchElements();
  };

  const getLucideIcon = (iconName: string, size = 16, className = 'text-stone-500') => {
    const Icon = (icons as any)[iconName];
    return Icon ? <Icon size={size} className={className} /> : <Sparkles size={size} className={className} />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header / 头部 */}
      <div>
        <h2 className="text-lg font-bold text-stone-800">
          {lang === 'zh' ? '功能部件' : 'Function Elements'}
        </h2>
        <p className="text-[13px] text-stone-400 mt-1">
          {lang === 'zh'
            ? '查看、自定义和管理您研究中使用的功能部件'
            : 'View, customize, and manage functional elements used in your study'}
        </p>
      </div>

      {/* Public Function Elements / 公共功能部件 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/50">
          <h3 className="text-[13px] font-semibold text-stone-600 uppercase tracking-wider">
            {lang === 'zh' ? '标准功能部件' : 'Standard Function Elements'}
          </h3>
        </div>
        <div className="divide-y divide-stone-100">
          {PUBLIC_FUNCTION_ELEMENTS.map(el => (
            <div key={el.type} className={`px-5 py-3.5 flex items-center gap-3 ${!el.customizable ? 'opacity-60' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                {getLucideIcon(el.icon, 16, el.customizable ? 'text-emerald-500' : 'text-stone-400')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-stone-800">
                    {lang === 'zh' ? el.label_zh : el.label_en}
                  </span>
                  {!el.customizable && (
                    <span className="text-[9px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-full">
                      {lang === 'zh' ? '不可自定义' : 'Not customizable'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400">{lang === 'zh' ? el.desc_zh : el.desc_en}</p>
              </div>
              {el.customizable && (
                <>
                  {showCloneForm === el.type ? (
                    <div className="flex items-center gap-2">
                      <input value={lang === 'zh' ? cloneName.zh : cloneName.en}
                        onChange={e => lang === 'zh' ? setCloneName({ ...cloneName, zh: e.target.value }) : setCloneName({ ...cloneName, en: e.target.value })}
                        placeholder={lang === 'zh' ? '自定义名称' : 'Custom name'}
                        className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] w-32" />
                      <button onClick={() => cloneElement(el.type)}
                        className="px-2 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-medium">
                        {lang === 'zh' ? '添加' : 'Add'}
                      </button>
                      <button onClick={() => setShowCloneForm(null)} className="text-stone-400 hover:text-stone-500">
                        <Plus size={12} className="rotate-45" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowCloneForm(el.type)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                      <Copy size={10} /> {lang === 'zh' ? '自定义' : 'Customize'}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User-customized Function Elements / 用户自定义功能部件 */}
      {userElements.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 bg-blue-50/50">
            <h3 className="text-[13px] font-semibold text-blue-700 uppercase tracking-wider">
              {lang === 'zh' ? '自定义功能部件' : 'Your Custom Function Elements'}
              <span className="ml-2 text-[11px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{userElements.length}</span>
            </h3>
          </div>
          <div className="divide-y divide-stone-100">
            {userElements.map(el => (
              <div key={el.id}>
                {/* Row / 行 */}
                <div className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    {getLucideIcon(el.icon, 16, 'text-blue-500')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-stone-800">{lang === 'zh' ? el.name_zh : el.name_en}</span>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'zh' ? `基于: ${PUBLIC_FUNCTION_ELEMENTS.find(p => p.type === el.base_type)?.label_zh || el.base_type}` : `Based on: ${PUBLIC_FUNCTION_ELEMENTS.find(p => p.type === el.base_type)?.label_en || el.base_type}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Preview toggle / 预览 */}
                    <button onClick={() => setPreviewId(previewId === el.id ? null : el.id)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                      title={lang === 'zh' ? '预览' : 'Preview'}>
                      <Eye size={14} />
                    </button>
                    {/* Edit / 编辑 */}
                    <button onClick={() => editingId === el.id ? cancelEdit() : startEdit(el)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                      title={lang === 'zh' ? '编辑' : 'Edit'}>
                      <Edit3 size={14} />
                    </button>
                    {/* Delete / 删除 */}
                    <button onClick={() => deleteUserElement(el.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                      title={lang === 'zh' ? '删除' : 'Delete'}>
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>
                </div>

                {/* Preview panel / 预览面板 */}
                {previewId === el.id && editingId !== el.id && (
                  <div className="px-5 pb-4">
                    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-2">
                      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                        {lang === 'zh' ? '预览' : 'Preview'}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[12px]">
                        <div>
                          <span className="text-stone-400">{lang === 'zh' ? '英文名称' : 'English Name'}:</span>
                          <p className="font-medium text-stone-700">{el.name_en}</p>
                        </div>
                        <div>
                          <span className="text-stone-400">{lang === 'zh' ? '中文名称' : 'Chinese Name'}:</span>
                          <p className="font-medium text-stone-700">{el.name_zh}</p>
                        </div>
                        <div>
                          <span className="text-stone-400">{lang === 'zh' ? '英文描述' : 'English Desc'}:</span>
                          <p className="text-stone-600">{el.description_en || '—'}</p>
                        </div>
                        <div>
                          <span className="text-stone-400">{lang === 'zh' ? '中文描述' : 'Chinese Desc'}:</span>
                          <p className="text-stone-600">{el.description_zh || '—'}</p>
                        </div>
                        <div>
                          <span className="text-stone-400">{lang === 'zh' ? '图标' : 'Icon'}:</span>
                          <div className="flex items-center gap-1 mt-0.5">{getLucideIcon(el.icon, 14, 'text-blue-500')} <span className="text-stone-600">{el.icon}</span></div>
                        </div>
                        <div>
                          <span className="text-stone-400">{lang === 'zh' ? '基础类型' : 'Base Type'}:</span>
                          <p className="text-stone-600">{el.base_type}</p>
                        </div>
                      </div>
                      {el.element_config && Object.keys(el.element_config).length > 0 && (
                        <div className="mt-2">
                          <span className="text-stone-400 text-[11px]">{lang === 'zh' ? '配置' : 'Config'}:</span>
                          <pre className="text-[10px] bg-white rounded-lg p-2 border border-stone-200 mt-1 overflow-x-auto text-stone-600">
                            {JSON.stringify(el.element_config, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit panel / 编辑面板 */}
                {editingId === el.id && (
                  <div className="px-5 pb-4">
                    <div className="bg-blue-50/50 rounded-xl border border-blue-200 p-4 space-y-3">
                      <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                        {lang === 'zh' ? '编辑自定义部件' : 'Edit Custom Element'}
                      </div>

                      {/* Names / 名称 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-stone-500 font-medium">{lang === 'zh' ? '英文名称' : 'English Name'}</label>
                          <input value={editForm.name_en || ''} onChange={e => setEditForm({ ...editForm, name_en: e.target.value })}
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-[12px] focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 font-medium">{lang === 'zh' ? '中文名称' : 'Chinese Name'}</label>
                          <input value={editForm.name_zh || ''} onChange={e => setEditForm({ ...editForm, name_zh: e.target.value })}
                            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-[12px] focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
                        </div>
                      </div>

                      {/* Descriptions / 描述 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-stone-500 font-medium">{lang === 'zh' ? '英文描述' : 'English Description'}</label>
                          <textarea value={editForm.description_en || ''} onChange={e => setEditForm({ ...editForm, description_en: e.target.value })}
                            rows={2} className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-[12px] focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 font-medium">{lang === 'zh' ? '中文描述' : 'Chinese Description'}</label>
                          <textarea value={editForm.description_zh || ''} onChange={e => setEditForm({ ...editForm, description_zh: e.target.value })}
                            rows={2} className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-[12px] focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none resize-none" />
                        </div>
                      </div>

                      {/* Icon picker / 图标选择 */}
                      <div>
                        <label className="text-[10px] text-stone-500 font-medium">{lang === 'zh' ? '图标' : 'Icon'}</label>
                        <div className="mt-1 flex items-center gap-2">
                          <button onClick={() => setShowIconPicker(!showIconPicker)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-[12px] hover:bg-stone-50 transition-colors">
                            {getLucideIcon(editForm.icon || 'Sparkles', 14, 'text-blue-500')}
                            <span className="text-stone-600">{editForm.icon}</span>
                            {showIconPicker ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                        </div>
                        {showIconPicker && (
                          <div className="mt-2 grid grid-cols-9 gap-1.5 p-2 bg-white rounded-lg border border-stone-200">
                            {ICON_OPTIONS.map(iconName => (
                              <button key={iconName} onClick={() => { setEditForm({ ...editForm, icon: iconName }); setShowIconPicker(false); }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${editForm.icon === iconName ? 'bg-blue-100 ring-1 ring-blue-300' : 'hover:bg-stone-100'}`}>
                                {getLucideIcon(iconName, 14, editForm.icon === iconName ? 'text-blue-600' : 'text-stone-500')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Config JSON editor / 配置JSON编辑器 */}
                      <div>
                        <label className="text-[10px] text-stone-500 font-medium">{lang === 'zh' ? '配置 (JSON)' : 'Config (JSON)'}</label>
                        <textarea
                          value={JSON.stringify(editForm.element_config || {}, null, 2)}
                          onChange={e => {
                            try { setEditForm({ ...editForm, element_config: JSON.parse(e.target.value) }); } catch {}
                          }}
                          rows={4}
                          className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px] font-mono focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none resize-none" />
                      </div>

                      {/* Actions / 操作 */}
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={saveEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-medium hover:bg-blue-600 transition-colors">
                          <Save size={12} /> {lang === 'zh' ? '保存' : 'Save'}
                        </button>
                        <button onClick={cancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-[11px] font-medium hover:bg-stone-200 transition-colors">
                          <X size={12} /> {lang === 'zh' ? '取消' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Private/Custom Elements (paid) / 定制部件（付费） */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-amber-100 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-amber-500" />
            <h3 className="text-[13px] font-semibold text-amber-700 uppercase tracking-wider">
              {lang === 'zh' ? '定制部件' : 'Custom Elements (Paid)'}
            </h3>
          </div>
        </div>
        {customElements.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {customElements.map(el => (
              <div key={el.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  {getLucideIcon(el.icon || 'Sparkles', 16, 'text-amber-500')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-stone-800">{lang === 'zh' ? el.name_zh : el.name_en}</span>
                    {!el.is_public && <Lock size={10} className="text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-stone-400">{lang === 'zh' ? el.description_zh : el.description_en}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-stone-500 mb-3">
              {lang === 'zh'
                ? '如果现有部件无法满足您的需求，我们可以为您的研究定制专属部件，甚至可以为您定制整个研究。'
                : 'Need something our standard elements can\'t do? We can build custom elements for your research, or even customize your entire study.'}
            </p>
            <a href="mailto:guowei.jiang.work@gmail.com?subject=Custom Element Request&body=Hi, I'd like to request a custom element for my research project."
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 transition-colors">
              <Mail size={13} />
              {lang === 'zh' ? '联系我们定制' : 'Contact for Custom Build'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionalElementsTab;
