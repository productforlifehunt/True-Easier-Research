import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Globe, Plus, Check, AlertTriangle, Copy, Languages, Loader2, Sparkles } from 'lucide-react';
import { bToast } from '../utils/bilingualToast';

// Multi-Language Survey Translation Manager
// 多语言调查翻译管理器
// All AI calls go through edge function — NO direct OpenRouter calls from frontend
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
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'zh', name: '中文', flag: 'ZH' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'ja', name: '日本語', flag: 'JA' },
  { code: 'ko', name: '한국어', flag: 'KO' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'ar', name: 'العربية', flag: 'AR' },
  { code: 'hi', name: 'हिन्दी', flag: 'HI' },
  { code: 'ru', name: 'Русский', flag: 'RU' },
  { code: 'th', name: 'ไทย', flag: 'TH' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'VI' },
  { code: 'ms', name: 'Bahasa Melayu', flag: 'MS' },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SurveyTranslationManager: React.FC<Props> = ({ projectId, questions, onQuestionsUpdate }) => {
  const [activeLocales, setActiveLocales] = useState<string[]>(['en']);
  const [selectedLocale, setSelectedLocale] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, Translation>>>({});
  const [translating, setTranslating] = useState(false);
  const [showAddLocale, setShowAddLocale] = useState(false);

  // Load existing translations from question_config / 从 question_config 加载现有翻译
  useEffect(() => {
    const existing: Record<string, Record<string, Translation>> = {};
    const localeSet = new Set<string>(['en']);
    
    questions.forEach((q: any) => {
      const t = q.question_config?.translations;
      if (t && typeof t === 'object') {
        existing[q.id] = {};
        Object.keys(t).forEach(locale => {
          localeSet.add(locale);
          existing[q.id][locale] = t[locale];
        });
      }
    });
    
    setTranslations(existing);
    setActiveLocales(Array.from(localeSet));
  }, [questions]);

  const addLocale = (localeCode: string) => {
    if (!activeLocales.includes(localeCode)) {
      setActiveLocales([...activeLocales, localeCode]);
    }
    setShowAddLocale(false);
  };

  const availableLocales = SUPPORTED_LOCALES.filter(l => !activeLocales.includes(l.code));

  // Get translation status for a question / 获取问题的翻译状态
  const getTranslationStatus = (questionId: string, locale: string): 'complete' | 'partial' | 'missing' => {
    const t = translations[questionId]?.[locale];
    if (!t) return 'missing';
    if (t.question_text) return 'complete';
    return 'partial';
  };

  // Count translations / 统计翻译数量
  const translationStats = useMemo(() => {
    const stats: Record<string, { complete: number; partial: number; missing: number }> = {};
    activeLocales.forEach(locale => {
      if (locale === 'en') return;
      stats[locale] = { complete: 0, partial: 0, missing: 0 };
      questions.forEach((q: any) => {
        const status = getTranslationStatus(q.id, locale);
        stats[locale][status]++;
      });
    });
    return stats;
  }, [activeLocales, questions, translations]);

  // AI translate all questions for a locale / AI翻译所有问题到指定语言
  const translateAll = async (targetLocale: string) => {
    const locale = SUPPORTED_LOCALES.find(l => l.code === targetLocale);
    if (!locale) return;

    setTranslating(true);
    try {
      const toTranslate = questions.filter((q: any) => getTranslationStatus(q.id, targetLocale) !== 'complete');
      
      if (toTranslate.length === 0) {
        bToast.success('All questions already translated!', '所有问题已翻译完毕！');
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

      // Call through edge function — NOT direct OpenRouter
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-survey-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'translate',
          prompt,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Translation failed: ${errText}`);
      }

      const data = await resp.json();
      const content = data.response || '';
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

        // Save translations to question_config / 保存翻译到 question_config
        const updatedQuestions = questions.map((q: any) => {
          if (newTranslations[q.id]) {
            return {
              ...q,
              question_config: {
                ...q.question_config,
                translations: newTranslations[q.id],
              },
            };
          }
          return q;
        });

        onQuestionsUpdate(updatedQuestions);
        bToast.success(`Translated ${toTranslate.length} questions to ${locale.name}`, `已翻译 ${toTranslate.length} 个问题到${locale.name}`);
      } else {
        throw new Error('Could not parse translation response');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  // Manual edit translation / 手动编辑翻译
  const updateTranslation = (questionId: string, locale: string, field: string, value: string) => {
    const newTranslations = { ...translations };
    if (!newTranslations[questionId]) newTranslations[questionId] = {};
    if (!newTranslations[questionId][locale]) {
      newTranslations[questionId][locale] = { locale, question_text: '' };
    }
    (newTranslations[questionId][locale] as any)[field] = value;
    setTranslations(newTranslations);
  };

  // Save current translations / 保存当前翻译
  const saveTranslations = () => {
    const updatedQuestions = questions.map((q: any) => {
      if (translations[q.id]) {
        return {
          ...q,
          question_config: {
            ...q.question_config,
            translations: translations[q.id],
          },
        };
      }
      return q;
    });
    onQuestionsUpdate(updatedQuestions);
    toast.success('Translations saved!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-stone-800">Multi-Language Translations</h3>
        </div>
        <button
          onClick={saveTranslations}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
        >
          Save All
        </button>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 flex-wrap items-center">
        {activeLocales.map(code => {
          const locale = SUPPORTED_LOCALES.find(l => l.code === code);
          const stats = translationStats[code];
          return (
            <button
              key={code}
              onClick={() => setSelectedLocale(code)}
              className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                selectedLocale === code
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span className="font-medium">{locale?.flag || code.toUpperCase()}</span>
              <span>{locale?.name || code}</span>
              {stats && code !== 'en' && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  stats.missing === 0 ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {stats.complete}/{questions.length}
                </span>
              )}
            </button>
          );
        })}
        
        <div className="relative">
          <button
            onClick={() => setShowAddLocale(!showAddLocale)}
            className="px-2 py-1.5 text-xs rounded-lg bg-stone-50 text-stone-400 hover:bg-stone-100 border border-dashed border-stone-300"
          >
            <Plus className="w-3 h-3" />
          </button>
          {showAddLocale && availableLocales.length > 0 && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto w-48">
              {availableLocales.map(locale => (
                <button
                  key={locale.code}
                  onClick={() => addLocale(locale.code)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center gap-2"
                >
                  <span className="font-medium text-stone-500">{locale.flag}</span>
                  <span>{locale.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI translate button */}
      {selectedLocale !== 'en' && (
        <button
          onClick={() => translateAll(selectedLocale)}
          disabled={translating}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {translating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> AI Translate All to {SUPPORTED_LOCALES.find(l => l.code === selectedLocale)?.name}</>
          )}
        </button>
      )}

      {/* Translation table */}
      <div className="space-y-3">
        {questions.map((q: any) => {
          const t = translations[q.id]?.[selectedLocale];
          const status = selectedLocale === 'en' ? 'complete' : getTranslationStatus(q.id, selectedLocale);
          
          return (
            <div key={q.id} className="bg-white border border-stone-200 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                {status === 'complete' && <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
                {status === 'partial' && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />}
                {status === 'missing' && <Languages className="w-4 h-4 text-stone-300 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-400 mb-1">Original (EN)</p>
                  <p className="text-sm text-stone-700">{q.question_text}</p>
                </div>
              </div>

              {selectedLocale !== 'en' && (
                <div className="mt-2 pl-6">
                  <p className="text-xs text-stone-400 mb-1">
                    {SUPPORTED_LOCALES.find(l => l.code === selectedLocale)?.name} translation
                  </p>
                  <textarea
                    value={t?.question_text || ''}
                    onChange={(e) => updateTranslation(q.id, selectedLocale, 'question_text', e.target.value)}
                    placeholder="Enter translation..."
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 min-h-[60px] resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-stone-400">Options</p>
                      {q.options.map((opt: any, oi: number) => {
                        const translatedOpt = t?.options?.find((to: any) => to.id === opt.id);
                        return (
                          <div key={opt.id} className="flex items-center gap-2">
                            <span className="text-xs text-stone-400 w-20 truncate">{opt.option_text}</span>
                            <input
                              value={translatedOpt?.text || ''}
                              onChange={(e) => {
                                const newOpts = [...(t?.options || q.options.map((o: any) => ({ id: o.id, text: '' })))];
                                const idx = newOpts.findIndex((no: any) => no.id === opt.id);
                                if (idx >= 0) newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                                else newOpts.push({ id: opt.id, text: e.target.value });
                                
                                const newTranslations = { ...translations };
                                if (!newTranslations[q.id]) newTranslations[q.id] = {};
                                newTranslations[q.id][selectedLocale] = {
                                  ...(newTranslations[q.id][selectedLocale] || { locale: selectedLocale, question_text: '' }),
                                  options: newOpts,
                                };
                                setTranslations(newTranslations);
                              }}
                              placeholder={`${opt.option_text} translation...`}
                              className="flex-1 text-xs border border-stone-200 rounded px-2 py-1"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurveyTranslationManager;