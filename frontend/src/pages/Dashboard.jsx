import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  RefreshCw,
  AlertCircle,
  Clock,
  Users,
  ShoppingCart,
  Target,
  Activity,
  LogOut,
  Sparkles,
  Database
} from 'lucide-react';
import dataService from '@/services/dataService';
import { generateFinancialReportPDF } from '@/utils/pdfExporter';

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#fb7185', '#3b82f6', '#ec4899'];

const Dashboard = ({ onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    pendingBills: 0,
    overduePayments: 0,
    activeCustomers: 0,
    monthlyGrowth: 0,
    transactionCount: 0,
    averageTransaction: 0,
    topCategory: 'N/A',
    topPaymentMethod: 'N/A'
  });

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [dailyTransactions, setDailyTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const data = dataService.getDashboardData();
      setDashboardData(data);

      const monthlyData = dataService.getMonthlyData();
      setMonthlyRevenueData(monthlyData);

      const dailyData = dataService.getDailyData();
      setDailyTransactions(dailyData);

      const categorySource = data.expenseCategoryStats || {};
      const categoryData = Object.entries(categorySource).map(([name, value], idx) => ({
        name,
        value,
        color: CHART_COLORS[idx % CHART_COLORS.length]
      }));
      setExpenseCategories(categoryData);

      const totalVolume = (data.totalRevenue || 0) + (data.totalExpenses || 0);
      const paymentData = Object.entries(data.paymentMethodStats || {}).map(([method, amount]) => ({
        method,
        amount,
        percentage: totalVolume > 0 ? Math.round((amount / totalVolume) * 100) : 0,
        growth: '+4.2%'
      }));
      setPaymentMethods(paymentData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      loadDashboardData();
      setIsLoading(false);
    }, 300);
  };

  const handleResetDemo = () => {
    dataService.resetToDemoData();
    loadDashboardData();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value) || 0);
  };

  const handleExportPDF = () => {
    try {
      generateFinancialReportPDF(dashboardData);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div
            className={`flex items-center text-xs mt-1 ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen lupa-bg-background">
      {/* Header */}
      <header className="lupa-bg-primary shadow-sm border-b lupa-border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-white mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-white">LuPA</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">
                Olá, <span className="font-medium">Gestor Demo</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('landing')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate('income')}
            >
              <Receipt className="h-4 w-4 mb-1" />
              Entradas
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate('expense')}
            >
              <CreditCard className="h-4 w-4 mb-1" />
              Despesas
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate('billpayment')}
            >
              <ShoppingCart className="h-4 w-4 mb-1" />
              Boletos ({dashboardData.pendingBills})
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate('receivables')}
            >
              <Users className="h-4 w-4 mb-1" />
              A Receber
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs col-span-2 md:col-span-1"
              onClick={() => onNavigate('aireports')}
            >
              <Sparkles className="h-4 w-4 mb-1" />
              Relatórios IA
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <p className="text-gray-600 mt-1">Visão consolidada de fluxo de caixa, boletos e recebíveis</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>

            <Button variant="outline" size="sm" onClick={handleResetDemo} title="Recarregar dados de demonstração">
              <Database className="h-4 w-4 mr-2" />
              Restaurar Demo
            </Button>

            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Button size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Líquida Total"
            value={formatCurrency(dashboardData.totalRevenue)}
            change={`${dashboardData.incomeTransactionCount} entradas registradas`}
            icon={DollarSign}
            trend="up"
          />
          <MetricCard
            title="Despesas Totais"
            value={formatCurrency(dashboardData.totalExpenses)}
            change={`${dashboardData.expenseTransactionCount} saídas registradas`}
            icon={CreditCard}
            trend="down"
          />
          <MetricCard
            title="Lucro Líquido"
            value={formatCurrency(dashboardData.netProfit)}
            change={dashboardData.netProfit >= 0 ? 'Resultado operacional positivo' : 'Atenção ao fluxo de caixa'}
            icon={TrendingUp}
            trend={dashboardData.netProfit >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Margem de Lucro"
            value={`${dashboardData.profitMargin}%`}
            change={`Meio principal: ${dashboardData.topPaymentMethod}`}
            icon={Target}
            trend="up"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Clientes Ativos (Recebíveis)"
            value={dashboardData.activeCustomers}
            change="Caderno / Faturas / Máquina"
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Boletos Pendentes"
            value={dashboardData.pendingBills}
            change="Contas a pagar em aberto"
            icon={Clock}
            trend="neutral"
          />
          <MetricCard
            title="Títulos em Atraso"
            value={dashboardData.overduePayments}
            change={dashboardData.overduePayments > 0 ? 'Requer conciliação imediata' : 'Em dia'}
            icon={AlertCircle}
            trend={dashboardData.overduePayments > 0 ? 'down' : 'up'}
          />
          <MetricCard
            title="Variação Mensal"
            value={`${dashboardData.monthlyGrowth >= 0 ? '+' : ''}${dashboardData.monthlyGrowth}%`}
            change="Comparativo mensal"
            icon={Activity}
            trend={dashboardData.monthlyGrowth >= 0 ? 'up' : 'down'}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Evolução Financeira
              </CardTitle>
              <CardDescription>Receitas, despesas e lucro líquido por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    name="Receita"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    name="Despesas"
                    stroke="#fb7185"
                    fill="#fb7185"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    name="Lucro"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2" />
                Categorias de Despesas
              </CardTitle>
              <CardDescription>Distribuição dos gastos operacionais por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              {expenseCategories.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                  Nenhuma despesa registrada no período.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={95}
                      fill="#8b5cf6"
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentação dos Últimos 7 Dias</CardTitle>
              <CardDescription>Comparativo diário de entradas e saídas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTransactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>Volume financeiro movimentado por meio de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                      <span className="font-medium">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(method.amount)}</div>
                      <div className="text-sm text-gray-500">
                        {method.percentage}% do volume
                        <Badge variant="default" className="ml-2">
                          {method.growth}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
