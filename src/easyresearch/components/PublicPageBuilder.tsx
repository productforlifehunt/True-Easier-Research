import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, GripVertical, Globe, Copy, Eye, EyeOff,
  ChevronDown, ChevronRight, Edit3, X,
  Type, Image, Minus, Square, MousePointer, FileText, ArrowUp, ArrowDown,
  Calendar, Shield, ClipboardCheck, User, HelpCircle, Layers, BarChart3, Link2, CheckSquare, Maximize2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { QuestionnaireConfig } from './QuestionnaireList';

// ── Block types for public pages ──
const LAYOUT_BLOCK_TYPES = [
  { type: 'text', label: 'Text Block', icon: Type, desc: 'Rich text content' },
  { type: 'image', label: 'Image', icon: Image, desc: 'Image block' },
  { type: 'spacer', label: 'Spacer', icon: Maximize2, desc: 'Add vertical space' },
  { type: 'divider', label: 'Divider', icon: Minus, desc: 'Horizontal divider' },
  { type: 'button', label: 'Button', icon: MousePointer, desc: 'Action button' },
] as const;

const FUNCTION_BLOCK_TYPES = [
  { type: 'signup_form', label: 'Sign Up Form', icon: User, desc: 'Participant registration' },
  { type: 'start_date_picker', label: 'Set Start Date', icon: Calendar, desc: 'Custom study start date' },
] as const;

type BlockType = string;

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
  questionnaires?: QuestionnaireConfig[];
}

const PublicPageBuilder: React.FC<PublicPageBuilderProps> = ({ projectId, questionnaires = [] }) => {
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [showAddElement, setShowAddElement] = useState(false);

  const activePage = pages.find(p => p.id === activePageId);

  // ── Load pages ──
  const loadPages = useCallback(async () => {
    try {
      const { data: pageRows, error: pErr } = await (supabase as any)
        .from('app_public_page').select('*').eq('project_id', projectId).order('order_index');
      if (pErr) throw pErr;
      if (!pageRows?.length) { setPages([]); setLoading(false); return; }
      const pageIds = pageRows.map((p: any) => p.id);
      const { data: blockRows } = await (supabase as any)
        .from('app_public_page_block').select('*').in('page_id', pageIds).order('order_index');
      const mapped: PublicPage[] = pageRows.map((p: any) => ({
        ...p, blocks: (blockRows || []).filter((b: any) => b.page_id === p.id),
      }));
      setPages(mapped);
      if (!activePageId && mapped.length > 0) setActivePageId(mapped[0].id);
    } catch (e: any) {
      console.error('Failed to load public pages:', e);
      toast.error('Failed to load pages');
    } finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { loadPages(); }, [loadPages]);

  // ── CRUD ──
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
    setActivePageId(created.id);
    toast.success('Page created');
  };

  const deletePage = async (id: string) => {
    const { error } = await (supabase as any).from('app_public_page').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setPages(prev => prev.filter(p => p.id !== id));
    if (activePageId === id) setActivePageId(pages.find(p => p.id !== id)?.id || null);
    toast.success('Page deleted');
  };

  const updatePage = async (id: string, field: string, value: any) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    await (supabase as any).from('app_public_page').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const addBlock = async (pageId: string, type: BlockType) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const newBlock = {
      page_id: pageId, type,
      content: type === 'text' ? 'Enter text here...' : type === 'button' ? 'Click Here' : null,
      order_index: page.blocks.length,
      style_height: type === 'spacer' ? '32px' : null,
    };
    const { data, error } = await (supabase as any).from('app_public_page_block').insert(newBlock).select().single();
    if (error) { toast.error('Failed to add block'); return; }
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: [...p.blocks, data] } : p));
    setEditingBlockId(data.id);
    setShowAddElement(false);
  };

  const deleteBlock = async (pageId: string, blockId: string) => {
    await (supabase as any).from('app_public_page_block').delete().eq('id', blockId);
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) } : p));
    if (editingBlockId === blockId) setEditingBlockId(null);
  };

  const updateBlock = async (pageId: string, blockId: string, field: string, value: any) => {
    setPages(prev => prev.map(p => p.id === pageId ? {
      ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b),
    } : p));
    await (supabase as any).from('app_public_page_block').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', blockId);
  };

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
    await Promise.all(newBlocks.map(b =>
      (supabase as any).from('app_public_page_block').update({ order_index: b.order_index }).eq('id', b.id)
    ));
  };

  const getBlockIcon = (type: string) => {
    const all = [...LAYOUT_BLOCK_TYPES, ...FUNCTION_BLOCK_TYPES];
    const found = all.find(b => b.type === type);
    return found ? <found.icon size={14} className="text-stone-500" /> : <FileText size={14} className="text-stone-500" />;
  };

  const getBlockLabel = (block: PageBlock) => {
    const all = [...LAYOUT_BLOCK_TYPES, ...FUNCTION_BLOCK_TYPES];
    return all.find(b => b.type === block.type)?.label || block.type;
  };

  // ── Block config panel ──
  const renderBlockConfig = (block: PageBlock) => (
    <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-[12px] font-semibold text-stone-600">Configure: {getBlockLabel(block)}</h5>
        <button onClick={() => setEditingBlockId(null)} className="p-1 hover:bg-stone-200 rounded"><X size={12} className="text-stone-400" /></button>
      </div>

      {block.type === 'text' && (
        <textarea value={block.content || ''} onChange={e => updateBlock(activePage!.id, block.id, 'content', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-none" rows={4} placeholder="Enter text content..." />
      )}

      {block.type === 'image' && (
        <div className="space-y-2">
          <input value={block.image_url || ''} onChange={e => updateBlock(activePage!.id, block.id, 'image_url', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300" placeholder="Image URL (https://...)" />
          <p className="text-[9px] text-stone-400">Paste an external URL or upload to storage.</p>
        </div>
      )}

      {block.type === 'button' && (
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Button Label</label>
            <input value={block.content || ''} onChange={e => updateBlock(activePage!.id, block.id, 'content', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg" placeholder="Click Here" />
          </div>
        </div>
      )}

      {block.type === 'spacer' && (
        <div>
          <label className="text-[11px] text-stone-400 block mb-1">Height</label>
          <input value={block.style_height || '32px'} onChange={e => updateBlock(activePage!.id, block.id, 'style_height', e.target.value)}
            className="w-32 px-3 py-1.5 text-sm border border-stone-200 rounded-lg" placeholder="32px" />
        </div>
      )}

      {block.type === 'start_date_picker' && (
        <div className="text-[11px] text-stone-500 bg-emerald-50 rounded-lg p-2 border border-emerald-100">
          This block renders a date picker for participants to set their custom study start date.
        </div>
      )}

      {block.type === 'signup_form' && (
        <div className="text-[11px] text-stone-500 bg-blue-50 rounded-lg p-2 border border-blue-100">
          This block renders a participant sign-up form with required fields.
        </div>
      )}

      {/* Style controls for text/image/button */}
      {['text', 'image', 'button'].includes(block.type) && (
        <details className="group">
          <summary className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5 py-1">
            <span className="transition-transform group-open:rotate-90">▸</span> Styling
          </summary>
          <div className="mt-2 space-y-2 pl-1">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-stone-400 block">Align</label>
                <select value={block.style_text_align || 'left'} onChange={e => updateBlock(activePage!.id, block.id, 'style_text_align', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-stone-200 rounded">
                  <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block">Size</label>
                <select value={block.style_font_size || '14px'} onChange={e => updateBlock(activePage!.id, block.id, 'style_font_size', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-stone-200 rounded">
                  <option value="12px">Small</option><option value="14px">Normal</option><option value="18px">Large</option><option value="24px">XL</option><option value="32px">2XL</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block">Weight</label>
                <select value={block.style_font_weight || 'normal'} onChange={e => updateBlock(activePage!.id, block.id, 'style_font_weight', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-stone-200 rounded">
                  <option value="normal">Normal</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block">Padding</label>
                <input value={block.style_padding || ''} onChange={e => updateBlock(activePage!.id, block.id, 'style_padding', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-stone-200 rounded" placeholder="8px" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-stone-400 block">Text Color</label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={block.style_text_color || '#44403c'} onChange={e => updateBlock(activePage!.id, block.id, 'style_text_color', e.target.value)}
                    className="w-6 h-6 rounded border border-stone-200 cursor-pointer" />
                  <input value={block.style_text_color || ''} onChange={e => updateBlock(activePage!.id, block.id, 'style_text_color', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded" placeholder="#44403c" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block">Background</label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={block.style_background || '#ffffff'} onChange={e => updateBlock(activePage!.id, block.id, 'style_background', e.target.value)}
                    className="w-6 h-6 rounded border border-stone-200 cursor-pointer" />
                  <input value={block.style_background || ''} onChange={e => updateBlock(activePage!.id, block.id, 'style_background', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded" placeholder="transparent" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-stone-400 block">Border Radius</label>
              <div className="flex gap-1">
                {['0', '4px', '8px', '12px', '999px'].map(r => (
                  <button key={r} onClick={() => updateBlock(activePage!.id, block.id, 'style_border_radius', r === '0' ? null : r)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      (block.style_border_radius || '0') === r || (!block.style_border_radius && r === '0')
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{r === '999px' ? 'Pill' : r}</button>
                ))}
              </div>
            </div>
          </div>
        </details>
      )}
    </div>
  );

  // ── Preview renderer ──
  const renderPreview = (page: PublicPage) => (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center gap-2">
        <Globe size={14} className="text-emerald-500" />
        <span className="text-xs font-medium text-stone-600">{page.title || 'Untitled Page'}</span>
        <span className="text-[9px] text-stone-400 ml-auto">/{page.slug}</span>
      </div>
      <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {page.title && <h1 className="text-xl font-bold text-stone-800 mb-1">{page.title}</h1>}
        {page.description && <p className="text-sm text-stone-500 mb-5">{page.description}</p>}
        {page.blocks.length === 0 && (
          <div className="text-center py-16 text-stone-300 text-sm">Add blocks to see a preview</div>
        )}
        {page.blocks.map(block => (
          <div key={block.id} className={`${editingBlockId === block.id ? 'ring-2 ring-emerald-300 rounded-lg' : ''}`}>
            {block.type === 'text' && (
              <div style={{
                textAlign: (block.style_text_align || 'left') as any,
                fontSize: block.style_font_size || '14px',
                fontWeight: block.style_font_weight || 'normal',
                padding: block.style_padding || '8px 0',
                color: block.style_text_color || '#44403c',
                background: block.style_background || 'transparent',
                borderRadius: block.style_border_radius || '0',
              }}>
                {(block.content || '').split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>{line}{i < (block.content || '').split('\n').length - 1 && <br />}</React.Fragment>
                ))}
              </div>
            )}
            {block.type === 'image' && block.image_url && (
              <div style={{ textAlign: (block.style_text_align || 'center') as any, padding: block.style_padding || '8px 0' }}>
                <img src={block.image_url} alt="" style={{ maxWidth: '100%', borderRadius: block.style_border_radius || '8px' }} className="inline-block" />
              </div>
            )}
            {block.type === 'image' && !block.image_url && (
              <div className="flex items-center justify-center h-24 bg-stone-50 border border-dashed border-stone-200 rounded-lg text-stone-300 text-xs my-2">
                <Image size={16} className="mr-1" /> No image URL set
              </div>
            )}
            {block.type === 'spacer' && <div style={{ height: block.style_height || '32px' }} />}
            {block.type === 'divider' && <hr className="border-stone-200 my-4" />}
            {block.type === 'button' && (
              <div style={{ textAlign: (block.style_text_align || 'center') as any, padding: block.style_padding || '12px 0' }}>
                <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  style={{ borderRadius: block.style_border_radius || '8px', background: block.style_background || undefined, color: block.style_text_color || undefined }}>
                  {block.content || 'Click Here'}
                </button>
              </div>
            )}
            {block.type === 'signup_form' && (
              <div className="my-3 p-4 border border-stone-200 rounded-xl bg-stone-50 space-y-3">
                <p className="text-xs font-semibold text-stone-600">Sign Up Form</p>
                <div className="space-y-2">
                  <div className="h-8 bg-white rounded-lg border border-stone-200 px-3 flex items-center text-xs text-stone-300">Name</div>
                  <div className="h-8 bg-white rounded-lg border border-stone-200 px-3 flex items-center text-xs text-stone-300">Email</div>
                  <div className="h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-xs text-white font-medium">Register</div>
                </div>
              </div>
            )}
            {block.type === 'start_date_picker' && (
              <div className="my-3 p-4 border border-stone-200 rounded-xl bg-stone-50 space-y-2">
                <p className="text-xs font-semibold text-stone-600">Set Study Start Date</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-500" />
                  <div className="h-8 flex-1 bg-white rounded-lg border border-stone-200 px-3 flex items-center text-xs text-stone-400">Select date...</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="text-stone-400 text-sm py-8 text-center">Loading public pages...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-stone-800">Public Pages</h3>
          <p className="text-[12px] text-stone-400 font-light mt-0.5">Build recruitment, introduction, and landing pages for your study</p>
        </div>
        <button onClick={addPage} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">
          <Plus size={14} /> Add Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm border border-dashed border-stone-200 rounded-xl">
          No public pages yet. Add one to get started.
        </div>
      ) : (
        <>
          {/* Page tabs — mirrors Layout builder tab bar */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {pages.map(page => (
              <div key={page.id}
                onClick={() => setActivePageId(page.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activePageId === page.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}>
                <Globe size={10} className={activePageId === page.id ? 'text-emerald-500' : 'text-stone-300'} />
                {page.title || 'Untitled'}
                {!page.enabled && <EyeOff size={10} className="text-stone-300 ml-0.5" />}
              </div>
            ))}
            <button onClick={addPage} className="p-1.5 rounded-lg hover:bg-white/80 transition-colors shrink-0">
              <Plus size={14} className="text-stone-400" />
            </button>
          </div>

          {activePage && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Page config + element list */}
              <div className="flex-1 space-y-3">
                {/* Page settings */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Page Settings</h5>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updatePage(activePage.id, 'enabled', !activePage.enabled)}
                        className="p-1.5 rounded-lg hover:bg-stone-100" title={activePage.enabled ? 'Disable' : 'Enable'}>
                        {activePage.enabled ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-stone-300" />}
                      </button>
                      {pages.length > 1 && (
                        <button onClick={() => deletePage(activePage.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-400 mb-1 block">Title</label>
                      <input value={activePage.title} onChange={e => updatePage(activePage.id, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[12px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 mb-1 block">Slug</label>
                      <input value={activePage.slug} onChange={e => updatePage(activePage.id, 'slug', e.target.value.replace(/[^a-z0-9-]/g, ''))}
                        className="w-full px-2.5 py-1.5 text-[12px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono" placeholder="recruitment-page" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 mb-1 block">Description</label>
                    <textarea value={activePage.description || ''} onChange={e => updatePage(activePage.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[12px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" rows={2} />
                  </div>
                  {activePage.slug && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-100">
                      <Globe size={12} className="text-stone-400 shrink-0" />
                      <code className="text-[11px] text-stone-500 flex-1 truncate">{window.location.origin}/easyresearch/page/{projectId}/{activePage.slug}</code>
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/easyresearch/page/${projectId}/${activePage.slug}`); toast.success('URL copied'); }}
                        className="shrink-0"><Copy size={12} className="text-emerald-600 hover:text-emerald-700" /></button>
                    </div>
                  )}
                </div>

                {/* Elements */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Elements</h5>
                    <button onClick={() => setShowAddElement(!showAddElement)}
                      className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-600 font-medium">
                      <Plus size={12} /> Add Element
                    </button>
                  </div>

                  {showAddElement && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3 max-h-[400px] overflow-y-auto">
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Layout Elements</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {LAYOUT_BLOCK_TYPES.map(bt => (
                          <button key={bt.type} onClick={() => addBlock(activePage.id, bt.type)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white transition-colors text-[10px] border border-transparent hover:border-stone-200">
                            <bt.icon size={16} className="text-stone-500" />
                            <span className="text-stone-500 font-medium">{bt.label}</span>
                          </button>
                        ))}
                      </div>

                      {questionnaires.filter(q => q.questionnaire_type === 'survey').length > 0 && (
                        <>
                          <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Questionnaires</p>
                          <div className="space-y-1">
                            {questionnaires.filter(q => q.questionnaire_type === 'survey').map(q => (
                              <button key={q.id} onClick={() => addBlock(activePage.id, 'text')}
                                className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-[11px] border border-transparent hover:bg-white hover:border-stone-200">
                                <FileText size={16} className="text-emerald-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-stone-700 font-medium truncate block">{q.title}</span>
                                  <span className="text-[9px] text-stone-400">{q.questions?.length || 0} questions</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {questionnaires.filter(q => ['consent', 'screening', 'profile', 'help', 'custom', 'onboarding'].includes(q.questionnaire_type)).length > 0 && (
                        <>
                          <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Forms & Components</p>
                          <div className="space-y-1">
                            {questionnaires.filter(q => ['consent', 'screening', 'profile', 'help', 'custom', 'onboarding'].includes(q.questionnaire_type)).map(q => {
                              const TypeIcon = q.questionnaire_type === 'consent' ? Shield : q.questionnaire_type === 'screening' ? ClipboardCheck : q.questionnaire_type === 'profile' ? User : q.questionnaire_type === 'help' ? HelpCircle : Layers;
                              const iconColor = q.questionnaire_type === 'consent' ? 'text-amber-500' : q.questionnaire_type === 'screening' ? 'text-orange-500' : q.questionnaire_type === 'profile' ? 'text-blue-500' : 'text-violet-500';
                              return (
                                <button key={q.id} onClick={() => addBlock(activePage.id, 'text')}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-[11px] border border-transparent hover:bg-white hover:border-stone-200">
                                  <TypeIcon size={16} className={`${iconColor} shrink-0`} />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-stone-700 font-medium truncate block">{q.title}</span>
                                    <span className="text-[9px] text-stone-400">{q.questionnaire_type} · {q.questions?.length || 0} fields</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}

                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Function Elements</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {FUNCTION_BLOCK_TYPES.map(bt => (
                          <button key={bt.type} onClick={() => addBlock(activePage.id, bt.type)}
                            className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white transition-colors text-[11px] border border-transparent hover:border-stone-200">
                            <bt.icon size={16} className="text-stone-500" />
                            <div>
                              <span className="text-stone-600 font-medium">{bt.label}</span>
                              <p className="text-[9px] text-stone-400">{bt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Block list */}
                  <div className="space-y-1 min-h-[60px]">
                    {activePage.blocks.length === 0 ? (
                      <div className="py-8 text-center text-[12px] text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                        Click "Add Element" above to add blocks
                      </div>
                    ) : (
                      activePage.blocks.map((block, bIdx) => (
                        <div key={block.id} className={`rounded-xl border bg-white transition-all ${editingBlockId === block.id ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-stone-100 hover:border-stone-200'}`}>
                          <div className={`flex items-center gap-2 px-3 py-2.5 group cursor-pointer transition-colors ${editingBlockId === block.id ? 'bg-emerald-50/30' : ''}`}
                            onClick={() => setEditingBlockId(editingBlockId === block.id ? null : block.id)}>
                            <GripVertical size={14} className="text-stone-300" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getBlockIcon(block.type)}
                                <span className="text-[12px] font-medium text-stone-700 truncate">{getBlockLabel(block)}</span>
                                {block.type === 'text' && block.content && (
                                  <span className="text-[9px] text-stone-400 truncate max-w-[120px]">{block.content.slice(0, 30)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={e => { e.stopPropagation(); moveBlock(activePage.id, block.id, 'up'); }} disabled={bIdx === 0}
                                className="p-1 hover:bg-stone-100 rounded disabled:opacity-30"><ArrowUp size={12} /></button>
                              <button onClick={e => { e.stopPropagation(); moveBlock(activePage.id, block.id, 'down'); }} disabled={bIdx === activePage.blocks.length - 1}
                                className="p-1 hover:bg-stone-100 rounded disabled:opacity-30"><ArrowDown size={12} /></button>
                              <button onClick={e => { e.stopPropagation(); setEditingBlockId(block.id); }} className="p-1 hover:bg-stone-100 rounded">
                                <Edit3 size={12} className="text-stone-400" /></button>
                              <button onClick={e => { e.stopPropagation(); deleteBlock(activePage.id, block.id); }} className="p-1 hover:bg-red-50 rounded">
                                <Trash2 size={12} className="text-red-400" /></button>
                            </div>
                          </div>
                          {editingBlockId === block.id && renderBlockConfig(block)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Live preview */}
              <div className="lg:w-[430px] shrink-0">
                <div className="sticky top-24">
                  {renderPreview(activePage)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicPageBuilder;
