import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Type, Image, Minus, Square, ArrowUp, ArrowDown, Globe, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

// Block types available for public pages / 公开页面可用的块类型
const BLOCK_TYPES = [
  { value: 'text', label: 'Text', icon: <Type size={14} /> },
  { value: 'image', label: 'Image', icon: <Image size={14} /> },
  { value: 'spacer', label: 'Spacer', icon: <Square size={14} /> },
  { value: 'divider', label: 'Divider', icon: <Minus size={14} /> },
] as const;

type BlockType = typeof BLOCK_TYPES[number]['value'];

export interface PageBlock {
  id: string;
  page_id: string;
  type: BlockType;
  content: string | null;
  image_url: string | null;
  style_padding: string | null;
  style_background: string | null;
  style_text_color: string | null;
  style_text_align: string | null;
  style_font_size: string | null;
  style_font_weight: string | null;
  style_height: string | null;
  style_border_radius: string | null;
  order_index: number;
}

export interface PublicPage {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  description: string | null;
  enabled: boolean;
  order_index: number;
  blocks: PageBlock[];
}

interface PublicPageBuilderProps {
  projectId: string;
}

const PublicPageBuilder: React.FC<PublicPageBuilderProps> = ({ projectId }) => {
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  // Load pages from DB / 从数据库加载页面
  const loadPages = useCallback(async () => {
    try {
      const { data: pageRows, error: pErr } = await (supabase as any)
        .from('app_public_page')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');
      if (pErr) throw pErr;
      if (!pageRows?.length) { setPages([]); setLoading(false); return; }

      const pageIds = pageRows.map((p: any) => p.id);
      const { data: blockRows, error: bErr } = await (supabase as any)
        .from('app_public_page_block')
        .select('*')
        .in('page_id', pageIds)
        .order('order_index');
      if (bErr) throw bErr;

      const mapped: PublicPage[] = pageRows.map((p: any) => ({
        ...p,
        blocks: (blockRows || []).filter((b: any) => b.page_id === p.id),
      }));
      setPages(mapped);
    } catch (e: any) {
      console.error('Failed to load public pages / 加载公开页面失败:', e);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadPages(); }, [loadPages]);

  // Add page / 添加页面
  const addPage = async () => {
    const newPage = {
      project_id: projectId,
      title: `Page ${pages.length + 1}`,
      slug: `page-${pages.length + 1}`,
      enabled: true,
      order_index: pages.length,
    };
    const { data, error } = await (supabase as any).from('app_public_page').insert(newPage).select().single();
    if (error) { toast.error('Failed to create page'); return; }
    const created: PublicPage = { ...data, blocks: [] };
    setPages(prev => [...prev, created]);
    setExpandedId(created.id);
    toast.success('Page created / 页面已创建');
  };

  // Delete page / 删除页面
  const deletePage = async (id: string) => {
    const { error } = await (supabase as any).from('app_public_page').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setPages(prev => prev.filter(p => p.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast.success('Page deleted / 页面已删除');
  };

  // Update page field / 更新页面字段
  const updatePage = async (id: string, field: string, value: any) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    const { error } = await (supabase as any).from('app_public_page').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error('Save failed');
  };

  // Add block to page / 向页面添加块
  const addBlock = async (pageId: string, type: BlockType) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const newBlock = {
      page_id: pageId,
      type,
      content: type === 'text' ? 'Enter text here...' : null,
      order_index: page.blocks.length,
      style_height: type === 'spacer' ? '32px' : null,
    };
    const { data, error } = await (supabase as any).from('app_public_page_block').insert(newBlock).select().single();
    if (error) { toast.error('Failed to add block'); return; }
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: [...p.blocks, data] } : p));
  };

  // Delete block / 删除块
  const deleteBlock = async (pageId: string, blockId: string) => {
    const { error } = await (supabase as any).from('app_public_page_block').delete().eq('id', blockId);
    if (error) { toast.error('Failed to delete block'); return; }
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) } : p));
  };

  // Update block field / 更新块字段
  const updateBlock = async (pageId: string, blockId: string, field: string, value: any) => {
    setPages(prev => prev.map(p => p.id === pageId ? {
      ...p,
      blocks: p.blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b),
    } : p));
    const { error } = await (supabase as any).from('app_public_page_block').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', blockId);
    if (error) toast.error('Save failed');
  };

  // Move block up/down / 上下移动块
  const moveBlock = async (pageId: string, blockId: string, dir: 'up' | 'down') => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const idx = page.blocks.findIndex(b => b.id === blockId);
    if ((dir === 'up' && idx <= 0) || (dir === 'down' && idx >= page.blocks.length - 1)) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const newBlocks = [...page.blocks];
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
    newBlocks.forEach((b, i) => b.order_index = i);
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: newBlocks } : p));
    // Persist order / 持久化顺序
    await Promise.all(newBlocks.map(b =>
      (supabase as any).from('app_public_page_block').update({ order_index: b.order_index }).eq('id', b.id)
    ));
  };

  if (loading) return <div className="text-stone-400 text-sm py-8 text-center">Loading public pages...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-800">Public Pages</h3>
          <p className="text-xs text-stone-400 mt-0.5">Build recruitment, introduction, and landing pages for your study</p>
        </div>
        <button onClick={addPage} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">
          <Plus size={14} /> Add Page
        </button>
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12 text-stone-400 text-sm border border-dashed border-stone-200 rounded-xl">
          No public pages yet. Add one to get started.
        </div>
      )}

      {pages.map(page => {
        const isExpanded = expandedId === page.id;
        return (
          <div key={page.id} className="border border-stone-200 rounded-xl bg-white overflow-hidden">
            {/* Page header / 页面标题 */}
            <div
              className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : page.id)}
            >
              {isExpanded ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
              <Globe size={14} className="text-emerald-500" />
              <span className="text-sm font-medium text-stone-700 flex-1">{page.title || 'Untitled'}</span>
              <span className="text-[10px] text-stone-400 mr-2">{page.blocks.length} blocks</span>
              <button
                onClick={e => { e.stopPropagation(); updatePage(page.id, 'enabled', !page.enabled); }}
                className="p-1 rounded hover:bg-stone-100"
                title={page.enabled ? 'Disable / 禁用' : 'Enable / 启用'}
              >
                {page.enabled ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-stone-300" />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); deletePage(page.id); }}
                className="p-1 rounded hover:bg-red-50 text-stone-300 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Page config / 页面配置 */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-stone-100 space-y-4">
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div>
                    <label className="text-[11px] text-stone-400 mb-1 block">Title / 标题</label>
                    <input
                      value={page.title}
                      onChange={e => updatePage(page.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 mb-1 block">Slug / 路径</label>
                    <input
                      value={page.slug}
                      onChange={e => updatePage(page.id, 'slug', e.target.value.replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 font-mono"
                      placeholder="recruitment-page"
                    />
                  </div>
                </div>
                {/* Shareable URL / 可分享链接 */}
                {page.slug && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-100">
                    <Globe size={12} className="text-stone-400 shrink-0" />
                    <code className="text-[11px] text-stone-500 flex-1 truncate">{window.location.origin}/easyresearch/page/{projectId}/{page.slug}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/easyresearch/page/${projectId}/${page.slug}`); toast.success('URL copied / 链接已复制'); }}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium shrink-0"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
                <div>
                  <label className="text-[11px] text-stone-400 mb-1 block">Description / 描述</label>
                  <textarea
                    value={page.description || ''}
                    onChange={e => updatePage(page.id, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-none"
                    rows={2}
                  />
                </div>

                {/* Blocks / 块 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Blocks / 内容块</span>
                    <div className="flex gap-1">
                      {BLOCK_TYPES.map(bt => (
                        <button
                          key={bt.value}
                          onClick={() => addBlock(page.id, bt.value)}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] border border-stone-200 rounded-md hover:bg-stone-50 text-stone-500 transition-colors"
                          title={bt.label}
                        >
                          {bt.icon} {bt.label.split(' / ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {page.blocks.length === 0 && (
                    <div className="text-center py-6 text-stone-300 text-xs border border-dashed border-stone-200 rounded-lg">
                      Add blocks above / 从上方添加内容块
                    </div>
                  )}

                  <div className="space-y-2">
                    {page.blocks.map((block, bIdx) => {
                      const isBlockExpanded = expandedBlockId === block.id;
                      const typeInfo = BLOCK_TYPES.find(bt => bt.value === block.type);
                      return (
                        <div key={block.id} className="border border-stone-150 rounded-lg bg-stone-50/50">
                          <div className="flex items-center gap-2 px-3 py-2">
                            <GripVertical size={12} className="text-stone-300" />
                            <span className="text-stone-400">{typeInfo?.icon}</span>
                            <span className="text-xs text-stone-600 flex-1">
                              {typeInfo?.label || block.type}
                              {block.type === 'text' && block.content ? (
                                <span className="text-stone-400 ml-1">— {block.content.slice(0, 40)}{block.content.length > 40 ? '...' : ''}</span>
                              ) : null}
                            </span>
                            <button onClick={() => moveBlock(page.id, block.id, 'up')} disabled={bIdx === 0} className="p-0.5 rounded hover:bg-stone-200 disabled:opacity-30"><ArrowUp size={12} /></button>
                            <button onClick={() => moveBlock(page.id, block.id, 'down')} disabled={bIdx === page.blocks.length - 1} className="p-0.5 rounded hover:bg-stone-200 disabled:opacity-30"><ArrowDown size={12} /></button>
                            <button onClick={() => setExpandedBlockId(isBlockExpanded ? null : block.id)} className="p-0.5 rounded hover:bg-stone-200">
                              {isBlockExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                            <button onClick={() => deleteBlock(page.id, block.id)} className="p-0.5 rounded hover:bg-red-50 text-stone-300 hover:text-red-500"><Trash2 size={12} /></button>
                          </div>

                          {/* Block config panel / 块配置面板 */}
                          {isBlockExpanded && (
                            <div className="px-3 pb-3 border-t border-stone-100 pt-2 space-y-2">
                              {block.type === 'text' && (
                                <textarea
                                  value={block.content || ''}
                                  onChange={e => updateBlock(page.id, block.id, 'content', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-none"
                                  rows={4}
                                  placeholder="Enter text content... / 输入文本内容..."
                                />
                              )}
                              {block.type === 'image' && (
                                <input
                                  value={block.image_url || ''}
                                  onChange={e => updateBlock(page.id, block.id, 'image_url', e.target.value)}
                                  className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
                                  placeholder="Image URL / 图片URL"
                                />
                              )}
                              {block.type === 'spacer' && (
                                <div>
                                  <label className="text-[11px] text-stone-400 mb-1 block">Height / 高度</label>
                                  <input
                                    value={block.style_height || '32px'}
                                    onChange={e => updateBlock(page.id, block.id, 'style_height', e.target.value)}
                                    className="w-32 px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
                                    placeholder="32px"
                                  />
                                </div>
                              )}
                              {/* Style controls for text and image / 文本和图片的样式控制 */}
                              {(block.type === 'text' || block.type === 'image') && (
                                <div className="grid grid-cols-4 gap-2 pt-1">
                                  <div>
                                    <label className="text-[10px] text-stone-400 block">Align / 对齐</label>
                                    <select
                                      value={block.style_text_align || 'left'}
                                      onChange={e => updateBlock(page.id, block.id, 'style_text_align', e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-stone-200 rounded"
                                    >
                                      <option value="left">Left</option>
                                      <option value="center">Center</option>
                                      <option value="right">Right</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-stone-400 block">Size / 大小</label>
                                    <select
                                      value={block.style_font_size || '14px'}
                                      onChange={e => updateBlock(page.id, block.id, 'style_font_size', e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-stone-200 rounded"
                                    >
                                      <option value="12px">Small</option>
                                      <option value="14px">Normal</option>
                                      <option value="18px">Large</option>
                                      <option value="24px">XL</option>
                                      <option value="32px">2XL</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-stone-400 block">Weight / 粗细</label>
                                    <select
                                      value={block.style_font_weight || 'normal'}
                                      onChange={e => updateBlock(page.id, block.id, 'style_font_weight', e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-stone-200 rounded"
                                    >
                                      <option value="normal">Normal</option>
                                      <option value="500">Medium</option>
                                      <option value="600">Semibold</option>
                                      <option value="700">Bold</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-stone-400 block">Padding / 内边距</label>
                                    <input
                                      value={block.style_padding || ''}
                                      onChange={e => updateBlock(page.id, block.id, 'style_padding', e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-stone-200 rounded"
                                      placeholder="8px"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

export default PublicPageBuilder;
