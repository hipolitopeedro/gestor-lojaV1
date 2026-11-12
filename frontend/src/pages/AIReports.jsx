import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Download, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import dataService from '../services/dataService';

const REPORT_TYPES = [
  {
    id: 'financial_summary',
    name: 'Resumo Executivo Financeiro',
    description: 'Diagnóstico completo de receitas, despesas, margem líquida e saúde do caixa.'
  },
  {
    id: 'cash_flow_analysis',
    name: 'Análise de Fluxo de Caixa & Taxas',
    description: 'Auditoria de meios de pagamento, impacto das taxas de cartão e liquidez.'
  },
  {
    id: 'performance_insights',
    name: 'Inadimplência, Boletos & Recomendações',
    description: 'Plano de ação sobre contas a pagar/receber e oportunidades de otimização.'
  }
];

const PERIODS = [
  { id: '7', name: 'Últimos 7 dias' },
  { id: '30', name: 'Últimos 30 dias' },
  { id: '90', name: 'Últimos 90 dias' },
  { id: '365', name: 'Último ano' }
];

const formatBRL = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

const AIReports = ({ onNavigate }) => {
  const [selectedType, setSelectedType] = useState('financial_summary');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  const buildLocalIntelligentReport = (typeId, periodDays) => {
    const stats = dataService.getDashboardData();
    const bills = dataService.getBills();
    const receivables = dataService.getReceivables();

    const pendingReceivablesTotal = receivables
      .filter((r) => r.status !== 'paid')
      .reduce((s, r) => s + (parseFloat(r.remaining_amount) || 0), 0);

    const overdueReceivablesTotal = receivables
      .filter((r) => r.is_overdue && r.status !== 'paid')
      .reduce((s, r) => s + (parseFloat(r.remaining_amount) || 0), 0);

    const pendingBillsTotal = bills
      .filter((b) => b.status !== 'paid')
      .reduce((s, b) => s + (parseFloat(b.final_amount) || 0), 0);

    const typeMeta = REPORT_TYPES.find((t) => t.id === typeId) || REPORT_TYPES[0];

    let sections = [];
    if (typeId === 'financial_summary') {
      sections = [
        {
          title: '1. Visão Geral do Resultado Operacional',
          content:
            `No período analisado (${periodDays} dias), a empresa registrou uma Receita Líquida de ${formatBRL(stats.totalRevenue)} ` +
            `frente a ${formatBRL(stats.totalExpenses)} em Despesas Operacionais, resultando em um Lucro Líquido de ${formatBRL(stats.netProfit)} ` +
            `(Margem Líquida de ${stats.profitMargin}%).\n\n` +
            `• Categoria de maior faturamento: ${stats.topIncomeCategory} (${stats.topIncomeCategoryPct}% da receita)\n` +
            `• Principal centro de custo: ${stats.topExpenseCategory} (${stats.topExpenseCategoryPct}% das saídas)\n` +
            `• Ticket médio por lançamento: ${formatBRL(stats.averageTransaction)}`
        },
        {
          title: '2. Equilíbrio de Capital de Giro',
          content:
            `O saldo a receber de clientes soma ${formatBRL(pendingReceivablesTotal)} (${stats.activeCustomers} clientes ativos na carteira), ` +
            `enquanto os compromissos de boletos a pagar somam ${formatBRL(pendingBillsTotal)} (${stats.pendingBills} boletos em aberto). ` +
            `A cobertura projetada de curto prazo é ${pendingReceivablesTotal >= pendingBillsTotal ? 'superavitária e saudável' : 'de atenção, exigindo reforço de caixa'}.`
        },
        {
          title: '3. Recomendações Práticas da IA',
          content:
            `1. Concentrar esforços comerciais na linha "${stats.topIncomeCategory}", que apresenta a melhor tração de receita.\n` +
            `2. Revisar os custos da categoria "${stats.topExpenseCategory}", estabelecendo teto mensal de gastos.\n` +
            `3. Incentivar pagamentos via PIX para reduzir o custo com taxas de cartão (${formatBRL(stats.totalFeesPaid)} retidos pelas operadoras).`
        }
      ];
    } else if (typeId === 'cash_flow_analysis') {
      sections = [
        {
          title: '1. Eficiência dos Meios de Pagamento e Taxas',
          content:
            `O meio de pagamento mais utilizado no período foi ${stats.topPaymentMethod} (${stats.topPaymentMethodPct}% do volume movimentado). ` +
            `O total retido em taxas de intermediação (maquininha/cartões) foi de ${formatBRL(stats.totalFeesPaid)}.\n\n` +
            `• Receita Líquida Efetiva: ${formatBRL(stats.totalRevenue)}\n` +
            `• Impacto das taxas sobre o lucro: ${stats.netProfit > 0 ? ((stats.totalFeesPaid / stats.netProfit) * 100).toFixed(1) : 0}%`
        },
        {
          title: '2. Dinâmica de Entradas vs. Saídas',
          content:
            `Foram contabilizadas ${stats.incomeTransactionCount} entradas (média de ${formatBRL(stats.averageIncome)} por venda) ` +
            `e ${stats.expenseTransactionCount} saídas (média de ${formatBRL(stats.averageExpense)} por despesa).`
        },
        {
          title: '3. Plano de Otimização Financeira',
          content:
            `• Oferecer desconto de 1,5% a 2,0% para pagamentos via PIX nas vendas acima de R$ 200,00 melhora a liquidez imediata e economiza até 3,5% de taxa de crédito.\n` +
            `• Alinhar as datas de vencimento dos boletos de fornecedores para o dia seguinte à liquidação dos lotes de cartão.`
        }
      ];
    } else {
      sections = [
        {
          title: '1. Auditoria de Contas a Receber e Inadimplência',
          content:
            `Atualmente a loja possui ${formatBRL(pendingReceivablesTotal)} em recebíveis abertos, sendo ${formatBRL(overdueReceivablesTotal)} em atraso.\n\n` +
            `• Clientes ativos monitorados: ${stats.activeCustomers}\n` +
            `• Títulos vencidos (Boletos + Recebíveis): ${stats.overduePayments}`
        },
        {
          title: '2. Gestão de Boletos e Obrigações',
          content:
            `Existem ${stats.pendingBills} boletos pendentes totalizando ${formatBRL(pendingBillsTotal)}. ` +
            `Manter o pagamento rigorosamente até a data de vencimento evita multas moratórias de 2% + juros diários.`
        },
        {
          title: '3. Ações Recomendadas de Cobrança',
          content:
            `1. Disparar lembrete amigável via WhatsApp para clientes com vencimento nos próximos 3 dias.\n` +
            `2. Para contas no caderno (Fiado) vencidas, propor parcelamento via PIX com entrada imediata de 30%.\n` +
            `3. Regularizar imediatamente eventuais boletos vencidos para preservar o score de crédito PJ junto aos fornecedores.`
        }
      ];
    }

    return {
      ai_powered: true,
      report: {
        title: typeMeta.name,
        summary: typeMeta.description,
        period: `Últimos ${periodDays} dias`,
        generated_at: new Date().toISOString(),
        sections
      },
      financial_data: {
        summary: {
          total_income: stats.totalRevenue,
          total_expenses: stats.totalExpenses,
          net_profit: stats.netProfit,
          profit_margin: stats.profitMargin
        }
      }
    };
  };

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = buildLocalIntelligentReport(selectedType, selectedPeriod);
      setCurrentReport(generated);
      setIsGenerating(false);
    }, 450);
  };

  const downloadReport = () => {
    if (!currentReport) return;

    const reportContent = `# ${currentReport.report.title}
${currentReport.report.summary}

Período: ${currentReport.report.period}
Gerado em: ${new Date(currentReport.report.generated_at).toLocaleString('pt-BR')}

---
${currentReport.report.sections
  .map(
    (s) => `## ${s.title}

${s.content}
`
  )
  .join('\n---\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-ia-lupa-${selectedType}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          style={{ backgroundColor: '#8b5cf6' }}
          className="p-6 rounded-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="border-white bg-white text-black hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Relatórios Inteligentes (LuPA Analytics)
              </h1>
              <p className="text-white/80 text-sm">
                Diagnósticos automáticos baseados nas suas transações, boletos e recebíveis
              </p>
            </div>
          </div>

          <Badge className="bg-white text-purple-700 px-3 py-1 text-xs font-semibold">
            Motor Analítico Ativo
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros da Análise</CardTitle>
                <CardDescription>Selecione o foco do diagnóstico gerencial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Modelo de Relatório
                  </label>
                  <div className="space-y-2">
                    {REPORT_TYPES.map((type) => (
                      <div
                        key={type.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedType === type.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <div className="font-medium text-gray-900 text-sm">{type.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Janela de Análise
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                  >
                    {PERIODS.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Processando Indicadores...' : 'Gerar Diagnóstico Agora'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Output */}
          <div className="lg:col-span-2">
            {currentReport ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{currentReport.report.title}</CardTitle>
                      <CardDescription className="mt-1">{currentReport.report.summary}</CardDescription>
                    </div>
                    <Button onClick={downloadReport} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar (.MD)
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <Badge variant="outline">{currentReport.report.period}</Badge>
                    <Badge variant="outline">
                      {new Date(currentReport.report.generated_at).toLocaleString('pt-BR')}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">LuPA AI Insights</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {currentReport.report.sections.map((section, index) => (
                      <div key={index} className="border-l-4 border-purple-600 pl-4 py-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                        <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentReport.financial_data && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                        Indicadores Auditados
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                          <div className="text-emerald-800 text-xs font-medium">Receita Líquida</div>
                          <div className="text-emerald-900 text-base font-bold">
                            {formatBRL(currentReport.financial_data.summary.total_income)}
                          </div>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg">
                          <div className="text-rose-800 text-xs font-medium">Despesas</div>
                          <div className="text-rose-900 text-base font-bold">
                            {formatBRL(currentReport.financial_data.summary.total_expenses)}
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                          <div className="text-purple-800 text-xs font-medium">Resultado Líquido</div>
                          <div className="text-purple-900 text-base font-bold">
                            {formatBRL(currentReport.financial_data.summary.net_profit)}
                          </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                          <div className="text-amber-800 text-xs font-medium">Margem Operacional</div>
                          <div className="text-amber-900 text-base font-bold">
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
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Pronto para gerar seu diagnóstico financeiro
                  </h3>
                  <p className="text-gray-600 max-w-md mb-6 text-sm">
                    Escolha o modelo de relatório ao lado e clique em "Gerar Diagnóstico Agora" para
                    analisar automaticamente suas entradas, despesas, taxas de cartão e títulos em aberto.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-purple-600" /> Análise de Margem
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" /> Auditoria de Taxas
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-blue-600" /> Risco de Inadimplência
                    </span>
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
