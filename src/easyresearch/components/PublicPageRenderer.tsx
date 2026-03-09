import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Public-facing renderer for researcher-built public pages.
 * Route: /easyresearch/page/:projectId/:slug
 * 公开页面渲染器，用于展示研究员构建的招募/介绍页面。
 */
const PublicPageRenderer: React.FC = () => {
  const { projectId, slug } = useParams<{ projectId: string; slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !slug) return;
    (async () => {
      try {
        // Fetch page / 获取页面
        const { data: pageData, error: pErr } = await (supabase as any)
          .from('app_public_page')
          .select('*')
          .eq('project_id', projectId)
          .eq('slug', slug)
          .eq('enabled', true)
          .single();
        if (pErr || !pageData) { setError('Page not found / 页面未找到'); setLoading(false); return; }
        setPage(pageData);

        // Fetch blocks / 获取块
        const { data: blockData } = await (supabase as any)
          .from('app_public_page_block')
          .select('*')
          .eq('page_id', pageData.id)
          .order('order_index');
        setBlocks(blockData || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, slug]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !page) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-stone-600 mb-1">Page Not Found</h2>
        <p className="text-sm text-stone-400">{error || 'This page does not exist or is disabled. / 此页面不存在或已禁用。'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page title / 页面标题 */}
      {page.title && (
        <h1 className="text-2xl font-bold text-stone-800 mb-2">{page.title}</h1>
      )}
      {page.description && (
        <p className="text-sm text-stone-500 mb-6">{page.description}</p>
      )}

      {/* Render blocks / 渲染块 */}
      <div className="space-y-0">
        {blocks.map(block => (
          <div key={block.id}>
            {block.type === 'text' && (
              <div
                style={{
                  textAlign: (block.style_text_align || 'left') as any,
                  fontSize: block.style_font_size || '14px',
                  fontWeight: block.style_font_weight || 'normal',
                  padding: block.style_padding || '8px 0',
                  color: block.style_text_color || '#44403c',
                  background: block.style_background || 'transparent',
                  borderRadius: block.style_border_radius || '0',
                }}
              >
                {/* Support line breaks / 支持换行 */}
                {(block.content || '').split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < (block.content || '').split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {block.type === 'image' && block.image_url && (
              <div style={{ textAlign: (block.style_text_align || 'center') as any, padding: block.style_padding || '8px 0' }}>
                <img
                  src={block.image_url}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    borderRadius: block.style_border_radius || '8px',
                    height: block.style_height || 'auto',
                  }}
                  className="inline-block"
                />
              </div>
            )}

            {block.type === 'spacer' && (
              <div style={{ height: block.style_height || '32px' }} />
            )}

            {block.type === 'divider' && (
              <hr className="border-stone-200 my-4" />
            )}
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-12 text-stone-300 text-sm">
          This page has no content yet. / 此页面尚无内容。
        </div>
      )}
    </div>
  );
};

export default PublicPageRenderer;
