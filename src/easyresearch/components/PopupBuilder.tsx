import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Clock, Eye, EyeOff, Layers, FileText, Shield, Compass, Puzzle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { supabase } from '../../lib/supabase';
import type { QuestionnaireConfig } from './QuestionnaireList';
import { bToast } from '../utils/bilingualToast';

// Popup data model / 弹窗数据模型
export interface PopupConfig {
  id: string;
  project_id: string;
  title: string;
  questionnaire_id: string | null;
  content: string | null;
  enabled: boolean;
  order_index: number;
  rules: PopupRule[];
}

export interface PopupRule {
  id: string;
  popup_id: string;
  trigger_type: 'first_open' | 'each_open' | 'timed' | 'scheduled';
  trigger_value: number; // seconds for timed, unused for others / 定时弹窗的秒数
  hide_after_close: boolean;
  order_index: number;
}

const TRIGGER_TYPES = [
  { value: 'first_open', label: 'On First Open / 首次打开', desc: 'Show once when participant first opens the app / 参与者首次打开应用时显示一次' },
  { value: 'each_open', label: 'On Each Open / 每次打开', desc: 'Show every time the app is opened / 每次打开应用时显示' },
  { value: 'timed', label: 'After Delay / 延迟后', desc: 'Show after X seconds in the app / 在应用中X秒后显示' },
  { value: 'scheduled', label: 'Scheduled / 定时', desc: 'Show at specific intervals / 按特定间隔显示' },
];

interface PopupBuilderProps {
  projectId: string;
  questionnaires: QuestionnaireConfig[];
}

const PopupBuilder: React.FC<PopupBuilderProps> = ({ projectId, questionnaires }) => {
  const [popups, setPopups] = useState<PopupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load popups from DB / 从数据库加载弹窗
  useEffect(() => {
    if (!projectId) return;
    loadPopups();
  }, [projectId]);

  const loadPopups = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('app_popup')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index');

    if (!rows || rows.length === 0) {
      setPopups([]);
      setLoading(false);
      return;
    }

    const popupIds = rows.map((r: any) => r.id);
    const { data: ruleRows } = await supabase
      .from('app_popup_rule')
      .select('*')
      .in('popup_id', popupIds)
      .order('order_index');

    const ruleMap = new Map<string, PopupRule[]>();
    for (const r of (ruleRows || [])) {
      if (!ruleMap.has(r.popup_id)) ruleMap.set(r.popup_id, []);
      ruleMap.get(r.popup_id)!.push({
        id: r.id,
        popup_id: r.popup_id,
        trigger_type: r.trigger_type,
        trigger_value: r.trigger_value || 0,
        hide_after_close: r.hide_after_close ?? true,
        order_index: r.order_index || 0,
      });
    }

    setPopups(rows.map((r: any) => ({
      id: r.id,
      project_id: r.project_id,
      title: r.title || 'New Popup',
      questionnaire_id: r.questionnaire_id || null,
      content: r.content || null,
      enabled: r.enabled ?? true,
      order_index: r.order_index || 0,
      rules: ruleMap.get(r.id) || [],
    })));
    setLoading(false);
  };

  // Save all popups / 保存所有弹窗
  const savePopups = useCallback(async (updated: PopupConfig[]) => {
    setPopups(updated);

    // Get existing IDs
    const { data: existingRows } = await supabase
      .from('app_popup')
      .select('id')
      .eq('project_id', projectId);
    const existingIds = new Set((existingRows || []).map((r: any) => r.id));
    const currentIds = new Set(updated.map(p => p.id));

    // Delete removed popups
    const removedIds = [...existingIds].filter(id => !currentIds.has(id));
    if (removedIds.length > 0) {
      await supabase.from('app_popup_rule').delete().in('popup_id', removedIds);
      await supabase.from('app_popup').delete().in('id', removedIds);
    }

    // Upsert each popup and its rules
    for (const popup of updated) {
      await supabase.from('app_popup').upsert({
        id: popup.id,
        project_id: projectId,
        title: popup.title,
        questionnaire_id: popup.questionnaire_id || null,
        content: popup.content || null,
        enabled: popup.enabled,
        order_index: popup.order_index,
      }, { onConflict: 'id' });

      // Sync rules
      await supabase.from('app_popup_rule').delete().eq('popup_id', popup.id);
      if (popup.rules.length > 0) {
        await supabase.from('app_popup_rule').insert(
          popup.rules.map(r => ({
            id: r.id,
            popup_id: popup.id,
            trigger_type: r.trigger_type,
            trigger_value: r.trigger_value,
            hide_after_close: r.hide_after_close,
            order_index: r.order_index,
          }))
        );
      }
    }
    toast.success('Popups saved / 弹窗已保存');
  }, [projectId]);

  const addPopup = () => {
    const newPopup: PopupConfig = {
      id: crypto.randomUUID(),
      project_id: projectId,
      title: `Popup ${popups.length + 1}`,
      questionnaire_id: null,
      content: null,
      enabled: true,
      order_index: popups.length,
      rules: [{
        id: crypto.randomUUID(),
        popup_id: '',
        trigger_type: 'first_open',
        trigger_value: 0,
        hide_after_close: true,
        order_index: 0,
      }],
    };
    newPopup.rules[0].popup_id = newPopup.id;
    const updated = [...popups, newPopup];
    savePopups(updated);
    setExpandedId(newPopup.id);
  };

  const updatePopup = (id: string, updates: Partial<PopupConfig>) => {
    const updated = popups.map(p => p.id === id ? { ...p, ...updates } : p);
    savePopups(updated);
  };

  const removePopup = (id: string) => {
    savePopups(popups.filter(p => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addRule = (popupId: string) => {
    const popup = popups.find(p => p.id === popupId);
    if (!popup) return;
    const newRule: PopupRule = {
      id: crypto.randomUUID(),
      popup_id: popupId,
      trigger_type: 'each_open',
      trigger_value: 0,
      hide_after_close: true,
      order_index: popup.rules.length,
    };
    updatePopup(popupId, { rules: [...popup.rules, newRule] });
  };

  const updateRule = (popupId: string, ruleId: string, updates: Partial<PopupRule>) => {
    const popup = popups.find(p => p.id === popupId);
    if (!popup) return;
    updatePopup(popupId, {
      rules: popup.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r),
    });
  };

  const removeRule = (popupId: string, ruleId: string) => {
    const popup = popups.find(p => p.id === popupId);
    if (!popup) return;
    updatePopup(popupId, { rules: popup.rules.filter(r => r.id !== ruleId) });
  };

  // Components that can be linked / 可链接的组件
  const linkableComponents = questionnaires.filter(q =>
    ['consent', 'screening', 'profile', 'help', 'custom', 'onboarding', 'survey'].includes(q.questionnaire_type)
  );

  if (loading) {
    return <div className="text-center py-12 text-stone-400">Loading popups... / 加载弹窗中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-800">Popups / 弹窗</h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Build modal popups with trigger rules / 构建带触发规则的模态弹窗
          </p>
        </div>
        <button
          onClick={addPopup}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors"
        >
          <Plus size={14} /> Add Popup / 添加弹窗
        </button>
      </div>

      {popups.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
          <Layers size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-400">No popups yet / 暂无弹窗</p>
          <p className="text-xs text-stone-300 mt-1">Add a popup to create welcome screens, announcements, or timed prompts / 添加弹窗以创建欢迎界面、公告或定时提示</p>
          <button
            onClick={addPopup}
            className="mt-4 px-4 py-2 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <Plus size={14} className="inline mr-1" /> Create First Popup / 创建第一个弹窗
          </button>
        </div>
      )}

      {popups.map(popup => {
        const isExpanded = expandedId === popup.id;
        return (
          <div key={popup.id} className="border border-stone-200 rounded-xl bg-white overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : popup.id)}
            >
              {isExpanded ? <ChevronDown size={16} className="text-stone-400" /> : <ChevronRight size={16} className="text-stone-400" />}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-stone-700">{popup.title}</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400">
                  {popup.rules.length} rule{popup.rules.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); updatePopup(popup.id, { enabled: !popup.enabled }); }}
                className="p-1"
              >
                {popup.enabled
                  ? <ToggleRight size={20} className="text-emerald-500" />
                  : <ToggleLeft size={20} className="text-stone-300" />
                }
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removePopup(popup.id); }}
                className="p-1 text-stone-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Body */}
            {isExpanded && (
              <div className="border-t border-stone-100 px-4 py-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Popup Title / 弹窗标题</label>
                  <input
                    type="text"
                    value={popup.title}
                    onChange={(e) => updatePopup(popup.id, { title: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
                  />
                </div>

                {/* Content source / 内容来源 */}
                <div>
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Content Source / 内容来源</label>
                  <CustomDropdown
                    options={[
                      { value: '_text', label: 'Custom Text / 自定义文本' },
                      ...linkableComponents.map(q => ({
                        value: q.id,
                        label: q.title,
                      })),
                    ]}
                    value={popup.questionnaire_id || '_text'}
                    onChange={(v) => {
                      if (v === '_text') {
                        updatePopup(popup.id, { questionnaire_id: null, content: popup.content || 'Enter popup content here...' });
                      } else {
                        updatePopup(popup.id, { questionnaire_id: v, content: null });
                      }
                    }}
                    placeholder="Select content source"
                  />
                </div>

                {/* Text content editor / 文本内容编辑器 */}
                {!popup.questionnaire_id && (
                  <div>
                    <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Text Content / 文本内容</label>
                    <textarea
                      value={popup.content || ''}
                      onChange={(e) => updatePopup(popup.id, { content: e.target.value })}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-y"
                      placeholder="Enter popup content... / 输入弹窗内容..."
                    />
                  </div>
                )}

                {/* Rules / 规则 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                      Trigger Rules / 触发规则
                    </label>
                    <button
                      onClick={() => addRule(popup.id)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      + Add Rule / 添加规则
                    </button>
                  </div>

                  {popup.rules.length === 0 && (
                    <p className="text-xs text-stone-300 italic">No rules — popup won't trigger / 无规则——弹窗不会触发</p>
                  )}

                  <div className="space-y-2">
                    {popup.rules.map((rule, ri) => (
                      <div key={rule.id} className="flex items-start gap-2 p-3 rounded-lg bg-stone-50 border border-stone-100">
                        <div className="flex-1 space-y-2">
                          <CustomDropdown
                            options={TRIGGER_TYPES.map(tt => ({ value: tt.value, label: tt.label }))}
                            value={rule.trigger_type}
                            onChange={(v) => updateRule(popup.id, rule.id, { trigger_type: v as any })}
                            placeholder="Select trigger"
                          />

                          {rule.trigger_type === 'timed' && (
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-stone-400" />
                              <input
                                type="number"
                                min={0}
                                value={rule.trigger_value}
                                onChange={(e) => updateRule(popup.id, rule.id, { trigger_value: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 text-xs border border-stone-200 rounded-lg"
                              />
                              <span className="text-xs text-stone-400">seconds / 秒</span>
                            </div>
                          )}

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.hide_after_close}
                              onChange={(e) => updateRule(popup.id, rule.id, { hide_after_close: e.target.checked })}
                              className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-300"
                            />
                            <span className="text-xs text-stone-500">
                              {rule.hide_after_close ? <EyeOff size={11} className="inline mr-1" /> : <Eye size={11} className="inline mr-1" />}
                              Don't show again after close / 关闭后不再显示
                            </span>
                          </label>
                        </div>

                        <button
                          onClick={() => removeRule(popup.id, rule.id)}
                          className="p-1 text-stone-300 hover:text-red-400 transition-colors mt-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PopupBuilder;
