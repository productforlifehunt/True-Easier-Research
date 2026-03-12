/**
 * Survey Versioning & Collaboration System
 * 问卷版本管理与协作系统
 *
 * Features: version history, rollback, diff view, multi-researcher collaboration
 * 功能：版本历史、回滚、差异视图、多研究者协作
 */
import React, { useState, useEffect } from 'react';
import { History, RotateCcw, GitBranch, Users, Clock, Eye, ChevronRight, Plus, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bToast } from '../utils/bilingualToast';

interface Version {
  id: string;
  version_number: number;
  label: string;
  snapshot: any; // full questionnaire + question snapshot
  created_by: string;
  created_by_email?: string;
  created_at: string;
  change_summary: string;
  question_count: number;
  is_published: boolean;
}

interface Collaborator {
  id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  added_at: string;
  last_active?: string;
}

interface Props {
  projectId: string;
  questionnaires: any[];
  questions: any[];
  onRestore: (snapshot: any) => void;
}

const SurveyVersioning: React.FC<Props> = ({ projectId, questionnaires, questions, onRestore }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'versions' | 'collaborators'>('versions');
  const [newLabel, setNewLabel] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState<'editor' | 'viewer'>('editor');
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null);

  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      // Load version history from project setting / 从项目设置加载版本历史
      const { data: project } = await supabase
        .from('research_project')
        .select('setting')
        .eq('id', projectId)
        .maybeSingle();

      const setting = project?.setting as any || {};
      setVersions(setting.versions || []);
      setCollaborators(setting.collaborators || []);
    } catch (e) {
      console.error('Error loading versions:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveVersion = async () => {
    try {
      // Create snapshot / 创建快照
      const snapshot = {
        questionnaires: questionnaires.map(q => ({
          id: q.id,
          title: q.title,
          category: q.category,
          questions: (q.questions || []).map((qu: any) => ({
            id: qu.id,
            question_type: qu.question_type,
            question_text: qu.question_text,
            question_description: qu.question_description,
            question_config: qu.question_config,
            order_index: qu.order_index,
            required: qu.required,
            options: qu.options,
          })),
        })),
      };

      const newVersion: Version = {
        id: crypto.randomUUID(),
        version_number: versions.length + 1,
        label: newLabel || `v${versions.length + 1}`,
        snapshot,
        created_by: 'current_user',
        created_at: new Date().toISOString(),
        change_summary: `${questionnaires.length} questionnaires, ${questions.length} questions`,
        question_count: questions.length,
        is_published: false,
      };

      const updatedVersions = [newVersion, ...versions].slice(0, 50); // Keep max 50 versions / 保留最多50个版本

      const { data: project } = await supabase
        .from('research_project')
        .select('setting')
        .eq('id', projectId)
        .maybeSingle();

      const setting = (project?.setting as any) || {};

      await supabase
        .from('research_project')
        .update({ setting: { ...setting, versions: updatedVersions } })
        .eq('id', projectId);

      setVersions(updatedVersions);
      setNewLabel('');
      toast.success('Version saved / 版本已保存');
    } catch (e) {
      console.error('Error saving version:', e);
      toast.error('Failed to save version');
    }
  };

  const restoreVersion = (version: Version) => {
    if (!window.confirm(`Restore to "${version.label}"? Current unsaved changes will be lost. / 恢复到"${version.label}"？当前未保存的更改将丢失。`)) return;
    onRestore(version.snapshot);
    toast.success(`Restored to ${version.label} / 已恢复到 ${version.label}`);
  };

  const addCollaborator = async () => {
    if (!newCollabEmail.trim()) return;
    const newCollab: Collaborator = {
      id: crypto.randomUUID(),
      user_id: '',
      email: newCollabEmail.trim(),
      role: newCollabRole,
      added_at: new Date().toISOString(),
    };

    const updatedCollabs = [...collaborators, newCollab];

    const { data: project } = await supabase
      .from('research_project')
      .select('setting')
      .eq('id', projectId)
      .maybeSingle();

    const setting = (project?.setting as any) || {};

    await supabase
      .from('research_project')
      .update({ setting: { ...setting, collaborators: updatedCollabs } })
      .eq('id', projectId);

    setCollaborators(updatedCollabs);
    setNewCollabEmail('');
    toast.success('Collaborator added / 协作者已添加');
  };

  const removeCollaborator = async (id: string) => {
    const updatedCollabs = collaborators.filter(c => c.id !== id);

    const { data: project } = await supabase
      .from('research_project')
      .select('setting')
      .eq('id', projectId)
      .maybeSingle();

    const setting = (project?.setting as any) || {};

    await supabase
      .from('research_project')
      .update({ setting: { ...setting, collaborators: updatedCollabs } })
      .eq('id', projectId);

    setCollaborators(updatedCollabs);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher / 标签切换 */}
      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setActiveView('versions')}
          className={`text-[12px] px-4 py-1.5 rounded-md transition-colors ${activeView === 'versions' ? 'bg-white text-stone-800 shadow-sm font-medium' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <History size={12} className="inline mr-1.5" />
          Versions / 版本 ({versions.length})
        </button>
        <button
          onClick={() => setActiveView('collaborators')}
          className={`text-[12px] px-4 py-1.5 rounded-md transition-colors ${activeView === 'collaborators' ? 'bg-white text-stone-800 shadow-sm font-medium' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <Users size={12} className="inline mr-1.5" />
          Collaborators / 协作者 ({collaborators.length})
        </button>
      </div>

      {activeView === 'versions' && (
        <>
          {/* Save New Version / 保存新版本 */}
          <div className="bg-white rounded-xl border border-stone-100 p-4">
            <h3 className="text-[13px] font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Save size={14} className="text-emerald-500" />
              Save Current State / 保存当前状态
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Version label (e.g., 'Before pilot') / 版本标签"
                className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-stone-200 outline-none focus:border-emerald-300"
              />
              <button
                onClick={saveVersion}
                className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors"
              >
                <GitBranch size={13} /> Save Version / 保存版本
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              Current: {questionnaires.length} questionnaires, {questions.length} questions / 当前：{questionnaires.length} 个问卷，{questions.length} 个问题
            </p>
          </div>

          {/* Version History / 版本历史 */}
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100">
              <h3 className="text-[13px] font-semibold text-stone-800 flex items-center gap-2">
                <History size={14} className="text-blue-500" />
                Version History / 版本历史
              </h3>
            </div>

            {versions.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <History size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-[12px]">No versions saved yet / 尚无保存的版本</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto">
                {versions.map((v, i) => (
                  <div key={v.id} className="px-5 py-3 flex items-center gap-4 hover:bg-stone-25 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      v{v.version_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-stone-700">{v.label}</p>
                      <p className="text-[10px] text-stone-400 flex items-center gap-2">
                        <Clock size={10} /> {formatDate(v.created_at)} • {v.question_count} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingVersion(viewingVersion?.id === v.id ? null : v)}
                        className="text-[10px] px-2 py-1 rounded border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
                      >
                        <Eye size={10} className="inline mr-1" /> Preview
                      </button>
                      {i > 0 && (
                        <button
                          onClick={() => restoreVersion(v)}
                          className="text-[10px] px-2 py-1 rounded border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <RotateCcw size={10} className="inline mr-1" /> Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version Preview / 版本预览 */}
          {viewingVersion && (
            <div className="bg-white rounded-xl border border-blue-100 p-4">
              <h3 className="text-[13px] font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <Eye size={14} className="text-blue-500" />
                Preview: {viewingVersion.label}
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(viewingVersion.snapshot?.questionnaires || []).map((qc: any) => (
                  <div key={qc.id} className="border border-stone-100 rounded-lg p-3">
                    <p className="text-[12px] font-medium text-stone-700 mb-1">{qc.title}</p>
                    <div className="space-y-1">
                      {(qc.questions || []).map((q: any, i: number) => (
                        <p key={q.id} className="text-[10px] text-stone-500 pl-3 flex items-start gap-2">
                          <span className="text-stone-300 shrink-0">Q{i + 1}</span>
                          <span>{q.question_text?.substring(0, 80)}</span>
                          <span className="ml-auto text-stone-300 shrink-0">{q.question_type}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'collaborators' && (
        <>
          {/* Add Collaborator / 添加协作者 */}
          <div className="bg-white rounded-xl border border-stone-100 p-4">
            <h3 className="text-[13px] font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Plus size={14} className="text-emerald-500" />
              Add Collaborator / 添加协作者
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={newCollabEmail}
                onChange={e => setNewCollabEmail(e.target.value)}
                placeholder="researcher@email.com"
                className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-stone-200 outline-none focus:border-emerald-300"
              />
              <select
                value={newCollabRole}
                onChange={e => setNewCollabRole(e.target.value as any)}
                className="text-[12px] px-2 py-2 rounded-lg border border-stone-200 bg-white"
              >
                <option value="editor">Editor / 编辑者</option>
                <option value="viewer">Viewer / 查看者</option>
              </select>
              <button
                onClick={addCollaborator}
                className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={13} /> Add / 添加
              </button>
            </div>
          </div>

          {/* Collaborator List / 协作者列表 */}
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100">
              <h3 className="text-[13px] font-semibold text-stone-800 flex items-center gap-2">
                <Users size={14} className="text-violet-500" />
                Team Members / 团队成员
              </h3>
            </div>
            {collaborators.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <Users size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-[12px]">No collaborators added / 未添加协作者</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-50">
                {collaborators.map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-bold text-violet-700 shrink-0">
                      {c.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-stone-700 truncate">{c.email}</p>
                      <p className="text-[10px] text-stone-400">Added {formatDate(c.added_at)}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      c.role === 'owner' ? 'bg-emerald-100 text-emerald-700' :
                      c.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {c.role}
                    </span>
                    {c.role !== 'owner' && (
                      <button
                        onClick={() => removeCollaborator(c.id)}
                        className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SurveyVersioning;
