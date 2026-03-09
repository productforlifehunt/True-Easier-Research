import React, { useState, useMemo } from 'react';
import { MousePointer, Layers, TreePine, Grid3x3, Eye } from 'lucide-react';

// UX Research Result Visualizers — Aggregated Heatmaps, Card Sort Dendograms, Tree Test Paths
// UX 研究结果可视化器 — 聚合热图、卡片分类树状图、树状测试路径分析

interface Props {
  questions: any[];
  responses: any[];
}

type UXViewType = 'heatmap' | 'card_sort' | 'tree_test' | 'first_click' | 'five_second';

const UXResearchVisualizer: React.FC<Props> = ({ questions, responses }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [activeView, setActiveView] = useState<UXViewType>('heatmap');

  // Get UX research question types / 获取 UX 研究问题类型
  const uxQuestions = useMemo(() => {
    const uxTypes = ['heatmap', 'first_click', 'card_sort', 'tree_test', 'five_second_test', 'preference_test'];
    return questions.filter((q: any) => uxTypes.includes(q.question_type));
  }, [questions]);

  const selectedQ = uxQuestions.find((q: any) => q.id === selectedQuestion);
  const qResponses = useMemo(() => {
    return responses.filter(r => r.question_id === selectedQuestion);
  }, [responses, selectedQuestion]);

  // === HEATMAP / FIRST CLICK AGGREGATION === / 热图/首次点击聚合
  const renderClickAggregation = () => {
    const imageUrl = selectedQ?.question_config?.test_image_url;
    // Parse click data from responses
    const allClicks: { x: number; y: number; timestamp?: number }[] = [];
    qResponses.forEach(r => {
      try {
        const val = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
        if (Array.isArray(val)) {
          val.forEach((click: any) => {
            if (click.x !== undefined && click.y !== undefined) {
              allClicks.push({ x: click.x, y: click.y, timestamp: click.timestamp });
            }
          });
        } else if (val?.x !== undefined && val?.y !== undefined) {
          allClicks.push({ x: val.x, y: val.y });
        }
      } catch { /* ignore */ }
    });

    // Generate heatmap grid / 生成热图网格
    const gridSize = 20; // 20x20 grid
    const heatGrid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const maxCount = { value: 0 };

    allClicks.forEach(click => {
      const gx = Math.min(gridSize - 1, Math.max(0, Math.floor(click.x / 100 * gridSize)));
      const gy = Math.min(gridSize - 1, Math.max(0, Math.floor(click.y / 100 * gridSize)));
      heatGrid[gy][gx]++;
      if (heatGrid[gy][gx] > maxCount.value) maxCount.value = heatGrid[gy][gx];
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {allClicks.length} clicks from {qResponses.length} participants / {allClicks.length} 次点击，{qResponses.length} 位参与者
          </div>
        </div>

        <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
          {imageUrl ? (
            <img src={imageUrl} alt="Test image" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No test image / 无测试图片
            </div>
          )}
          
          {/* Heatmap overlay / 热图覆盖层 */}
          <div className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
            {heatGrid.flatMap((row, y) =>
              row.map((count, x) => {
                const intensity = maxCount.value > 0 ? count / maxCount.value : 0;
                return (
                  <div
                    key={`${x}-${y}`}
                    className="transition-colors"
                    style={{
                      backgroundColor: intensity > 0
                        ? `rgba(239, 68, 68, ${intensity * 0.7})`
                        : 'transparent',
                      borderRadius: '2px',
                    }}
                    title={count > 0 ? `${count} clicks` : ''}
                  />
                );
              })
            )}
          </div>

          {/* Individual click dots / 单个点击点 */}
          {allClicks.map((click, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-red-500 border border-red-700 opacity-60"
              style={{
                left: `${click.x}%`,
                top: `${click.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Click distribution stats / 点击分布统计 */}
        <div className="grid grid-cols-4 gap-3">
          {(() => {
            const quadrants = [
              { name: 'Top-Left / 左上', clicks: allClicks.filter(c => c.x < 50 && c.y < 50).length },
              { name: 'Top-Right / 右上', clicks: allClicks.filter(c => c.x >= 50 && c.y < 50).length },
              { name: 'Bottom-Left / 左下', clicks: allClicks.filter(c => c.x < 50 && c.y >= 50).length },
              { name: 'Bottom-Right / 右下', clicks: allClicks.filter(c => c.x >= 50 && c.y >= 50).length },
            ];
            return quadrants.map(q => (
              <div key={q.name} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-foreground">{q.clicks}</div>
                <div className="text-xs text-muted-foreground">{q.name}</div>
                <div className="text-xs text-muted-foreground">
                  {allClicks.length > 0 ? Math.round((q.clicks / allClicks.length) * 100) : 0}%
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  };

  // === CARD SORT ANALYSIS === / 卡片分类分析
  const renderCardSortAnalysis = () => {
    // Parse card sort results / 解析卡片分类结果
    const categoryMap: Record<string, Record<string, number>> = {};
    // categoryMap[card][category] = count

    qResponses.forEach(r => {
      try {
        const val = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
        if (val && typeof val === 'object') {
          Object.entries(val).forEach(([category, cards]: [string, any]) => {
            const cardList = Array.isArray(cards) ? cards : [cards];
            cardList.forEach((card: string) => {
              if (!categoryMap[card]) categoryMap[card] = {};
              categoryMap[card][category] = (categoryMap[card][category] || 0) + 1;
            });
          });
        }
      } catch { /* ignore */ }
    });

    const cards = Object.keys(categoryMap);
    const allCategories = [...new Set(cards.flatMap(c => Object.keys(categoryMap[c])))];

    // Similarity matrix / 相似度矩阵
    const similarity: Record<string, Record<string, number>> = {};
    cards.forEach(c1 => {
      similarity[c1] = {};
      cards.forEach(c2 => {
        if (c1 === c2) { similarity[c1][c2] = 1; return; }
        // Jaccard similarity based on co-categorization
        let sameCategory = 0;
        let totalPairs = qResponses.length;
        qResponses.forEach(r => {
          try {
            const val = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
            if (val) {
              const c1Cat = Object.entries(val).find(([_, cards]: [string, any]) => 
                (Array.isArray(cards) ? cards : [cards]).includes(c1)
              )?.[0];
              const c2Cat = Object.entries(val).find(([_, cards]: [string, any]) => 
                (Array.isArray(cards) ? cards : [cards]).includes(c2)
              )?.[0];
              if (c1Cat && c2Cat && c1Cat === c2Cat) sameCategory++;
            }
          } catch { /* ignore */ }
        });
        similarity[c1][c2] = totalPairs > 0 ? Math.round((sameCategory / totalPairs) * 100) : 0;
      });
    });

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {cards.length} cards, {allCategories.length} categories, {qResponses.length} participants / 
          {cards.length} 张卡片，{allCategories.length} 个分类，{qResponses.length} 位参与者
        </div>

        {/* Standardized categorization table / 标准化分类表 */}
        <div className="border border-border rounded-lg overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground">Card / 卡片</th>
                {allCategories.map(cat => (
                  <th key={cat} className="p-2 text-center text-xs font-medium text-muted-foreground">{cat}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card} className="border-t border-border">
                  <td className="p-2 font-medium text-foreground whitespace-nowrap">{card}</td>
                  {allCategories.map(cat => {
                    const count = categoryMap[card]?.[cat] || 0;
                    const pct = qResponses.length > 0 ? Math.round((count / qResponses.length) * 100) : 0;
                    return (
                      <td key={cat} className="p-2 text-center">
                        {count > 0 ? (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-mono"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.min(pct / 100, 0.6)})`,
                              color: pct > 40 ? 'white' : 'inherit',
                            }}
                          >
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Similarity Matrix / 相似度矩阵 */}
        {cards.length > 1 && cards.length <= 15 && (
          <div>
            <div className="text-sm font-medium text-foreground mb-2">Similarity Matrix / 相似度矩阵</div>
            <div className="border border-border rounded-lg overflow-auto max-h-96">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-1.5 text-left font-medium text-muted-foreground"></th>
                    {cards.map(c => (
                      <th key={c} className="p-1.5 text-center font-medium text-muted-foreground writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxWidth: '30px' }}>
                        {c.slice(0, 12)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cards.map(c1 => (
                    <tr key={c1} className="border-t border-border">
                      <td className="p-1.5 font-medium text-foreground whitespace-nowrap">{c1.slice(0, 15)}</td>
                      {cards.map(c2 => {
                        const sim = similarity[c1]?.[c2] || 0;
                        return (
                          <td key={c2} className="p-1 text-center">
                            <span
                              className="inline-block w-7 h-7 leading-7 rounded text-[10px]"
                              style={{
                                backgroundColor: c1 === c2 ? 'hsl(var(--muted))' : `rgba(16, 185, 129, ${sim / 100})`,
                                color: sim > 50 ? 'white' : 'inherit',
                              }}
                            >
                              {c1 === c2 ? '—' : sim}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // === TREE TEST PATH ANALYSIS === / 树状测试路径分析
  const renderTreeTestAnalysis = () => {
    const taskDescription = selectedQ?.question_config?.task_description || '';
    const correctAnswer = selectedQ?.question_config?.correct_answer || '';

    let successCount = 0;
    let directSuccessCount = 0;
    const pathFrequency: Record<string, number> = {};
    const timeToComplete: number[] = [];

    qResponses.forEach(r => {
      try {
        const val = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
        if (val) {
          const selectedPath = val.selected_path || val.answer || String(val);
          const path = val.path || [selectedPath];
          const pathStr = Array.isArray(path) ? path.join(' → ') : String(path);
          pathFrequency[pathStr] = (pathFrequency[pathStr] || 0) + 1;

          if (selectedPath === correctAnswer || (val.correct === true)) {
            successCount++;
            if (Array.isArray(path) && path.length <= 2) directSuccessCount++;
          }
          if (val.time_seconds) timeToComplete.push(val.time_seconds);
        }
      } catch { /* ignore */ }
    });

    const totalRespondents = qResponses.length;
    const successRate = totalRespondents > 0 ? Math.round((successCount / totalRespondents) * 100) : 0;
    const directness = successCount > 0 ? Math.round((directSuccessCount / successCount) * 100) : 0;
    const avgTime = timeToComplete.length > 0 ? Math.round(timeToComplete.reduce((a, b) => a + b, 0) / timeToComplete.length) : 0;

    const sortedPaths = Object.entries(pathFrequency).sort((a, b) => b[1] - a[1]);

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Task: "{taskDescription}" | Correct: "{correctAnswer}" | {totalRespondents} participants
        </div>

        {/* Key metrics / 关键指标 */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Success Rate / 成功率', value: `${successRate}%`, color: successRate >= 70 ? 'text-green-600' : successRate >= 40 ? 'text-amber-600' : 'text-red-600' },
            { label: 'Direct Success / 直接成功', value: `${directness}%`, color: 'text-blue-600' },
            { label: 'Avg Time / 平均用时', value: `${avgTime}s`, color: 'text-purple-600' },
            { label: 'Total Paths / 总路径', value: String(sortedPaths.length), color: 'text-muted-foreground' },
          ].map(m => (
            <div key={m.label} className="bg-card border border-border rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Path frequency table / 路径频率表 */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="text-sm font-medium text-foreground p-3 bg-muted/50">Navigation Paths / 导航路径</div>
          <div className="max-h-64 overflow-y-auto">
            {sortedPaths.map(([path, count], i) => {
              const pct = totalRespondents > 0 ? Math.round((count / totalRespondents) * 100) : 0;
              const isCorrect = path.includes(correctAnswer);
              return (
                <div key={i} className="flex items-center gap-3 p-3 border-t border-border hover:bg-muted/30">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 text-sm text-foreground font-mono text-xs">{path}</div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground">{count}</span>
                    <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCorrect ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // === 5-SECOND TEST RECALL ANALYSIS === / 5秒测试回忆分析
  const renderFiveSecondAnalysis = () => {
    const recallTexts = qResponses.map(r => r.response_text).filter(Boolean);
    // Simple word frequency for recall analysis
    const wordFreq: Record<string, number> = {};
    recallTexts.forEach(text => {
      text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff\s]/g, '').split(/\s+/).forEach((word: string) => {
        if (word.length > 2) wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });
    const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const maxFreq = topWords.length > 0 ? topWords[0][1] : 1;

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">{recallTexts.length} recall responses / {recallTexts.length} 条回忆回复</div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-foreground mb-3">Most Recalled Words / 最常回忆的词</div>
          <div className="flex flex-wrap gap-2">
            {topWords.map(([word, count]) => (
              <span
                key={word}
                className="px-2 py-1 rounded bg-primary/10 text-primary"
                style={{ fontSize: `${Math.max(12, Math.min(24, 12 + (count / maxFreq) * 12))}px` }}
              >
                {word} <span className="text-xs opacity-60">({count})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
          {recallTexts.slice(0, 30).map((text, i) => (
            <div key={i} className="p-2 border-b border-border last:border-0 text-xs text-muted-foreground">{text}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Eye className="w-5 h-5" />
          UX Research Results / UX 研究结果
        </h3>
      </div>

      {uxQuestions.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No UX research questions found / 未找到 UX 研究问题。
          Add heatmap, card sort, tree test, or first click questions to see results here.
        </div>
      ) : (
        <>
          <select
            value={selectedQuestion}
            onChange={e => setSelectedQuestion(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">Select UX question / 选择 UX 问题...</option>
            {uxQuestions.map((q: any) => (
              <option key={q.id} value={q.id}>
                [{q.question_type}] {q.question_text?.slice(0, 60) || 'Untitled'}
                ({responses.filter(r => r.question_id === q.id).length} responses)
              </option>
            ))}
          </select>

          {selectedQ && (
            <div className="bg-card border border-border rounded-lg p-4">
              {['heatmap', 'first_click'].includes(selectedQ.question_type) && renderClickAggregation()}
              {selectedQ.question_type === 'card_sort' && renderCardSortAnalysis()}
              {selectedQ.question_type === 'tree_test' && renderTreeTestAnalysis()}
              {selectedQ.question_type === 'five_second_test' && renderFiveSecondAnalysis()}
              {selectedQ.question_type === 'preference_test' && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">{qResponses.length} responses / 回复</div>
                  {(() => {
                    const counts: Record<string, number> = {};
                    qResponses.forEach(r => {
                      const val = r.response_text || r.response_value;
                      if (val) counts[String(val)] = (counts[String(val)] || 0) + 1;
                    });
                    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([variant, count]) => (
                      <div key={variant} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground flex-1">{variant}</span>
                        <span className="font-mono text-sm">{count}</span>
                        <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${qResponses.length > 0 ? (count / qResponses.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{qResponses.length > 0 ? Math.round((count / qResponses.length) * 100) : 0}%</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UXResearchVisualizer;
