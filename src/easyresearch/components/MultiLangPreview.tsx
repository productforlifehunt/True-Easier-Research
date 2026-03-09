import React, { useState, useMemo } from 'react';
import { Globe, Monitor, Smartphone, Eye, AlertCircle, CheckCircle2, Languages } from 'lucide-react';

interface Translation {
  questionId: string;
  questionText: string;
  translations: Record<string, string>;
  status: Record<string, 'complete' | 'partial' | 'missing'>;
}

interface Props {
  projectId: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

// Multi-language survey preview with side-by-side comparison
// 多语言调查预览，支持并排比较
const MultiLangPreview: React.FC<Props> = ({ projectId }) => {
  const [primaryLang, setPrimaryLang] = useState('en');
  const [compareLang, setCompareLang] = useState('zh');
  const [viewMode, setViewMode] = useState<'side_by_side' | 'single' | 'coverage'>('side_by_side');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Mock translation data / 模拟翻译数据
  const translations: Translation[] = useMemo(() => [
    {
      questionId: 'q1', questionText: 'How satisfied are you with our product?',
      translations: { en: 'How satisfied are you with our product?', zh: '您对我们的产品满意吗？', es: '¿Qué tan satisfecho está con nuestro producto?', fr: 'Êtes-vous satisfait de notre produit ?' },
      status: { en: 'complete', zh: 'complete', es: 'complete', fr: 'complete', de: 'missing', ja: 'missing', ko: 'missing', pt: 'missing', ar: 'missing', hi: 'missing' },
    },
    {
      questionId: 'q2', questionText: 'What features do you use most often?',
      translations: { en: 'What features do you use most often?', zh: '您最常使用哪些功能？', es: '¿Qué funciones utiliza con más frecuencia?' },
      status: { en: 'complete', zh: 'complete', es: 'complete', fr: 'partial', de: 'missing', ja: 'missing', ko: 'missing', pt: 'missing', ar: 'missing', hi: 'missing' },
    },
    {
      questionId: 'q3', questionText: 'Please describe your experience in detail.',
      translations: { en: 'Please describe your experience in detail.', zh: '请详细描述您的体验。' },
      status: { en: 'complete', zh: 'complete', es: 'missing', fr: 'missing', de: 'missing', ja: 'missing', ko: 'missing', pt: 'missing', ar: 'missing', hi: 'missing' },
    },
    {
      questionId: 'q4', questionText: 'Would you recommend us to a friend?',
      translations: { en: 'Would you recommend us to a friend?', zh: '您会向朋友推荐我们吗？', es: '¿Nos recomendaría a un amigo?', fr: 'Nous recommanderiez-vous à un ami ?', de: 'Würden Sie uns einem Freund empfehlen?' },
      status: { en: 'complete', zh: 'complete', es: 'complete', fr: 'complete', de: 'complete', ja: 'missing', ko: 'missing', pt: 'missing', ar: 'missing', hi: 'missing' },
    },
  ], []);

  // Coverage stats / 覆盖率统计
  const coverageStats = useMemo(() => {
    return LANGUAGES.map(lang => {
      const total = translations.length;
      const complete = translations.filter(t => t.status[lang.code] === 'complete').length;
      const partial = translations.filter(t => t.status[lang.code] === 'partial').length;
      return { ...lang, complete, partial, missing: total - complete - partial, total, pct: Math.round((complete / total) * 100) };
    });
  }, [translations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Globe size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Multi-Language Preview / 多语言预览</h2>
            <p className="text-xs text-stone-500">Preview and compare translations across languages / 预览和比较不同语言的翻译</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['side_by_side', 'single', 'coverage'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${viewMode === mode ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {mode === 'side_by_side' ? 'Compare / 比较' : mode === 'single' ? 'Single / 单语' : 'Coverage / 覆盖'}
            </button>
          ))}
        </div>
      </div>

      {/* Language selectors / 语言选择器 */}
      {viewMode !== 'coverage' && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Primary / 主语言:</span>
            <select value={primaryLang} onChange={e => setPrimaryLang(e.target.value)}
              className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          {viewMode === 'side_by_side' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Compare / 对比:</span>
              <select value={compareLang} onChange={e => setCompareLang(e.target.value)}
                className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-emerald-100 text-emerald-600' : 'text-stone-400'}`}>
              <Monitor size={16} />
            </button>
            <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-emerald-100 text-emerald-600' : 'text-stone-400'}`}>
              <Smartphone size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Coverage view / 覆盖率视图 */}
      {viewMode === 'coverage' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coverageStats.map(lang => (
            <div key={lang.code} className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-stone-700">{lang.flag} {lang.label}</span>
                <span className={`text-xs font-bold ${lang.pct === 100 ? 'text-emerald-600' : lang.pct > 50 ? 'text-amber-600' : 'text-red-500'}`}>{lang.pct}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${lang.pct}%`,
                  backgroundColor: lang.pct === 100 ? '#10b981' : lang.pct > 50 ? '#f59e0b' : '#ef4444',
                }} />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-stone-400">
                <span className="flex items-center gap-0.5"><CheckCircle2 size={10} className="text-emerald-500" /> {lang.complete}</span>
                <span className="flex items-center gap-0.5"><AlertCircle size={10} className="text-amber-500" /> {lang.partial}</span>
                <span>{lang.missing} missing</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side-by-side preview / 并排预览 */}
      {viewMode === 'side_by_side' && (
        <div className={`grid gap-4 ${device === 'mobile' ? 'max-w-2xl mx-auto' : ''}`} style={{ gridTemplateColumns: device === 'mobile' ? '1fr 1fr' : '1fr 1fr' }}>
          {[primaryLang, compareLang].map(lang => {
            const langInfo = LANGUAGES.find(l => l.code === lang)!;
            return (
              <div key={lang} className={`bg-white rounded-2xl border border-stone-200 overflow-hidden ${device === 'mobile' ? 'max-w-[320px] mx-auto' : ''}`}>
                <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center gap-2">
                  <span className="text-sm">{langInfo.flag}</span>
                  <span className="text-xs font-semibold text-stone-600">{langInfo.label}</span>
                </div>
                <div className="p-4 space-y-4">
                  {translations.map((t, i) => (
                    <div key={t.questionId} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400">Q{i + 1}</span>
                        {t.status[lang] === 'complete' && <CheckCircle2 size={10} className="text-emerald-500" />}
                        {t.status[lang] === 'partial' && <AlertCircle size={10} className="text-amber-500" />}
                        {t.status[lang] === 'missing' && <AlertCircle size={10} className="text-red-400" />}
                      </div>
                      <p className={`text-sm ${t.translations[lang] ? 'text-stone-700' : 'text-red-400 italic'}`}>
                        {t.translations[lang] || `[Missing ${langInfo.label} translation]`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single language preview / 单语言预览 */}
      {viewMode === 'single' && (
        <div className={`bg-white rounded-2xl border border-stone-200 overflow-hidden mx-auto ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-2xl'}`}>
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center gap-2">
            <span className="text-sm">{LANGUAGES.find(l => l.code === primaryLang)?.flag}</span>
            <span className="text-xs font-semibold text-stone-600">{LANGUAGES.find(l => l.code === primaryLang)?.label}</span>
            <Eye size={12} className="text-stone-400 ml-auto" />
          </div>
          <div className="p-6 space-y-6">
            {translations.map((t, i) => (
              <div key={t.questionId} className="space-y-2">
                <p className="text-sm font-medium text-stone-800">
                  {i + 1}. {t.translations[primaryLang] || t.questionText}
                </p>
                {/* Mock answer UI / 模拟答题UI */}
                <div className="flex gap-2">
                  {['1', '2', '3', '4', '5'].map(n => (
                    <button key={n} className="w-10 h-10 rounded-lg border border-stone-200 text-sm text-stone-500 hover:bg-emerald-50 hover:border-emerald-300">{n}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLangPreview;
