/**
 * Cross-Tabulation Analysis — Compare responses across segments
 * 交叉分析 — 按细分比较回复
 * 
 * Select two questions and see how responses to one correlate with the other.
 * Supports: choice × choice, choice × scale, demographic × anything.
 */
import React, { useState, useMemo } from 'react';
import { Table2, ArrowLeftRight } from 'lucide-react';

interface CrossTabProps {
  questions: any[];
  responses: any[];
}

const CrossTabAnalysis: React.FC<CrossTabProps> = ({ questions, responses }) => {
  const [rowQuestionId, setRowQuestionId] = useState<string>('');
  const [colQuestionId, setColQuestionId] = useState<string>('');

  // Only questions that collect responses / 仅收集回复的问题
  const validQuestions = useMemo(() =>
    questions.filter(q => !['section_header', 'divider', 'text_block', 'image_block', 'instruction', 'video_block', 'audio_block', 'embed_block'].includes(q.question_type)),
    [questions]
  );

  // Build cross-tab matrix
  const crossTab = useMemo(() => {
    if (!rowQuestionId || !colQuestionId) return null;

    // Group responses by enrollment
    const byEnrollment = new Map<string, Map<string, string>>();
    responses.forEach(r => {
      const key = r.enrollment_id || r.id;
      if (!byEnrollment.has(key)) byEnrollment.set(key, new Map());
      const val = r.response_text || (r.response_value != null ? String(r.response_value) : '');
      if (val) byEnrollment.get(key)!.set(r.question_id, val);
    });

    // Get unique values for each question
    const rowValues = new Set<string>();
    const colValues = new Set<string>();
    const matrix: Record<string, Record<string, number>> = {};

    byEnrollment.forEach(answers => {
      const rowVal = answers.get(rowQuestionId);
      const colVal = answers.get(colQuestionId);
      if (!rowVal || !colVal) return;

      rowValues.add(rowVal);
      colValues.add(colVal);

      if (!matrix[rowVal]) matrix[rowVal] = {};
      matrix[rowVal][colVal] = (matrix[rowVal][colVal] || 0) + 1;
    });

    const rows = Array.from(rowValues).sort();
    const cols = Array.from(colValues).sort();

    // Calculate totals
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};
    let grandTotal = 0;

    rows.forEach(r => {
      rowTotals[r] = cols.reduce((sum, c) => sum + (matrix[r]?.[c] || 0), 0);
      grandTotal += rowTotals[r];
    });
    cols.forEach(c => {
      colTotals[c] = rows.reduce((sum, r) => sum + (matrix[r]?.[c] || 0), 0);
    });

    return { rows, cols, matrix, rowTotals, colTotals, grandTotal };
  }, [rowQuestionId, colQuestionId, responses]);

  const getQuestionLabel = (id: string) => {
    const q = validQuestions.find(q => q.id === id);
    return q?.question_text?.substring(0, 50) || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Table2 size={14} className="text-emerald-500" />
        <h3 className="text-[13px] font-semibold text-stone-800">Cross-Tabulation / 交叉分析</h3>
      </div>

      {/* Question selectors */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-stone-400 uppercase tracking-wider mb-1 block">Row Question (Rows) / 行问题</label>
          <select
            value={rowQuestionId}
            onChange={e => setRowQuestionId(e.target.value)}
            className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-stone-200 bg-white"
          >
            <option value="">Select question... / 选择问题...</option>
            {validQuestions.map(q => (
              <option key={q.id} value={q.id}>{q.question_text?.substring(0, 60) || 'Untitled'}</option>
            ))}
          </select>
        </div>
        <ArrowLeftRight size={16} className="text-stone-300 mt-5 shrink-0" />
        <div className="flex-1">
          <label className="text-[10px] text-stone-400 uppercase tracking-wider mb-1 block">Column Question / 列问题</label>
          <select
            value={colQuestionId}
            onChange={e => setColQuestionId(e.target.value)}
            className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-stone-200 bg-white"
          >
            <option value="">Select question... / 选择问题...</option>
            {validQuestions.filter(q => q.id !== rowQuestionId).map(q => (
              <option key={q.id} value={q.id}>{q.question_text?.substring(0, 60) || 'Untitled'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cross-tab table */}
      {crossTab && crossTab.rows.length > 0 && crossTab.cols.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-stone-50 border border-stone-200 font-semibold text-stone-600 min-w-[120px]">
                  {getQuestionLabel(rowQuestionId).substring(0, 30)}
                </th>
                {crossTab.cols.map(col => (
                  <th key={col} className="p-2 bg-stone-50 border border-stone-200 font-semibold text-stone-600 text-center min-w-[60px]">
                    {col.length > 15 ? col.substring(0, 12) + '...' : col}
                  </th>
                ))}
                <th className="p-2 bg-emerald-50 border border-stone-200 font-semibold text-emerald-700 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {crossTab.rows.map(row => (
                <tr key={row}>
                  <td className="p-2 border border-stone-200 font-medium text-stone-700 bg-stone-50/50">
                    {row.length > 25 ? row.substring(0, 22) + '...' : row}
                  </td>
                  {crossTab.cols.map(col => {
                    const count = crossTab.matrix[row]?.[col] || 0;
                    const pct = crossTab.rowTotals[row] > 0 ? Math.round((count / crossTab.rowTotals[row]) * 100) : 0;
                    const intensity = crossTab.grandTotal > 0 ? count / crossTab.grandTotal : 0;
                    return (
                      <td key={col} className="p-2 border border-stone-200 text-center" style={{
                        backgroundColor: count > 0 ? `rgba(16, 185, 129, ${Math.min(0.3, intensity * 3)})` : 'transparent'
                      }}>
                        <div className="font-medium text-stone-700">{count}</div>
                        {count > 0 && <div className="text-[9px] text-stone-400">{pct}%</div>}
                      </td>
                    );
                  })}
                  <td className="p-2 border border-stone-200 text-center bg-emerald-50/50 font-semibold text-emerald-700">
                    {crossTab.rowTotals[row]}
                  </td>
                </tr>
              ))}
              {/* Column totals */}
              <tr>
                <td className="p-2 border border-stone-200 font-semibold text-emerald-700 bg-emerald-50">Total</td>
                {crossTab.cols.map(col => (
                  <td key={col} className="p-2 border border-stone-200 text-center font-semibold text-emerald-700 bg-emerald-50/50">
                    {crossTab.colTotals[col]}
                  </td>
                ))}
                <td className="p-2 border border-stone-200 text-center font-bold text-emerald-800 bg-emerald-100">
                  {crossTab.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : rowQuestionId && colQuestionId ? (
        <div className="text-center py-8 text-stone-400 text-[12px]">
          No matching data for cross-tabulation / 无匹配的交叉数据
        </div>
      ) : (
        <div className="text-center py-8 text-stone-300 text-[12px]">
          Select two questions above / 请选择上方两个问题
        </div>
      )}
    </div>
  );
};

export default CrossTabAnalysis;
