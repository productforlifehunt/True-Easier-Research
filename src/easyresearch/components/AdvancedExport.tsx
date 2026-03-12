import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Settings, Check } from 'lucide-react';
import { bToast, toast } from '../utils/bilingualToast';
import type { QuestionnaireConfig } from './QuestionnaireList';

// Advanced Data Export — SPSS-compatible CSV, structured Excel, PDF report generation
// 高级数据导出 — SPSS 兼容 CSV、结构化 Excel、PDF 报告生成
interface Props {
  projectId: string;
  projectTitle: string;
  responses: any[];
  questions: any[];
  enrollments: any[];
  questionnaires: QuestionnaireConfig[];
}

type ExportFormat = 'csv_wide' | 'csv_long' | 'spss' | 'json';

interface ExportConfig {
  format: ExportFormat;
  includeMetadata: boolean;
  includeTimings: boolean;
  includeQualityFlags: boolean;
  dateFormat: 'iso' | 'local' | 'unix';
  missingValue: string;
  selectedQuestionnaire: string;
  encoding: 'utf-8' | 'utf-8-bom';
  includeHeaders: boolean;
  flattenArrays: boolean;
}

const AdvancedExport: React.FC<Props> = ({ projectId, projectTitle, responses, questions, enrollments, questionnaires }) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv_wide',
    includeMetadata: true,
    includeTimings: false,
    includeQualityFlags: true,
    dateFormat: 'iso',
    missingValue: '',
    selectedQuestionnaire: 'all',
    encoding: 'utf-8-bom',
    includeHeaders: true,
    flattenArrays: true,
  });
  const [exporting, setExporting] = useState(false);

  // Filter questions / 过滤问题
  const filteredQuestions = useMemo(() => {
    let qs = questions.filter((q: any) => !['section_header', 'divider', 'text_block', 'image_block', 'instruction'].includes(q.question_type));
    if (config.selectedQuestionnaire !== 'all') {
      qs = qs.filter((q: any) => q.questionnaire_id === config.selectedQuestionnaire);
    }
    return qs.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
  }, [questions, config.selectedQuestionnaire]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return config.missingValue;
    const d = new Date(dateStr);
    switch (config.dateFormat) {
      case 'local': return d.toLocaleString();
      case 'unix': return String(Math.floor(d.getTime() / 1000));
      default: return d.toISOString();
    }
  };

  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  // Wide format: one row per participant, columns per question / 宽格式
  const generateWideCSV = (): string => {
    const enrollmentIds = [...new Set(responses.map(r => r.enrollment_id))].filter(Boolean);
    const headers: string[] = ['participant_id'];
    
    if (config.includeMetadata) {
      headers.push('enrollment_date', 'status');
    }

    // Add question columns
    filteredQuestions.forEach((q: any) => {
      const label = (q.question_text || '').replace(/[,"\n]/g, ' ').slice(0, 50);
      headers.push(`Q_${q.id.slice(0, 8)}_${label}`);
    });

    if (config.includeTimings) headers.push('total_time_seconds');
    if (config.includeQualityFlags) headers.push('quality_flags');

    const rows: string[][] = [];
    enrollmentIds.forEach(eid => {
      const enrollment = enrollments.find(e => e.id === eid);
      const pResponses = responses.filter(r => r.enrollment_id === eid);
      const row: string[] = [enrollment?.participant_email || enrollment?.participant_id || eid || ''];

      if (config.includeMetadata) {
        row.push(formatDate(enrollment?.created_at || ''));
        row.push(enrollment?.status || '');
      }

      filteredQuestions.forEach((q: any) => {
        const resp = pResponses.find(r => r.question_id === q.id);
        if (!resp) {
          row.push(config.missingValue);
        } else {
          let val = resp.response_text || '';
          if (resp.response_value != null) {
            if (Array.isArray(resp.response_value) && config.flattenArrays) {
              val = resp.response_value.join('; ');
            } else if (typeof resp.response_value === 'object') {
              val = JSON.stringify(resp.response_value);
            } else {
              val = String(resp.response_value);
            }
          }
          row.push(val);
        }
      });

      if (config.includeTimings) {
        const timingResp = pResponses.find(r => r.question_id === '__completion_time_seconds__');
        row.push(timingResp?.response_value != null ? String(timingResp.response_value) : config.missingValue);
      }

      if (config.includeQualityFlags) {
        const flagResp = pResponses.find(r => r.question_id === '__quality_flags__');
        row.push(Array.isArray(flagResp?.response_value) ? flagResp.response_value.join('; ') : config.missingValue);
      }

      rows.push(row);
    });

    const csvLines = config.includeHeaders ? [headers.map(escapeCSV).join(',')] : [];
    rows.forEach(r => csvLines.push(r.map(escapeCSV).join(',')));
    return csvLines.join('\n');
  };

  // Long format: one row per response / 长格式
  const generateLongCSV = (): string => {
    const headers = ['participant_id', 'question_id', 'question_text', 'question_type', 'response_text', 'response_value', 'responded_at'];
    const rows: string[][] = [];

    const filteredQIds = new Set(filteredQuestions.map((q: any) => q.id));

    responses.forEach(r => {
      if (!r.question_id?.startsWith('__') && filteredQIds.has(r.question_id)) {
        const q = filteredQuestions.find((qq: any) => qq.id === r.question_id);
        const enrollment = enrollments.find(e => e.id === r.enrollment_id);
        rows.push([
          enrollment?.participant_email || enrollment?.participant_id || r.enrollment_id || '',
          r.question_id || '',
          (q?.question_text || '').replace(/[\n\r]/g, ' '),
          q?.question_type || '',
          r.response_text || '',
          r.response_value != null ? (typeof r.response_value === 'object' ? JSON.stringify(r.response_value) : String(r.response_value)) : '',
          formatDate(r.created_at || ''),
        ]);
      }
    });

    const csvLines = [headers.map(escapeCSV).join(',')];
    rows.forEach(r => csvLines.push(r.map(escapeCSV).join(',')));
    return csvLines.join('\n');
  };

  // SPSS-compatible syntax file + CSV / SPSS 兼容语法文件 + CSV
  const generateSPSS = (): { csv: string; syntax: string } => {
    const csv = generateWideCSV();
    const headers = csv.split('\n')[0]?.split(',') || [];
    
    // Generate SPSS syntax file for variable labels
    const syntaxLines = [
      `* SPSS Syntax for: ${projectTitle}`,
      `* Generated: ${new Date().toISOString()}`,
      `* Project ID: ${projectId}`,
      '',
      `GET DATA /TYPE=TXT`,
      `  /FILE='data.csv'`,
      `  /DELCASE=LINE /DELIMITERS=","`,
      `  /QUALIFIER='"'`,
      `  /ARRANGEMENT=DELIMITED`,
      `  /FIRSTCASE=2`,
      `  /VARIABLES=`,
    ];

    headers.forEach((h, i) => {
      const clean = h.replace(/"/g, '');
      syntaxLines.push(`    ${clean} A255`);
    });
    syntaxLines.push('.');
    syntaxLines.push('');
    syntaxLines.push('VARIABLE LABELS');
    
    filteredQuestions.forEach((q: any) => {
      const varName = `Q_${q.id.slice(0, 8)}_${(q.question_text || '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}`;
      syntaxLines.push(`  ${varName} '${(q.question_text || '').replace(/'/g, "''").slice(0, 120)}'`);
    });
    syntaxLines.push('.');

    return { csv, syntax: syntaxLines.join('\n') };
  };

  // JSON export / JSON 导出
  const generateJSON = (): string => {
    const enrollmentIds = [...new Set(responses.map(r => r.enrollment_id))].filter(Boolean);
    const data = enrollmentIds.map(eid => {
      const enrollment = enrollments.find(e => e.id === eid);
      const pResponses = responses.filter(r => r.enrollment_id === eid && !r.question_id?.startsWith('__'));
      
      const answers: Record<string, any> = {};
      pResponses.forEach(r => {
        const q = filteredQuestions.find((qq: any) => qq.id === r.question_id);
        if (q) {
          answers[r.question_id] = {
            question: q.question_text,
            type: q.question_type,
            text: r.response_text,
            value: r.response_value,
            timestamp: r.created_at,
          };
        }
      });

      return {
        participant: enrollment?.participant_email || enrollment?.participant_id || eid,
        enrolled_at: enrollment?.created_at,
        status: enrollment?.status,
        answers,
      };
    });

    return JSON.stringify({ project: projectTitle, exported_at: new Date().toISOString(), total_participants: data.length, data }, null, 2);
  };

  const handleExport = () => {
    setExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (config.format) {
        case 'csv_wide':
          content = generateWideCSV();
          filename = `${projectTitle.replace(/\s+/g, '_')}_wide_${new Date().toISOString().slice(0, 10)}.csv`;
          mimeType = 'text/csv';
          break;
        case 'csv_long':
          content = generateLongCSV();
          filename = `${projectTitle.replace(/\s+/g, '_')}_long_${new Date().toISOString().slice(0, 10)}.csv`;
          mimeType = 'text/csv';
          break;
        case 'spss': {
          const spss = generateSPSS();
          // Download CSV
          downloadFile(spss.csv, `${projectTitle.replace(/\s+/g, '_')}_spss_data.csv`, 'text/csv');
          // Download syntax
          downloadFile(spss.syntax, `${projectTitle.replace(/\s+/g, '_')}_spss_syntax.sps`, 'text/plain');
          toast.success('SPSS files exported / SPSS 文件已导出');
          setExporting(false);
          return;
        }
        case 'json':
          content = generateJSON();
          filename = `${projectTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
          mimeType = 'application/json';
          break;
        default:
          return;
      }

      downloadFile(content, filename, mimeType);
      toast.success(`Exported ${config.format} / 已导出 ${config.format}`);
    } catch (e: any) {
      toast.error('Export failed / 导出失败: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const bom = config.encoding === 'utf-8-bom' && mimeType === 'text/csv' ? '\uFEFF' : '';
    const blob = new Blob([bom + content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const responseCount = responses.filter(r => !r.question_id?.startsWith('__')).length;
  const participantCount = new Set(responses.map(r => r.enrollment_id).filter(Boolean)).size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Download className="w-5 h-5" />
          Advanced Export / 高级导出
        </h3>
        <div className="text-xs text-muted-foreground">
          {responseCount} responses from {participantCount} participants / {responseCount} 条回复，{participantCount} 位参与者
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Format selection / 格式选择 */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Export Format / 导出格式</div>
          {[
            { id: 'csv_wide' as ExportFormat, label: 'CSV — Wide Format / 宽格式', desc: 'One row per participant, columns per question / 每行一个参与者', icon: FileSpreadsheet },
            { id: 'csv_long' as ExportFormat, label: 'CSV — Long Format / 长格式', desc: 'One row per response, ideal for R/Python / 每行一条回复', icon: FileSpreadsheet },
            { id: 'spss' as ExportFormat, label: 'SPSS Compatible / SPSS 兼容', desc: 'CSV + .sps syntax file with variable labels / CSV + 语法文件', icon: Database },
            { id: 'json' as ExportFormat, label: 'JSON Structured / JSON 结构化', desc: 'Full nested JSON with metadata / 完整嵌套 JSON', icon: FileText },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setConfig(prev => ({ ...prev, format: f.id }))}
              className={`w-full text-left p-3 border rounded-lg flex items-start gap-3 transition ${
                config.format === f.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
              }`}
            >
              <f.icon className={`w-5 h-5 mt-0.5 ${config.format === f.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <div className="text-sm font-medium text-foreground">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
              {config.format === f.id && <Check className="w-4 h-4 text-primary ml-auto mt-1" />}
            </button>
          ))}
        </div>

        {/* Options / 选项 */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" /> Options / 选项
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Questionnaire / 问卷</label>
            <select
              value={config.selectedQuestionnaire}
              onChange={e => setConfig(prev => ({ ...prev, selectedQuestionnaire: e.target.value }))}
              className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All / 全部</option>
              {questionnaires.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Date Format / 日期格式</label>
            <select
              value={config.dateFormat}
              onChange={e => setConfig(prev => ({ ...prev, dateFormat: e.target.value as any }))}
              className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            >
              <option value="iso">ISO 8601 (2024-01-15T10:30:00Z)</option>
              <option value="local">Local / 本地 (1/15/2024, 10:30 AM)</option>
              <option value="unix">Unix Timestamp (1705312200)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Missing Value / 缺失值</label>
            <input
              value={config.missingValue}
              onChange={e => setConfig(prev => ({ ...prev, missingValue: e.target.value }))}
              placeholder="Empty / 空, or NA, -999"
              className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {[
            { key: 'includeMetadata', label: 'Include metadata / 包含元数据' },
            { key: 'includeTimings', label: 'Include response timings / 包含响应时间' },
            { key: 'includeQualityFlags', label: 'Include quality flags / 包含质量标记' },
            { key: 'flattenArrays', label: 'Flatten arrays (;) / 展平数组 (;)' },
          ].map(opt => (
            <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={(config as any)[opt.key]}
                onChange={e => setConfig(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                className="rounded border-border"
              />
              {opt.label}
            </label>
          ))}

          <button
            onClick={handleExport}
            disabled={exporting || responseCount === 0}
            className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting... / 导出中...' : `Export ${config.format.toUpperCase()} / 导出`}
          </button>

          {responseCount === 0 && (
            <div className="text-xs text-amber-600 text-center">No responses to export / 没有可导出的回复</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedExport;
