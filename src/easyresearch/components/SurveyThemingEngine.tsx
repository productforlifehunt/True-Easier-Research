import React, { useState } from 'react';
import { Palette, Type, Image, Monitor, Smartphone, Eye, RotateCcw, Sparkles, Sun, Moon } from 'lucide-react';

// Survey Theming Engine — Brand customization for participant-facing surveys
// 调查主题引擎 — 面向参与者的品牌自定义

interface ThemeConfig {
  // Colors / 颜色
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  errorColor: string;
  successColor: string;
  // Typography / 字体
  fontFamily: string;
  headingFont: string;
  fontSize: 'small' | 'medium' | 'large';
  // Layout / 布局
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  cardStyle: 'flat' | 'bordered' | 'elevated' | 'glass';
  spacing: 'compact' | 'comfortable' | 'spacious';
  maxWidth: 'narrow' | 'medium' | 'wide' | 'full';
  // Progress bar / 进度条
  progressStyle: 'bar' | 'steps' | 'percentage' | 'dots' | 'none';
  progressPosition: 'top' | 'bottom' | 'sidebar';
  // Branding / 品牌
  logoUrl: string;
  logoPosition: 'left' | 'center' | 'hidden';
  faviconUrl: string;
  coverImageUrl: string;
  // Dark mode / 暗色模式
  darkMode: boolean;
  darkPrimaryColor: string;
  darkBackgroundColor: string;
  darkSurfaceColor: string;
  darkTextColor: string;
  // Advanced / 高级
  customCSS: string;
  animationEnabled: boolean;
  showPoweredBy: boolean;
  redirectUrl: string;
  completionMessage: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#10b981',
  secondaryColor: '#06b6d4',
  accentColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  surfaceColor: '#f9fafb',
  textColor: '#1f2937',
  textSecondaryColor: '#6b7280',
  errorColor: '#ef4444',
  successColor: '#22c55e',
  fontFamily: 'Inter',
  headingFont: 'Inter',
  fontSize: 'medium',
  borderRadius: 'medium',
  cardStyle: 'elevated',
  spacing: 'comfortable',
  maxWidth: 'medium',
  progressStyle: 'bar',
  progressPosition: 'top',
  logoUrl: '',
  logoPosition: 'center',
  faviconUrl: '',
  coverImageUrl: '',
  darkMode: false,
  darkPrimaryColor: '#34d399',
  darkBackgroundColor: '#111827',
  darkSurfaceColor: '#1f2937',
  darkTextColor: '#f9fafb',
  customCSS: '',
  animationEnabled: true,
  showPoweredBy: true,
  redirectUrl: '',
  completionMessage: 'Thank you for your response! / 感谢您的回复！',
};

const PRESET_THEMES: { name: string; nameZh: string; theme: Partial<ThemeConfig> }[] = [
  { name: 'Professional', nameZh: '专业', theme: { primaryColor: '#2563eb', backgroundColor: '#ffffff', surfaceColor: '#f8fafc', cardStyle: 'bordered', borderRadius: 'small', fontFamily: 'Inter' } },
  { name: 'Warm & Friendly', nameZh: '温暖友好', theme: { primaryColor: '#f59e0b', backgroundColor: '#fffbeb', surfaceColor: '#fef3c7', cardStyle: 'elevated', borderRadius: 'large', fontFamily: 'Nunito' } },
  { name: 'Clinical', nameZh: '临床', theme: { primaryColor: '#0891b2', backgroundColor: '#f0fdfa', surfaceColor: '#ffffff', cardStyle: 'flat', borderRadius: 'small', fontFamily: 'Source Sans Pro' } },
  { name: 'Dark Modern', nameZh: '暗黑现代', theme: { primaryColor: '#a78bfa', backgroundColor: '#0f172a', surfaceColor: '#1e293b', textColor: '#f1f5f9', cardStyle: 'glass', borderRadius: 'medium', fontFamily: 'DM Sans' } },
  { name: 'Minimalist', nameZh: '极简', theme: { primaryColor: '#1f2937', backgroundColor: '#ffffff', surfaceColor: '#ffffff', cardStyle: 'flat', borderRadius: 'none', fontFamily: 'Inter', spacing: 'spacious' } },
  { name: 'Playful', nameZh: '活泼', theme: { primaryColor: '#ec4899', secondaryColor: '#8b5cf6', backgroundColor: '#fdf2f8', surfaceColor: '#fce7f3', cardStyle: 'elevated', borderRadius: 'full', fontFamily: 'Poppins', animationEnabled: true } },
];

const FONT_OPTIONS = ['Inter', 'DM Sans', 'Nunito', 'Poppins', 'Source Sans Pro', 'Lato', 'Roboto', 'Open Sans', 'Merriweather', 'Playfair Display', 'Noto Sans SC', 'Noto Serif SC'];

interface Props {
  projectId: string;
  theme?: Partial<ThemeConfig>;
  onUpdate: (theme: ThemeConfig) => void;
}

const SurveyThemingEngine: React.FC<Props> = ({ projectId, theme: initialTheme, onUpdate }) => {
  const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME, ...initialTheme });
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'layout' | 'branding' | 'dark' | 'advanced'>('colors');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const next = { ...theme, ...updates };
    setTheme(next);
    onUpdate(next);
  };

  const applyPreset = (preset: Partial<ThemeConfig>) => {
    updateTheme(preset);
  };

  const ColorPicker = ({ label, labelZh, value, field }: { label: string; labelZh: string; value: string; field: keyof ThemeConfig }) => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input type="color" value={value} onChange={e => updateTheme({ [field]: e.target.value })}
          className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200" />
      </div>
      <div className="flex-1">
        <span className="text-xs font-medium text-stone-700">{label}</span>
        <span className="text-[10px] text-stone-400 ml-1">/ {labelZh}</span>
      </div>
      <input type="text" value={value} onChange={e => updateTheme({ [field]: e.target.value })}
        className="w-24 text-xs px-2 py-1 border border-stone-200 rounded-md font-mono" />
    </div>
  );

  const sections = [
    { id: 'colors' as const, icon: Palette, label: 'Colors / 颜色' },
    { id: 'typography' as const, icon: Type, label: 'Typography / 字体' },
    { id: 'layout' as const, icon: Monitor, label: 'Layout / 布局' },
    { id: 'branding' as const, icon: Image, label: 'Branding / 品牌' },
    { id: 'dark' as const, icon: Moon, label: 'Dark Mode / 暗色' },
    { id: 'advanced' as const, icon: Sparkles, label: 'Advanced / 高级' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">Survey Theming / 调查主题</h2>
        <button onClick={() => { setTheme(DEFAULT_THEME); onUpdate(DEFAULT_THEME); }}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-all">
          <RotateCcw size={12} /> Reset / 重置
        </button>
      </div>

      {/* Preset Themes / 预设主题 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Presets / 预设主题</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_THEMES.map(p => (
            <button key={p.name} onClick={() => applyPreset(p.theme)}
              className="p-2 rounded-lg border border-stone-200 hover:border-stone-400 transition-all text-center group">
              <div className="flex gap-0.5 justify-center mb-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.theme.primaryColor }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.theme.backgroundColor || '#fff' }} />
              </div>
              <span className="text-[10px] font-medium text-stone-600 group-hover:text-stone-800">{p.name}</span>
              <br />
              <span className="text-[9px] text-stone-400">{p.nameZh}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left: Settings / 左侧设置 */}
        <div className="w-72 shrink-0 space-y-2">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSection === s.id ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-stone-500 hover:bg-stone-50'
              }`}>
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        {/* Right: Editor + Preview / 右侧编辑器 + 预览 */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-4">
            {activeSection === 'colors' && (
              <div className="space-y-3">
                <ColorPicker label="Primary" labelZh="主色" value={theme.primaryColor} field="primaryColor" />
                <ColorPicker label="Secondary" labelZh="辅色" value={theme.secondaryColor} field="secondaryColor" />
                <ColorPicker label="Accent" labelZh="强调色" value={theme.accentColor} field="accentColor" />
                <ColorPicker label="Background" labelZh="背景色" value={theme.backgroundColor} field="backgroundColor" />
                <ColorPicker label="Surface" labelZh="表面色" value={theme.surfaceColor} field="surfaceColor" />
                <ColorPicker label="Text" labelZh="文字色" value={theme.textColor} field="textColor" />
                <ColorPicker label="Text Secondary" labelZh="辅助文字" value={theme.textSecondaryColor} field="textSecondaryColor" />
                <ColorPicker label="Error" labelZh="错误" value={theme.errorColor} field="errorColor" />
                <ColorPicker label="Success" labelZh="成功" value={theme.successColor} field="successColor" />
              </div>
            )}

            {activeSection === 'typography' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Body Font / 正文字体</label>
                  <select value={theme.fontFamily} onChange={e => updateTheme({ fontFamily: e.target.value })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                    {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Heading Font / 标题字体</label>
                  <select value={theme.headingFont} onChange={e => updateTheme({ headingFont: e.target.value })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                    {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Font Size / 字号</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map(s => (
                      <button key={s} onClick={() => updateTheme({ fontSize: s })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                          theme.fontSize === s ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>
                        {s === 'small' ? 'Small / 小' : s === 'medium' ? 'Medium / 中' : 'Large / 大'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'layout' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Border Radius / 圆角</label>
                  <div className="flex gap-1.5">
                    {(['none', 'small', 'medium', 'large', 'full'] as const).map(r => (
                      <button key={r} onClick={() => updateTheme({ borderRadius: r })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                          theme.borderRadius === r ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Card Style / 卡片样式</label>
                  <div className="flex gap-1.5">
                    {(['flat', 'bordered', 'elevated', 'glass'] as const).map(c => (
                      <button key={c} onClick={() => updateTheme({ cardStyle: c })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                          theme.cardStyle === c ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Spacing / 间距</label>
                  <div className="flex gap-2">
                    {(['compact', 'comfortable', 'spacious'] as const).map(s => (
                      <button key={s} onClick={() => updateTheme({ spacing: s })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                          theme.spacing === s ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Max Width / 最大宽度</label>
                  <div className="flex gap-2">
                    {(['narrow', 'medium', 'wide', 'full'] as const).map(w => (
                      <button key={w} onClick={() => updateTheme({ maxWidth: w })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                          theme.maxWidth === w ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>{w}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Progress Style / 进度样式</label>
                  <div className="flex gap-1.5">
                    {(['bar', 'steps', 'percentage', 'dots', 'none'] as const).map(p => (
                      <button key={p} onClick={() => updateTheme({ progressStyle: p })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                          theme.progressStyle === p ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'branding' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Logo URL / 标志链接</label>
                  <input type="text" value={theme.logoUrl} onChange={e => updateTheme({ logoUrl: e.target.value })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Logo Position / 标志位置</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'hidden'] as const).map(p => (
                      <button key={p} onClick={() => updateTheme({ logoPosition: p })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                          theme.logoPosition === p ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'
                        }`}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Cover Image / 封面图片</label>
                  <input type="text" value={theme.coverImageUrl} onChange={e => updateTheme({ coverImageUrl: e.target.value })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Completion Message / 完成消息</label>
                  <textarea value={theme.completionMessage} onChange={e => updateTheme({ completionMessage: e.target.value })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 h-20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Redirect URL / 完成跳转</label>
                  <input type="text" value={theme.redirectUrl} onChange={e => updateTheme({ redirectUrl: e.target.value })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" placeholder="https://..." />
                </div>
              </div>
            )}

            {activeSection === 'dark' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={theme.darkMode} onChange={e => updateTheme({ darkMode: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-medium text-stone-700">Enable Dark Mode / 启用暗色模式</span>
                </label>
                {theme.darkMode && (
                  <>
                    <ColorPicker label="Dark Primary" labelZh="暗色主色" value={theme.darkPrimaryColor} field="darkPrimaryColor" />
                    <ColorPicker label="Dark Background" labelZh="暗色背景" value={theme.darkBackgroundColor} field="darkBackgroundColor" />
                    <ColorPicker label="Dark Surface" labelZh="暗色表面" value={theme.darkSurfaceColor} field="darkSurfaceColor" />
                    <ColorPicker label="Dark Text" labelZh="暗色文字" value={theme.darkTextColor} field="darkTextColor" />
                  </>
                )}
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={theme.animationEnabled} onChange={e => updateTheme({ animationEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-medium text-stone-700">Animations / 动画效果</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={theme.showPoweredBy} onChange={e => updateTheme({ showPoweredBy: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-medium text-stone-700">Show "Powered by" / 显示品牌水印</span>
                </label>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Custom CSS / 自定义样式</label>
                  <textarea value={theme.customCSS} onChange={e => updateTheme({ customCSS: e.target.value })}
                    className="w-full text-xs font-mono border border-stone-200 rounded-lg px-3 py-2 h-32"
                    placeholder=".survey-container { ... }" />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview / 实时预览 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5"><Eye size={13} /> Preview / 预览</span>
              <div className="flex gap-1">
                <button onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'desktop' ? 'bg-stone-100 text-stone-700' : 'text-stone-400'}`}>
                  <Monitor size={14} />
                </button>
                <button onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'mobile' ? 'bg-stone-100 text-stone-700' : 'text-stone-400'}`}>
                  <Smartphone size={14} />
                </button>
              </div>
            </div>
            <div className={`mx-auto border border-stone-200 rounded-xl overflow-hidden ${previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-2xl'}`}
              style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily, color: theme.textColor }}>
              {/* Header / 头部 */}
              {theme.logoUrl && (
                <div className={`p-4 flex ${theme.logoPosition === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <div className="w-24 h-8 rounded" style={{ backgroundColor: theme.primaryColor, opacity: 0.2 }} />
                </div>
              )}
              {theme.progressStyle !== 'none' && (
                <div className="px-4 pt-2">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceColor }}>
                    <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                  </div>
                </div>
              )}
              {/* Question card / 问题卡片 */}
              <div className="p-4 space-y-3">
                <div className={`p-4 ${
                  theme.cardStyle === 'elevated' ? 'shadow-md' :
                  theme.cardStyle === 'bordered' ? 'border' :
                  theme.cardStyle === 'glass' ? 'bg-white/30 backdrop-blur-sm border border-white/20' : ''
                }`} style={{
                  backgroundColor: theme.cardStyle === 'glass' ? 'transparent' : theme.surfaceColor,
                  borderRadius: theme.borderRadius === 'none' ? 0 : theme.borderRadius === 'small' ? 4 : theme.borderRadius === 'medium' ? 8 : theme.borderRadius === 'large' ? 16 : 24,
                  borderColor: theme.textSecondaryColor + '20',
                }}>
                  <p className="text-sm font-semibold mb-2" style={{ fontFamily: theme.headingFont }}>How satisfied are you? / 您满意吗？</p>
                  <p className="text-xs mb-3" style={{ color: theme.textSecondaryColor }}>Rate on a scale of 1-5 / 请从1-5打分</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} className="w-8 h-8 rounded-lg text-xs font-semibold text-white flex items-center justify-center"
                        style={{ backgroundColor: n === 4 ? theme.primaryColor : theme.surfaceColor, color: n === 4 ? '#fff' : theme.textColor }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2.5 text-sm font-semibold text-white rounded-lg"
                  style={{ backgroundColor: theme.primaryColor, borderRadius: theme.borderRadius === 'none' ? 0 : theme.borderRadius === 'small' ? 4 : theme.borderRadius === 'full' ? 24 : 8 }}>
                  Next / 下一步
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyThemingEngine;
