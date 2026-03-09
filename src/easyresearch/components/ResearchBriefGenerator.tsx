import React, { useState } from 'react';
import { FileText, Sparkles, Download, Copy, RefreshCw, CheckCircle } from 'lucide-react';

interface Props {
  projectId: string;
  projectTitle?: string;
}

interface BriefSection {
  id: string;
  title: string;
  titleZh: string;
  content: string;
  enabled: boolean;
}

// AI-powered research brief/proposal generator
// AI驱动的研究简报/提案生成器
const ResearchBriefGenerator: React.FC<Props> = ({ projectId, projectTitle }) => {
  const [objective, setObjective] = useState('');
  const [methodology, setMethodology] = useState('survey');
  const [targetAudience, setTargetAudience] = useState('');
  const [sampleSize, setSampleSize] = useState('100');
  const [timeline, setTimeline] = useState('2_weeks');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sections, setSections] = useState<BriefSection[]>([
    { id: 'background', title: 'Background & Context', titleZh: '背景与上下文', content: '', enabled: true },
    { id: 'objectives', title: 'Research Objectives', titleZh: '研究目标', content: '', enabled: true },
    { id: 'methodology', title: 'Methodology', titleZh: '方法论', content: '', enabled: true },
    { id: 'participants', title: 'Target Participants', titleZh: '目标参与者', content: '', enabled: true },
    { id: 'timeline', title: 'Timeline & Milestones', titleZh: '时间线与里程碑', content: '', enabled: true },
    { id: 'deliverables', title: 'Deliverables', titleZh: '交付物', content: '', enabled: true },
    { id: 'ethics', title: 'Ethical Considerations', titleZh: '伦理考量', content: '', enabled: true },
    { id: 'budget', title: 'Budget Estimate', titleZh: '预算估算', content: '', enabled: true },
    { id: 'risks', title: 'Risks & Mitigation', titleZh: '风险与缓解', content: '', enabled: true },
  ]);

  const generateBrief = async () => {
    setGenerating(true);
    // Simulate AI generation with structured content / 模拟AI生成结构化内容
    await new Promise(r => setTimeout(r, 1500));

    const methodMap: Record<string, string> = {
      survey: 'Online Survey', interview: 'Semi-structured Interviews', usability: 'Usability Testing',
      diary: 'Diary Study', card_sort: 'Card Sorting', a_b_test: 'A/B Testing', mixed: 'Mixed Methods',
    };

    const timelineMap: Record<string, string> = {
      '1_week': '1 week', '2_weeks': '2 weeks', '1_month': '1 month', '3_months': '3 months', '6_months': '6 months',
    };

    const generated: Record<string, string> = {
      background: `This research project "${projectTitle || 'Untitled'}" aims to investigate ${objective || 'user behavior and preferences'}. The study is designed to provide actionable insights that will inform product strategy and design decisions.\n\n本研究项目"${projectTitle || '未命名'}"旨在调查${objective || '用户行为和偏好'}。该研究旨在提供可操作的见解，为产品策略和设计决策提供信息。`,
      objectives: `Primary Objectives / 主要目标:\n1. Understand user needs and pain points / 了解用户需求和痛点\n2. Evaluate current product usability / 评估当前产品可用性\n3. Identify improvement opportunities / 识别改进机会\n4. Validate design hypotheses / 验证设计假设`,
      methodology: `Method: ${methodMap[methodology] || methodology}\n方法: ${methodMap[methodology] || methodology}\n\nThis study will employ ${methodMap[methodology]} as the primary research method. Data will be collected through structured instruments designed to capture both quantitative metrics and qualitative feedback.\n\n本研究将采用${methodMap[methodology]}作为主要研究方法。数据将通过结构化工具收集，以捕捉定量指标和定性反馈。`,
      participants: `Target: ${targetAudience || 'General users'}\n目标: ${targetAudience || '普通用户'}\n\nSample Size: n=${sampleSize}\n样本量: n=${sampleSize}\n\nRecruitment channels: Panel recruitment, social media, email outreach\n招募渠道: 面板招募、社交媒体、邮件外展`,
      timeline: `Duration: ${timelineMap[timeline] || timeline}\n持续时间: ${timelineMap[timeline] || timeline}\n\nPhase 1 - Setup & Recruitment (Days 1-3)\nPhase 2 - Data Collection (Days 4-10)\nPhase 3 - Analysis & Synthesis (Days 11-13)\nPhase 4 - Report & Presentation (Day 14)`,
      deliverables: `1. Research Report with key findings / 含关键发现的研究报告\n2. Executive Summary Dashboard / 管理层摘要仪表板\n3. Participant Personas (if applicable) / 参与者画像（如适用）\n4. Raw data export (CSV/SPSS) / 原始数据导出\n5. Presentation slides / 演示幻灯片`,
      ethics: `• Informed consent will be obtained from all participants / 将获得所有参与者的知情同意\n• Data will be anonymized and stored securely / 数据将被匿名化并安全存储\n• Participants may withdraw at any time / 参与者可随时退出\n• IRB approval status: Pending / IRB审批状态: 待定`,
      budget: `Estimated Budget / 预算估算:\n• Participant incentives: $${parseInt(sampleSize) * 10} / 参与者激励\n• Platform costs: $500 / 平台费用\n• Analysis tools: $200 / 分析工具\n• Total: ~$${parseInt(sampleSize) * 10 + 700}`,
      risks: `1. Low response rate → Mitigation: Over-recruit by 20% / 低回复率 → 缓解: 多招募20%\n2. Data quality issues → Mitigation: Automated quality checks / 数据质量问题 → 缓解: 自动质量检查\n3. Timeline delays → Mitigation: Buffer days built in / 时间延迟 → 缓解: 内置缓冲天数`,
    };

    setSections(prev => prev.map(s => ({ ...s, content: generated[s.id] || s.content })));
    setGenerating(false);
  };

  const exportBrief = () => {
    const text = sections.filter(s => s.enabled && s.content)
      .map(s => `## ${s.title} / ${s.titleZh}\n\n${s.content}`).join('\n\n---\n\n');
    const blob = new Blob([`# Research Brief: ${projectTitle || 'Untitled'}\n\n${text}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'research-brief.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyBrief = () => {
    const text = sections.filter(s => s.enabled && s.content)
      .map(s => `${s.title}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Research Brief Generator / 研究简报生成器</h2>
            <p className="text-xs text-stone-500">AI-powered research proposal builder / AI驱动的研究提案构建器</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={copyBrief} className="px-3 py-1.5 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 flex items-center gap-1">
            {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={exportBrief} className="px-3 py-1.5 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 flex items-center gap-1">
            <Download size={12} /> Export .md
          </button>
        </div>
      </div>

      {/* Input form / 输入表单 */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h4 className="text-sm font-semibold text-stone-700">Study Parameters / 研究参数</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-stone-500 uppercase">Research Objective / 研究目标</label>
            <textarea value={objective} onChange={e => setObjective(e.target.value)} rows={2}
              placeholder="What do you want to learn? / 你想了解什么？"
              className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-stone-500 uppercase">Methodology / 方法论</label>
            <select value={methodology} onChange={e => setMethodology(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white">
              <option value="survey">Online Survey / 在线调查</option>
              <option value="interview">Interviews / 访谈</option>
              <option value="usability">Usability Testing / 可用性测试</option>
              <option value="diary">Diary Study / 日记研究</option>
              <option value="card_sort">Card Sorting / 卡片分类</option>
              <option value="a_b_test">A/B Testing / A/B测试</option>
              <option value="mixed">Mixed Methods / 混合方法</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-stone-500 uppercase">Target Audience / 目标受众</label>
            <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
              placeholder="e.g., Mobile app users aged 25-45" className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-stone-500 uppercase">Sample Size / 样本量</label>
            <input type="number" value={sampleSize} onChange={e => setSampleSize(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-stone-500 uppercase">Timeline / 时间线</label>
            <select value={timeline} onChange={e => setTimeline(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white">
              <option value="1_week">1 Week / 1周</option>
              <option value="2_weeks">2 Weeks / 2周</option>
              <option value="1_month">1 Month / 1个月</option>
              <option value="3_months">3 Months / 3个月</option>
              <option value="6_months">6 Months / 6个月</option>
            </select>
          </div>
        </div>
        <button onClick={generateBrief} disabled={generating}
          className="w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generating ? 'Generating... / 生成中...' : 'Generate Brief / 生成简报'}
        </button>
      </div>

      {/* Section toggles & content / 章节开关和内容 */}
      <div className="space-y-3">
        {sections.map(section => (
          <div key={section.id} className={`bg-white rounded-xl border p-4 transition-all ${section.enabled ? 'border-stone-200' : 'border-stone-100 opacity-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, enabled: !s.enabled } : s))}
                  className={`w-4 h-4 rounded border flex items-center justify-center ${section.enabled ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300'}`}>
                  {section.enabled && <CheckCircle size={10} />}
                </button>
                <h4 className="text-sm font-semibold text-stone-700">{section.title}</h4>
                <span className="text-xs text-stone-400">{section.titleZh}</span>
              </div>
            </div>
            {section.enabled && (
              <textarea value={section.content}
                onChange={e => setSections(prev => prev.map(s => s.id === section.id ? { ...s, content: e.target.value } : s))}
                rows={4} placeholder={`Enter ${section.title.toLowerCase()} content...`}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg resize-y" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchBriefGenerator;
