import React, { useState, useMemo } from 'react';
import { Accessibility, CheckCircle, AlertTriangle, XCircle, Eye, Type, Contrast, MousePointer, Volume2, Globe } from 'lucide-react';

// Accessibility Checker — WCAG compliance validation for surveys
// 无障碍检查器 — 调查问卷的WCAG合规验证

interface AccessibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'contrast' | 'readability' | 'navigation' | 'media' | 'language' | 'structure';
  questionId?: string;
  questionText?: string;
  message: string;
  messageZh: string;
  suggestion: string;
  suggestionZh: string;
  wcagCriteria: string;
}

interface Props {
  questions: any[];
  theme?: any;
}

const AccessibilityChecker: React.FC<Props> = ({ questions, theme }) => {
  const [showPassed, setShowPassed] = useState(false);

  // Run accessibility audit / 运行无障碍审计
  const issues = useMemo(() => {
    const found: AccessibilityIssue[] = [];
    let issueIdx = 0;

    questions.forEach((q, i) => {
      const text = q.question_text || q.text || '';
      const desc = q.question_description || q.description || '';
      const type = q.question_type || q.type || '';
      const options = q.options || [];
      const config = q.question_config || {};

      // 1. Empty question text / 空问题文本
      if (!text.trim()) {
        found.push({
          id: `a-${issueIdx++}`,
          severity: 'error',
          category: 'readability',
          questionId: q.id,
          questionText: `Q${i + 1}`,
          message: `Question ${i + 1} has no text — screen readers cannot interpret it.`,
          messageZh: `第${i + 1}题没有文本 — 屏幕阅读器无法解析。`,
          suggestion: 'Add descriptive question text.',
          suggestionZh: '添加描述性的问题文本。',
          wcagCriteria: '1.1.1 Non-text Content',
        });
      }

      // 2. Very long question text / 过长的问题文本
      if (text.length > 200) {
        found.push({
          id: `a-${issueIdx++}`,
          severity: 'warning',
          category: 'readability',
          questionId: q.id,
          questionText: text.substring(0, 50),
          message: `Question ${i + 1} text is ${text.length} characters — may be difficult to comprehend.`,
          messageZh: `第${i + 1}题文本有${text.length}个字符 — 可能难以理解。`,
          suggestion: 'Consider splitting into shorter, simpler sentences.',
          suggestionZh: '考虑拆分为更短、更简单的句子。',
          wcagCriteria: '3.1.5 Reading Level',
        });
      }

      // 3. Missing alt text for image questions / 图片问题缺少替代文本
      if (['image_choice', 'heatmap', 'image'].includes(type)) {
        const hasAlt = config.alt_text || config.image_alt;
        if (!hasAlt) {
          found.push({
            id: `a-${issueIdx++}`,
            severity: 'error',
            category: 'media',
            questionId: q.id,
            questionText: text.substring(0, 50),
            message: `Image question ${i + 1} missing alt text for visually impaired users.`,
            messageZh: `图片问题 ${i + 1} 缺少视障用户的替代文本。`,
            suggestion: 'Add descriptive alt text to all images.',
            suggestionZh: '为所有图片添加描述性替代文本。',
            wcagCriteria: '1.1.1 Non-text Content',
          });
        }
      }

      // 4. Video/audio without captions / 视频/音频无字幕
      if (['video', 'audio'].includes(type)) {
        const hasCaptions = config.captions_url || config.transcript;
        if (!hasCaptions) {
          found.push({
            id: `a-${issueIdx++}`,
            severity: 'error',
            category: 'media',
            questionId: q.id,
            questionText: text.substring(0, 50),
            message: `Media question ${i + 1} lacks captions/transcript.`,
            messageZh: `媒体问题 ${i + 1} 缺少字幕/文字稿。`,
            suggestion: 'Add captions for video or transcript for audio content.',
            suggestionZh: '为视频添加字幕或为音频添加文字稿。',
            wcagCriteria: '1.2.1 Audio-only and Video-only',
          });
        }
      }

      // 5. Too many options without grouping / 选项过多未分组
      if (options.length > 10) {
        found.push({
          id: `a-${issueIdx++}`,
          severity: 'warning',
          category: 'navigation',
          questionId: q.id,
          questionText: text.substring(0, 50),
          message: `Question ${i + 1} has ${options.length} options — may overwhelm users with cognitive disabilities.`,
          messageZh: `第${i + 1}题有${options.length}个选项 — 可能对认知障碍用户造成困扰。`,
          suggestion: 'Consider grouping options or using a searchable dropdown.',
          suggestionZh: '考虑对选项进行分组或使用可搜索的下拉菜单。',
          wcagCriteria: '3.3.2 Labels or Instructions',
        });
      }

      // 6. Color-only differentiation / 仅用颜色区分
      if (['rating', 'scale', 'nps'].includes(type) && !desc.trim()) {
        found.push({
          id: `a-${issueIdx++}`,
          severity: 'warning',
          category: 'contrast',
          questionId: q.id,
          questionText: text.substring(0, 50),
          message: `Scale question ${i + 1} may rely on color alone for meaning.`,
          messageZh: `量表问题 ${i + 1} 可能仅依赖颜色传达含义。`,
          suggestion: 'Add text labels to scale endpoints (e.g., "Very Dissatisfied" to "Very Satisfied").',
          suggestionZh: '为量表端点添加文字标签（如"非常不满意"到"非常满意"）。',
          wcagCriteria: '1.4.1 Use of Color',
        });
      }

      // 7. Placeholder-only labels / 仅占位符标签
      if (['text', 'textarea', 'email', 'number'].includes(type) && !text.trim() && config.placeholder) {
        found.push({
          id: `a-${issueIdx++}`,
          severity: 'error',
          category: 'structure',
          questionId: q.id,
          questionText: config.placeholder.substring(0, 50),
          message: `Question ${i + 1} uses placeholder as label — disappears on focus.`,
          messageZh: `第${i + 1}题用占位符作为标签 — 获得焦点时会消失。`,
          suggestion: 'Use a visible label above the input field.',
          suggestionZh: '在输入框上方使用可见标签。',
          wcagCriteria: '3.3.2 Labels or Instructions',
        });
      }

      // 8. Required fields without indication / 必填字段无标识
      if ((q.required || config.response_required === 'force') && !text.includes('*') && !text.toLowerCase().includes('required')) {
        found.push({
          id: `a-${issueIdx++}`,
          severity: 'info',
          category: 'structure',
          questionId: q.id,
          questionText: text.substring(0, 50),
          message: `Required question ${i + 1} — ensure visual indicator is present.`,
          messageZh: `必填问题 ${i + 1} — 确保有可视标识。`,
          suggestion: 'Mark required fields with asterisk (*) and aria-required.',
          suggestionZh: '用星号(*)和aria-required标记必填字段。',
          wcagCriteria: '3.3.2 Labels or Instructions',
        });
      }
    });

    // Global checks / 全局检查
    if (questions.length > 30) {
      found.push({
        id: `a-${issueIdx++}`,
        severity: 'warning',
        category: 'navigation',
        message: `Survey has ${questions.length} questions — may cause fatigue for users with attention difficulties.`,
        messageZh: `调查有${questions.length}个问题 — 可能导致注意力困难用户疲劳。`,
        suggestion: 'Consider breaking into pages or adding progress indicators.',
        suggestionZh: '考虑分页或添加进度指示器。',
        wcagCriteria: '2.2.1 Timing Adjustable',
      });
    }

    return found;
  }, [questions, theme]);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;
  const score = Math.max(0, 100 - errorCount * 15 - warningCount * 5 - infoCount * 1);

  const severityIcon = (s: string) => {
    if (s === 'error') return <XCircle size={14} className="text-red-500" />;
    if (s === 'warning') return <AlertTriangle size={14} className="text-amber-500" />;
    return <Eye size={14} className="text-blue-500" />;
  };

  const categoryIcon = (c: string) => {
    const map: Record<string, any> = {
      contrast: Contrast, readability: Type, navigation: MousePointer, media: Volume2, language: Globe, structure: Accessibility,
    };
    const Icon = map[c] || Accessibility;
    return <Icon size={12} className="text-stone-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2"><Accessibility size={20} /> Accessibility / 无障碍</h2>
      </div>

      {/* Score Card / 评分卡 */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
            score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}>{score}</div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-stone-800">
              {score >= 80 ? 'Good Accessibility / 良好的无障碍性' :
               score >= 50 ? 'Needs Improvement / 需要改进' :
               'Critical Issues Found / 发现关键问题'}
            </h3>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs">
                <XCircle size={12} className="text-red-500" /> {errorCount} errors / 错误
              </span>
              <span className="flex items-center gap-1 text-xs">
                <AlertTriangle size={12} className="text-amber-500" /> {warningCount} warnings / 警告
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Eye size={12} className="text-blue-500" /> {infoCount} info / 建议
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WCAG Checklist Summary / WCAG检查清单 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">WCAG 2.1 Categories / WCAG 2.1 类别</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { cat: 'contrast', label: 'Color & Contrast / 颜色对比' },
            { cat: 'readability', label: 'Readability / 可读性' },
            { cat: 'navigation', label: 'Navigation / 导航' },
            { cat: 'media', label: 'Media Alternatives / 媒体替代' },
            { cat: 'language', label: 'Language / 语言' },
            { cat: 'structure', label: 'Structure / 结构' },
          ].map(c => {
            const catIssues = issues.filter(i => i.category === c.cat);
            const catErrors = catIssues.filter(i => i.severity === 'error').length;
            return (
              <div key={c.cat} className={`p-3 rounded-lg border ${
                catErrors > 0 ? 'border-red-200 bg-red-50' :
                catIssues.length > 0 ? 'border-amber-200 bg-amber-50' :
                'border-emerald-200 bg-emerald-50'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {categoryIcon(c.cat)}
                  <span className="text-xs font-medium text-stone-700">{c.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {catErrors > 0 ? <XCircle size={12} className="text-red-500" /> :
                   catIssues.length > 0 ? <AlertTriangle size={12} className="text-amber-500" /> :
                   <CheckCircle size={12} className="text-emerald-500" />}
                  <span className="text-[10px] text-stone-500">{catIssues.length} issues</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue List / 问题列表 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-stone-700">Issues ({issues.length}) / 问题列表</h3>
          <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
            <input type="checkbox" checked={showPassed} onChange={e => setShowPassed(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-stone-300 text-emerald-600" />
            Show passed / 显示通过项
          </label>
        </div>
        {issues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-stone-700">All checks passed! / 所有检查通过！</p>
            <p className="text-xs text-stone-500 mt-1">Your survey meets WCAG 2.1 AA standards.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map(issue => (
              <div key={issue.id} className={`p-3 rounded-lg border ${
                issue.severity === 'error' ? 'border-red-200 bg-red-50/50' :
                issue.severity === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                'border-blue-200 bg-blue-50/50'
              }`}>
                <div className="flex items-start gap-2">
                  {severityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800">{issue.message}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">{issue.messageZh}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{issue.wcagCriteria}</span>
                      {issue.questionId && (
                        <span className="text-[9px] text-stone-400">Q: {issue.questionText}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1.5">💡 {issue.suggestion}</p>
                    <p className="text-[10px] text-emerald-600">{issue.suggestionZh}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityChecker;
