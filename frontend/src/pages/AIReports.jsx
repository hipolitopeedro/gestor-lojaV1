import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const AIReports = ({ onNavigate }) => {
  const { credentials } = useAuth();
  const [reportTypes, setReportTypes] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedType, setSelectedType] = useState('financial_summary');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);

  useEffect(() => {
    loadReportTypes();
    checkAiHealth();
  }, []);

  const loadReportTypes = async () => {
    try {
      const response = await fetch('/api/ai-reports/types', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportTypes(data.report_types);
        setPeriods(data.periods);
      }
    } catch (error) {
      console.error('Error loading report types:', error);
      // Set default values if API fails
      setReportTypes([
        {
          id: 'financial_summary',
          name: 'Resumo Financeiro',
          description: 'Relatório executivo com visão geral do desempenho financeiro',
          icon: '📊'
        },
        {
          id: 'cash_flow_analysis',
          name: 'Análise de Fluxo de Caixa',
          description: 'Análise detalhada de entradas e saídas de caixa',
          icon: '💰'
        },
        {
          id: 'performance_insights',
          name: 'Insights de Performance',
          description: 'Análise avançada de KPIs e oportunidades de melhoria',
          icon: '🎯'
        }
      ]);
      setPeriods([
        { id: '7', name: 'Últimos 7 dias' },
        { id: '30', name: 'Últimos 30 dias' },
        { id: '90', name: 'Últimos 90 dias' },
        { id: '365', name: 'Último ano' }
      ]);
    }
  };

  const checkAiHealth = async () => {
    try {
      const response = await fetch('/api/ai-reports/health', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAiHealth(data);
      }
    } catch (error) {
      console.error('Error checking AI health:', error);
      setAiHealth({ status: 'mock_mode', gemini_available: false });
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
          report_type: selectedType,
          period: selectedPeriod,
          custom_prompt: customPrompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentReport(data);
      } else {
        alert('Erro ao gerar relatório. Tente novamente.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório. Verifique sua conexão.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!currentReport) return;

    const reportContent = `
# ${currentReport.report.title}

${currentReport.report.summary}

---

${currentReport.report.sections.map(section => `
## ${section.title}

${section.content}
`).join('\n---\n')}

---

**Relatório gerado em:** ${new Date(currentReport.report.generated_at).toLocaleString('pt-BR')}
**Período analisado:** ${currentReport.report.period}
                **Powered by:** ${currentReport.ai_powered ? 'Google Gemini AI' : 'LuPA Analytics'}
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${currentReport.report.period}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2"
            >
              ← Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                🤖 Relatórios com IA
              </h1>
              <p className="text-gray-600">Análises inteligentes dos seus dados financeiros</p>
            </div>
          </div>
          
          {aiHealth && (
            <div className="flex items-center gap-2">
              <Badge variant={aiHealth.status === 'healthy' ? 'success' : 'secondary'}>
                {aiHealth.status === 'healthy' ? '🟢 Gemini AI Ativo' : '🟡 Modo Demo'}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configurações do Relatório</CardTitle>
                <CardDescription>
                  Configure os parâmetros para gerar seu relatório personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Relatório
                  </label>
                  <div className="space-y-2">
                    {reportTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedType === type.id
                            ? 'lupa-border-primary bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{type.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{type.name}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Period Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período de Análise
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md lupa-input"
                  >
                    {periods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Prompt for Custom Reports */}
                {selectedType === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt Personalizado
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Descreva que tipo de análise você gostaria de receber..."
                      className="w-full p-3 border border-gray-300 rounded-md lupa-input"
                      rows={4}
                    />
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full lupa-btn-primary"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Gerando Relatório...
                    </div>
                  ) : (
                    '🚀 Gerar Relatório com IA'
                  )}
                </Button>

                {/* AI Info */}
                <div className="p-3 bg-violet-50 rounded-lg border lupa-border-primary">
                  <div className="flex items-center gap-2 lupa-text-primary text-sm font-medium mb-1">
                    🤖 Powered by AI
                  </div>
                  <p className="text-violet-700 text-xs">
                    {aiHealth?.status === 'healthy' 
                      ? 'Relatórios gerados com Google Gemini AI para análises avançadas e insights personalizados.'
                      : 'Demonstração com relatórios inteligentes baseados em seus dados financeiros.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Display */}
          <div className="lg:col-span-2">
            {currentReport ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{currentReport.report.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {currentReport.report.summary}
                      </CardDescription>
                    </div>
                    <Button onClick={downloadReport} variant="outline">
                      📥 Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <Badge variant="outline">
                      📅 {currentReport.report.period}
                    </Badge>
                    <Badge variant="outline">
                      🕒 {new Date(currentReport.report.generated_at).toLocaleString('pt-BR')}
                    </Badge>
                    <Badge variant={currentReport.ai_powered ? 'success' : 'secondary'}>
                      {currentReport.ai_powered ? '🤖 Gemini AI' : '📊 Analytics'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-8">
                    {currentReport.report.sections.map((section, index) => (
                      <div key={index} className="border-l-4 lupa-border-primary pl-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Data Summary */}
                  {currentReport.financial_data && (
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📊 Dados Utilizados na Análise
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="lupa-metric-positive p-3 rounded-lg">
                          <div className="text-emerald-800 text-sm font-medium">Receitas</div>
                          <div className="text-emerald-900 text-lg font-bold">
                            R$ {currentReport.financial_data.summary.total_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="lupa-metric-negative p-3 rounded-lg">
                          <div className="text-rose-800 text-sm font-medium">Despesas</div>
                          <div className="text-rose-900 text-lg font-bold">
                            R$ {currentReport.financial_data.summary.total_expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="lupa-metric-positive p-3 rounded-lg">
                          <div className="text-emerald-800 text-sm font-medium">Lucro</div>
                          <div className="text-emerald-900 text-lg font-bold">
                            R$ {currentReport.financial_data.summary.net_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="lupa-metric-neutral p-3 rounded-lg">
                          <div className="text-orange-800 text-sm font-medium">Margem</div>
                          <div className="text-orange-900 text-lg font-bold">
                            {currentReport.financial_data.summary.profit_margin.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Pronto para gerar seu relatório?
                  </h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    Configure os parâmetros ao lado e clique em "Gerar Relatório com IA" 
                    para receber análises inteligentes dos seus dados financeiros.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>📊</span>
                      <span>Análise Completa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🎯</span>
                      <span>Insights Personalizados</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📈</span>
                      <span>Recomendações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReports;

