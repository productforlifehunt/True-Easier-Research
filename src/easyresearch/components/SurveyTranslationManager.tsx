import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Globe, Plus, Check, AlertTriangle, Copy, Languages, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Multi-Language Survey Translation Manager
// 多语言调查翻译管理器
interface Props {
  projectId: string;
  questions: any[];
  onQuestionsUpdate: (questions: any[]) => void;
}

interface Translation {
  locale: string;
  question_text: string;
  question_description?: string;
  options?: { id: string; text: string }[];
}

const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
];

const OPENROUTER_KEY = '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';

const SurveyTranslationManager: React.FC<Props> = ({ projectId, questions, onQuestionsUpdate }) => {
  const [activeLocales, setActiveLocales] = useState<string[]>(['en']);
  const [selectedLocale, setSelectedLocale] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, Translation>>>({});
  // translations[questionId][locale] = Translation
  const [translating, setTranslating] = useState(false);
  const [showAddLocale, setShowAddLocale] = useState(false);

  // Load existing translations from question_config / 从 question_config 加载现有翻译
  useEffect(() => {
    const existing: Record<string, Record<string, Translation>> = {};
    const locales = new Set<string>(['en']);

    questions.forEach((q: any) => {
      existing[q.id] = existing[q.id] || {};
      // Base English
      existing[q.id]['en'] = {
        locale: 'en',
        question_text: q.question_text || '',
        question_description: q.question_description || '',
        options: q.options?.map((o: any) => ({ id: o.id, text: o.option_text })),
      };
      // Load translations from config
      const trns = q.question_config?.translations;
      if (trns && typeof trns === 'object') {
        Object.entries(trns).forEach(([locale, data]: [string, any]) => {
          locales.add(locale);
          existing[q.id][locale] = {
            locale,
            question_text: data.question_text || '',
            question_description: data.question_description || '',
            options: data.options,
          };
        });
      }
    });

    setTranslations(existing);
    setActiveLocales([...locales]);
  }, [questions]);

  // Translation coverage stats / 翻译覆盖率统计
  const coverageStats = useMemo(() => {
    const stats: Record<string, { total: number; translated: number }> = {};
    const translatableQuestions = questions.filter((q: any) => 
      !['section_header', 'divider', 'image_block'].includes(q.question_type)
    );
    
    activeLocales.forEach(locale => {
      if (locale === 'en') return;
      let translated = 0;
      translatableQuestions.forEach((q: any) => {
        if (translations[q.id]?.[locale]?.question_text) translated++;
      });
      stats[locale] = { total: translatableQuestions.length, translated };
    });
    return stats;
  }, [translations, activeLocales, questions]);

  const addLocale = (code: string) => {
    if (!activeLocales.includes(code)) {
      setActiveLocales(prev => [...prev, code]);
      setSelectedLocale(code);
    }
    setShowAddLocale(false);
  };

  const updateTranslation = (questionId: string, locale: string, field: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [locale]: {
          ...(prev[questionId]?.[locale] || { locale, question_text: '', question_description: '' }),
          [field]: value,
        },
      },
    }));
  };

  const updateOptionTranslation = (questionId: string, locale: string, optionId: string, text: string) => {
    setTranslations(prev => {
      const existing = prev[questionId]?.[locale] || { locale, question_text: '', options: [] };
      const options = (existing.options || []).map(o => o.id === optionId ? { ...o, text } : o);
      if (!options.find(o => o.id === optionId)) {
        options.push({ id: optionId, text });
      }
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [locale]: { ...existing, options },
        },
      };
    });
  };

  // AI auto-translate / AI 自动翻译
  const autoTranslate = async (targetLocale: string) => {
    const locale = SUPPORTED_LOCALES.find(l => l.code === targetLocale);
    if (!locale) return;

    setTranslating(true);
    try {
      const toTranslate = questions
        .filter((q: any) => !['section_header', 'divider', 'image_block'].includes(q.question_type))
        .filter((q: any) => !translations[q.id]?.[targetLocale]?.question_text)
        .slice(0, 50); // Batch limit

      if (toTranslate.length === 0) {
        toast('All questions already translated / 所有问题已翻译');
        setTranslating(false);
        return;
      }

      const items = toTranslate.map((q: any) => ({
        id: q.id,
        text: q.question_text,
        description: q.question_description || '',
        options: q.options?.map((o: any) => ({ id: o.id, text: o.option_text })) || [],
      }));

      const prompt = `Translate these survey questions to ${locale.name} (${locale.code}). Maintain the same meaning and tone. For survey questions, keep translations natural and conversational.

Input:
${JSON.stringify(items, null, 2)}

Respond with a JSON array matching the input structure with translated text/description/options. ONLY valid JSON, no markdown.`;

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const translated = JSON.parse(jsonMatch[0]);
        const newTranslations = { ...translations };
        
        translated.forEach((item: any) => {
          if (item.id) {
            newTranslations[item.id] = newTranslations[item.id] || {};
            newTranslations[item.id][targetLocale] = {
              locale: targetLocale,
              question_text: item.text || '',
              question_description: item.description || '',
              options: item.options,
            };
          }
        });

        setTranslations(newTranslations);
        toast.success(`Translated ${translated.length} questions to ${locale.name} / 已翻译 ${translated.length} 个问题`);
      }
    } catch (e: any) {
      toast.error('Translation failed / 翻译失败: ' + e.message);
    } finally {
      setTranslating(false);
    }
  };

  // Save translations back to question_config / 保存翻译到 question_config
  const saveTranslations = async () => {
    try {
      const updates = questions.map((q: any) => {
        const qTranslations: Record<string, any> = {};
        activeLocales.forEach(locale => {
          if (locale === 'en') return;
          const t = translations[q.id]?.[locale];
          if (t?.question_text) {
            qTranslations[locale] = {
              question_text: t.question_text,
              question_description: t.question_description || '',
              options: t.options,
            };
          }
        });

        return {
          ...q,
          question_config: {
            ...(q.question_config || {}),
            translations: qTranslations,
            active_locales: activeLocales,
          },
        };
      });

      // Batch update to DB
      for (const q of updates) {
        await supabase.from('question').update({
          question_config: q.question_config,
        }).eq('id', q.id);
      }

      onQuestionsUpdate(updates);
      toast.success('Translations saved / 翻译已保存');
    } catch (e: any) {
      toast.error('Save failed / 保存失败: ' + e.message);
    }
  };

  const translatableQuestions = questions.filter((q: any) => 
    !['section_header', 'divider', 'image_block'].includes(q.question_type)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Survey Translations / 调查翻译
        </h3>
        <button
          onClick={saveTranslations}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Save All / 保存全部
        </button>
      </div>

      {/* Locale tabs / 语言标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeLocales.map(code => {
          const locale = SUPPORTED_LOCALES.find(l => l.code === code);
          const stats = coverageStats[code];
          return (
            <button
              key={code}
              onClick={() => setSelectedLocale(code)}
              className={`px-3 py-1.5 text-sm rounded-lg border flex items-center gap-2 transition ${
                selectedLocale === code ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <span>{locale?.flag || '🌐'}</span>
              <span>{locale?.name || code}</span>
              {stats && (
                <span className={`text-xs ${stats.translated === stats.total ? 'text-green-600' : 'text-amber-600'}`}>
                  {stats.translated}/{stats.total}
                </span>
              )}
            </button>
          );
        })}
        <div className="relative">
          <button
            onClick={() => setShowAddLocale(!showAddLocale)}
            className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted/30 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Language / 添加语言
          </button>
          {showAddLocale && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto w-48">
              {SUPPORTED_LOCALES.filter(l => !activeLocales.includes(l.code)).map(l => (
                <button
                  key={l.code}
                  onClick={() => addLocale(l.code)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted/30 flex items-center gap-2 text-foreground"
                >
                  <span>{l.flag}</span> {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedLocale !== 'en' && (
          <button
            onClick={() => autoTranslate(selectedLocale)}
            disabled={translating}
            className="ml-auto px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI Translate All / AI 翻译全部
          </button>
        )}
      </div>

      {/* Translation grid / 翻译网格 */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          {translatableQuestions.map((q: any, idx: number) => {
            const enText = q.question_text || '';
            const localeTranslation = translations[q.id]?.[selectedLocale];
            const hasTranslation = !!localeTranslation?.question_text;

            return (
              <div key={q.id} className="border-b border-border last:border-b-0">
                <div className="grid grid-cols-2 divide-x divide-border">
                  {/* Source (English) / 源文（英文） */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">Q{idx + 1}</span>
                      <span className="text-[10px] text-muted-foreground">{q.question_type}</span>
                    </div>
                    <div className="text-sm text-foreground">{enText}</div>
                    {q.question_description && (
                      <div className="text-xs text-muted-foreground mt-1">{q.question_description}</div>
                    )}
                    {q.options?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((o: any) => (
                          <div key={o.id} className="text-xs text-muted-foreground pl-3 border-l-2 border-border">
                            {o.option_text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Target locale / 目标语言 */}
                  <div className="p-3">
                    {selectedLocale === 'en' ? (
                      <div className="text-xs text-muted-foreground italic">Source language / 源语言</div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 mb-1">
                          {hasTranslation ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {hasTranslation ? 'Translated / 已翻译' : 'Missing / 缺失'}
                          </span>
                        </div>
                        <textarea
                          value={localeTranslation?.question_text || ''}
                          onChange={e => updateTranslation(q.id, selectedLocale, 'question_text', e.target.value)}
                          placeholder={`Translate: "${enText.slice(0, 60)}..."`}
                          rows={2}
                          className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background text-foreground resize-none"
                        />
                        {q.question_description && (
                          <input
                            value={localeTranslation?.question_description || ''}
                            onChange={e => updateTranslation(q.id, selectedLocale, 'question_description', e.target.value)}
                            placeholder="Description translation..."
                            className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground"
                          />
                        )}
                        {q.options?.length > 0 && (
                          <div className="space-y-1">
                            {q.options.map((o: any) => (
                              <div key={o.id} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-20 truncate">{o.option_text}</span>
                                <span className="text-muted-foreground">→</span>
                                <input
                                  value={localeTranslation?.options?.find((t: any) => t.id === o.id)?.text || ''}
                                  onChange={e => updateOptionTranslation(q.id, selectedLocale, o.id, e.target.value)}
                                  placeholder={o.option_text}
                                  className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {translatableQuestions.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No questions to translate / 没有可翻译的问题
        </div>
      )}
    </div>
  );
};

export default SurveyTranslationManager;
