import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Trash2, Users, Lock, Sparkles, ArrowLeft, Edit3, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { bToast, toast } from '../utils/bilingualToast';

const ADMIN_EMAIL = 'guowei.jiang.work@gmail.com';

interface CustomElement {
  id: string;
  user_id: string;
  name_en: string;
  name_zh: string;
  description_en: string | null;
  description_zh: string | null;
  icon: string;
  element_config: any;
  is_public: boolean;
  created_at: string;
}

interface ElementUser {
  id: string;
  element_id: string;
  user_id: string;
  granted_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [elements, setElements] = useState<CustomElement[]>([]);
  const [elementUsers, setElementUsers] = useState<ElementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CustomElement>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [assigningElementId, setAssigningElementId] = useState<string | null>(null);

  // Guard: only admin can access / 仅管理员可访问
  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/easyresearch/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch all custom elements + assignments / 获取所有定制部件和分配
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [elemRes, usersRes] = await Promise.all([
        (supabase as any).from('custom_function_element').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('custom_element_user').select('*'),
      ]);
      if (elemRes.data) setElements(elemRes.data);
      if (usersRes.data) setElementUsers(usersRes.data);
    } catch (e) {
      console.error('Failed to fetch admin data', e);
    }
    setLoading(false);
  };

  const createNewElement = async () => {
    const newEl = {
      user_id: user!.id,
      name_en: editForm.name_en || 'New Custom Element',
      name_zh: editForm.name_zh || '新定制部件',
      description_en: editForm.description_en || '',
      description_zh: editForm.description_zh || '',
      icon: editForm.icon || 'Sparkles',
      element_config: {},
      is_public: editForm.is_public ?? false,
    };
    const { data, error } = await (supabase as any).from('custom_function_element').insert(newEl).select().single();
    if (error) { toast.error('Failed to create: ' + error.message); return; }
    toast.success('Created / 已创建');
    setShowCreate(false);
    setEditForm({});
    fetchData();
  };

  const saveElement = async (id: string) => {
    const { error } = await (supabase as any).from('custom_function_element')
      .update({
        name_en: editForm.name_en,
        name_zh: editForm.name_zh,
        description_en: editForm.description_en,
        description_zh: editForm.description_zh,
        icon: editForm.icon,
        is_public: editForm.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) { toast.error('Save failed: ' + error.message); return; }
    toast.success('Saved / 已保存');
    setEditingId(null);
    fetchData();
  };

  const deleteElement = async (id: string) => {
    if (!confirm('Delete this element? / 删除该部件？')) return;
    await (supabase as any).from('custom_function_element').delete().eq('id', id);
    toast.success('Deleted / 已删除');
    fetchData();
  };

  const assignUser = async (elementId: string) => {
    if (!newUserEmail.trim()) return;
    // Look up user by email from auth — we need to find user_id
    // Since we can't query auth.users, we'll use the researcher table
    const { data: researcher } = await (supabase as any).from('researcher')
      .select('user_id')
      .eq('email', newUserEmail.trim())
      .limit(1)
      .single();

    if (!researcher) {
      toast.error('User not found / 未找到用户');
      return;
    }

    const { error } = await (supabase as any).from('custom_element_user').insert({
      element_id: elementId,
      user_id: researcher.user_id,
    });
    if (error) {
      if (error.code === '23505') toast.error('Already assigned / 已分配');
      else toast.error('Failed: ' + error.message);
      return;
    }
    toast.success('Assigned / 已分配');
    setNewUserEmail('');
    setAssigningElementId(null);
    fetchData();
  };

  const removeUserAssignment = async (assignmentId: string) => {
    await (supabase as any).from('custom_element_user').delete().eq('id', assignmentId);
    toast.success('Removed / 已移除');
    fetchData();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header / 头部 */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/easyresearch/dashboard')} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
            <ArrowLeft size={18} className="text-stone-500" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-red-500" />
            <h1 className="text-xl font-bold text-stone-800">
              {lang === 'zh' ? '管理员面板' : 'Admin Dashboard'}
            </h1>
          </div>
        </div>

        {/* Private Elements Tab / 定制部件标签 */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-amber-500" />
              <h2 className="text-[15px] font-semibold text-stone-700">
                {lang === 'zh' ? '定制部件管理' : 'Private Element Management'}
              </h2>
              <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{elements.length}</span>
            </div>
            <button onClick={() => { setShowCreate(true); setEditForm({}); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600 transition-colors">
              <Plus size={13} /> {lang === 'zh' ? '新建' : 'Create'}
            </button>
          </div>

          {/* Create form / 创建表单 */}
          {showCreate && (
            <div className="px-5 py-4 bg-emerald-50/50 border-b border-stone-100">
              <h3 className="text-[13px] font-semibold text-stone-600 mb-3">{lang === 'zh' ? '新建定制部件' : 'Create Custom Element'}</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Name (EN)</label>
                  <input value={editForm.name_en || ''} onChange={e => setEditForm({ ...editForm, name_en: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">名称 (ZH)</label>
                  <input value={editForm.name_zh || ''} onChange={e => setEditForm({ ...editForm, name_zh: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Description (EN)</label>
                  <input value={editForm.description_en || ''} onChange={e => setEditForm({ ...editForm, description_en: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">描述 (ZH)</label>
                  <input value={editForm.description_zh || ''} onChange={e => setEditForm({ ...editForm, description_zh: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 text-[12px] text-stone-600">
                  <input type="checkbox" checked={editForm.is_public || false} onChange={e => setEditForm({ ...editForm, is_public: e.target.checked })} />
                  Public / 公开
                </label>
                <div>
                  <label className="text-[11px] text-stone-400 mr-1">Icon:</label>
                  <input value={editForm.icon || ''} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} placeholder="Sparkles"
                    className="px-2 py-1 rounded-lg border border-stone-200 text-[12px] w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createNewElement} className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[12px] font-medium hover:bg-emerald-600">
                  {lang === 'zh' ? '创建' : 'Create'}
                </button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-1.5 border border-stone-200 text-stone-500 rounded-full text-[12px] hover:bg-stone-50">
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {/* Element list / 部件列表 */}
          <div className="divide-y divide-stone-100">
            {elements.length === 0 ? (
              <div className="px-5 py-12 text-center text-stone-400 text-[13px]">
                {lang === 'zh' ? '暂无定制部件' : 'No custom elements yet'}
              </div>
            ) : elements.map(el => {
              const assignments = elementUsers.filter(eu => eu.element_id === el.id);
              const isEditing = editingId === el.id;

              return (
                <div key={el.id} className="px-5 py-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Name (EN)</label>
                          <input value={editForm.name_en || ''} onChange={e => setEditForm({ ...editForm, name_en: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">名称 (ZH)</label>
                          <input value={editForm.name_zh || ''} onChange={e => setEditForm({ ...editForm, name_zh: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Description (EN)</label>
                          <input value={editForm.description_en || ''} onChange={e => setEditForm({ ...editForm, description_en: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">描述 (ZH)</label>
                          <input value={editForm.description_zh || ''} onChange={e => setEditForm({ ...editForm, description_zh: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-[13px]" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveElement(el.id)} className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-[11px]">
                          <Save size={11} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1 border border-stone-200 text-stone-500 rounded-full text-[11px]">
                          <X size={11} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-500" />
                          <span className="text-[14px] font-semibold text-stone-800">{el.name_en}</span>
                          <span className="text-[12px] text-stone-400">/ {el.name_zh}</span>
                          {el.is_public && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">Public</span>}
                          {!el.is_public && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Private</span>}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">{el.description_en}</p>

                        {/* Assigned users / 已分配用户 */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Users size={12} className="text-stone-400" />
                          <span className="text-[10px] text-stone-400 font-medium">{assignments.length} user(s)</span>
                          {assignments.map(a => (
                            <span key={a.id} className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              {a.user_id.slice(0, 8)}...
                              <button onClick={() => removeUserAssignment(a.id)} className="hover:text-red-500"><X size={9} /></button>
                            </span>
                          ))}
                          <button onClick={() => setAssigningElementId(assigningElementId === el.id ? null : el.id)}
                            className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium">
                            + Assign
                          </button>
                        </div>

                        {assigningElementId === el.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
                              placeholder="user@email.com" className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] w-48" />
                            <button onClick={() => assignUser(el.id)}
                              className="px-2 py-1 bg-emerald-500 text-white rounded-full text-[10px]">Add</button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(el.id); setEditForm(el); }}
                          className="p-1.5 rounded-lg hover:bg-stone-100"><Edit3 size={14} className="text-stone-400" /></button>
                        <button onClick={() => deleteElement(el.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
