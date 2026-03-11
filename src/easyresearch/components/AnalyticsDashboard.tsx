import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle, Download, Clock, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import CustomDropdown from './CustomDropdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  dropoffRate: number;
  responsesByDay: { date: string; count: number }[];
  questionMetrics: { question: string; responses: number; avgTime: number }[];
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalResponses: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    dropoffRate: 0,
    responsesByDay: [],
    questionMetrics: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadAnalytics();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data: researcherData } = await supabase
        .from('researcher')
        .select('organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (researcherData) {
        const { data: projectsData } = await supabase
          .from('research_project')
          .select('id, title')
          .eq('organization_id', researcherData.organization_id);

        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
          setSelectedProject(projectsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load responses with correct schema
      const { data: responses } = await supabase
        .from('survey_response')
        .select('id, created_at, enrollment_id, question_id, instance_id, response_text, response_value')
        .eq('project_id', selectedProject);

      const questionIds = Array.from(new Set((responses || []).map((r: any) => r.question_id).filter(Boolean)));
      const { data: questionsData } = questionIds.length
        ? await supabase
            .from('question')
            .select('id, question_text')
            .in('id', questionIds)
        : { data: [] as any[] };
      const questionTextById = new Map((questionsData || []).map((q: any) => [q.id, q.question_text]));

      // Load enrollments for completion rate calculation
      const { data: enrollments } = await supabase
        .from('enrollment')
        .select('id, status, created_at')
        .eq('project_id', selectedProject);

      // Calculate real metrics
      const totalResponses = responses?.length || 0;
      
      // Calculate completion rate from enrollments
      let completionRate = 0;
      let avgCompletionTime = 0;
      
      if (enrollments && enrollments.length > 0) {
        const enrollmentIdsWithResponses = new Set(responses?.map(r => r.enrollment_id).filter(Boolean));
        completionRate = Math.round((enrollmentIdsWithResponses.size / enrollments.length) * 100);
      }
      
      // Calculate dropoff rate (started but not completed)
      const dropoffRate = Math.max(0, 100 - completionRate);
      
      // Group by question
      const questionGroups = (responses || []).reduce((acc: any, response: any) => {
        const questionText = questionTextById.get(response.question_id) || 'Unknown';
        if (!acc[questionText]) {
          acc[questionText] = {
            question: questionText,
            responses: 0
          };
        }
        acc[questionText].responses++;
        return acc;
      }, {});

      const questionMetrics = Object.values(questionGroups).map((q: any) => ({
        question: q.question,
        responses: q.responses,
        avgTime: 0 // We don't track per-question time
      }));

      // Group by day
      const dayGroups = (responses || []).reduce((acc: any, response: any) => {
        const date = new Date(response.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {});

      const responsesByDay = Object.entries(dayGroups)
        .map(([date, count]) => ({
          date,
          count: count as number
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAnalytics({
        totalResponses,
        completionRate,
        avgCompletionTime,
        dropoffRate,
        responsesByDay,
        questionMetrics
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'json' | 'xlsx' | 'pdf' = 'csv') => {
    const data = {
      summary: {
        totalResponses: analytics.totalResponses,
        completionRate: analytics.completionRate,
        avgCompletionTime: analytics.avgCompletionTime,
        dropoffRate: analytics.dropoffRate
      },
      responsesByDay: analytics.responsesByDay,
      questionMetrics: analytics.questionMetrics
    };

    if (format === 'csv') {
      const csvContent = [
        ['Question', 'Responses', 'Avg Time (seconds)'],
        ...analytics.questionMetrics.map(q => [q.question, q.responses, q.avgTime])
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey-analytics.csv';
      a.click();
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey-analytics.json';
      a.click();
    } else if (format === 'xlsx') {
      // Generate XLSX using XML spreadsheet format (works without external libraries)
      const escapeXml = (str: string) => String(str).replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c] || c));
      const rows = [
        ['Survey Analytics Report'],
        [''],
        ['Summary Metrics'],
        ['Total Responses', analytics.totalResponses],
        ['Completion Rate', `${analytics.completionRate}%`],
        ['Avg Completion Time', `${analytics.avgCompletionTime} min`],
        ['Drop-off Rate', `${analytics.dropoffRate}%`],
        [''],
        ['Question Performance'],
        ['Question', 'Responses', 'Avg Time (s)'],
        ...analytics.questionMetrics.map(q => [q.question, q.responses, q.avgTime]),
        [''],
        ['Responses by Day'],
        ['Date', 'Responses'],
        ...analytics.responsesByDay.map(d => [d.date, d.count])
      ];
      
      let xlsContent = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
      xlsContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
      xlsContent += '<Worksheet ss:Name="Analytics"><Table>';
      rows.forEach(row => {
        xlsContent += '<Row>';
        row.forEach(cell => {
          const type = typeof cell === 'number' ? 'Number' : 'String';
          xlsContent += `<Cell><Data ss:Type="${type}">${escapeXml(String(cell))}</Data></Cell>`;
        });
        xlsContent += '</Row>';
      });
      xlsContent += '</Table></Worksheet></Workbook>';
      
      const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey-analytics.xls';
      a.click();
    } else if (format === 'pdf') {
      // Generate printable HTML and trigger print dialog
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Survey Analytics Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
            h1 { color: #10b981; margin-bottom: 20px; }
            h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 15px 25px; background: #f9fafb; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #10b981; }
            .metric-label { font-size: 12px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 600; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>Survey Analytics Report</h1>
          <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
          
          <h2>Summary Metrics</h2>
          <div class="metric"><div class="metric-value">${analytics.totalResponses}</div><div class="metric-label">Total Responses</div></div>
          <div class="metric"><div class="metric-value">${analytics.completionRate}%</div><div class="metric-label">Completion Rate</div></div>
          <div class="metric"><div class="metric-value">${analytics.avgCompletionTime} min</div><div class="metric-label">Avg Time</div></div>
          <div class="metric"><div class="metric-value">${analytics.dropoffRate}%</div><div class="metric-label">Drop-off Rate</div></div>
          
          <h2>Question Performance</h2>
          <table>
            <thead><tr><th>Question</th><th>Responses</th><th>Avg Time</th></tr></thead>
            <tbody>${analytics.questionMetrics.map(q => `<tr><td>${q.question}</td><td>${q.responses}</td><td>${q.avgTime}s</td></tr>`).join('')}</tbody>
          </table>
          
          <h2>Responses by Day</h2>
          <table>
            <thead><tr><th>Date</th><th>Responses</th></tr></thead>
            <tbody>${analytics.responsesByDay.map(d => `<tr><td>${d.date}</td><td>${d.count}</td></tr>`).join('')}</tbody>
          </table>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
        </div>
    );
  }

  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Analytics Dashboard
              </h1>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                Track your survey performance and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CustomDropdown
                options={projects.map(project => ({
                  value: project.id,
                  label: project.title
                }))}
                value={selectedProject}
                onChange={(value) => setSelectedProject(value)}
                placeholder="Select project"
                className="w-64"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-opacity-80 text-sm"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}
                >
                  <FileSpreadsheet size={14} />
                  CSV
                </button>
                <button
                  onClick={() => exportData('xlsx')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-opacity-80 text-sm"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}
                >
                  <FileSpreadsheet size={14} />
                  Excel
                </button>
                <button
                  onClick={() => exportData('pdf')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-opacity-80 text-sm"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}
                >
                  <FileText size={14} />
                  PDF
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-opacity-80 text-sm"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}
                >
                  <FileText size={14} />
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.totalResponses}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Total Responses
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle style={{ color: 'var(--color-green)' }} size={24} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.completionRate}%
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Completion Rate
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <Clock style={{ color: 'var(--color-green)' }} size={24} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.avgCompletionTime} min
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Avg. Completion Time
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <Users style={{ color: 'var(--color-green)' }} size={24} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.dropoffRate}%
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Drop-off Rate
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Trend - Real Recharts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Response Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.responsesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => value.split('/')[0]}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Question Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Question Performance
            </h3>
            <div className="space-y-3">
              {analytics.questionMetrics.slice(0, 5).map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                      {metric.question}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {metric.responses} responses
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(metric.responses / Math.max(...analytics.questionMetrics.map(m => m.responses))) * 100}%`,
                        backgroundColor: 'var(--color-green)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
  );
};

export default AnalyticsDashboard;
