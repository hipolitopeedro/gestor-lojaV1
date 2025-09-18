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
  LineChart,
  Line,
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
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  Wallet,
  Target,
  Activity,
  LogOut
} from 'lucide-react';
import dataService from '@/services/dataService';

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

  // Load real data from localStorage
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      // Get dashboard statistics
      const data = dataService.getDashboardData();
      setDashboardData(data);

      // Get monthly chart data
      const monthlyData = dataService.getMonthlyData();
      setMonthlyRevenueData(monthlyData);

      // Get daily transactions data
      const dailyData = dataService.getDailyData();
      setDailyTransactions(dailyData);

      // Prepare expense categories for pie chart
      const categoryData = Object.entries(data.categoryStats || {}).map(([name, value]) => ({
        name,
        value,
        color: getRandomColor()
      }));
      setExpenseCategories(categoryData);

      // Prepare payment methods data
      const paymentData = Object.entries(data.paymentMethodStats || {}).map(([method, amount]) => ({
        method,
        amount,
        percentage: data.totalRevenue > 0 ? Math.round((amount / data.totalRevenue) * 100) : 0,
        growth: '+0%' // TODO: Calculate growth based on historical data
      }));
      setPaymentMethods(paymentData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getRandomColor = () => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Reload real data
    setTimeout(() => {
      loadDashboardData();
      setIsLoading(false);
    }, 500);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
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
              <svg className="h-8 w-8 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-white">LuPA</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">
                Olá, <span className="font-medium">Demo User</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('landing')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate("income")}
            >
              <Receipt className="h-4 w-4 mb-1" />
              Entrada
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate("expense")}
            >
              <CreditCard className="h-4 w-4 mb-1" />
              Despesa
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate("billpayment")}
            >
              <ShoppingCart className="h-4 w-4 mb-1" />
              Boleto
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex flex-col items-center justify-center text-black border-black/20 hover:bg-black/10 hover:text-black font-medium text-xs"
              onClick={() => onNavigate("receivables")}
            >
              <Users className="h-4 w-4 mb-1" />
              Receber
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={formatCurrency(dashboardData.totalRevenue)}
            change="+12.5% vs mês anterior"
            icon={DollarSign}
            trend="up"
            color="[#34d399]"
          />
          <MetricCard
            title="Despesas Totais"
            value={formatCurrency(dashboardData.totalExpenses)}
            change="+8.2% vs mês anterior"
            icon={CreditCard}
            trend="up"
            color="[#fb7185]"
          />
          <MetricCard
            title="Lucro Líquido"
            value={formatCurrency(dashboardData.netProfit)}
            change="+18.7% vs mês anterior"
            icon={TrendingUp}
            trend="up"
            color="blue"
          />
          <MetricCard
            title="Margem de Lucro"
            value={`${dashboardData.profitMargin}%`}
            change="+2.1% vs mês anterior"
            icon={Target}
            trend="up"
            color="purple"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Clientes Ativos"
            value={dashboardData.activeCustomers}
            change="+15 novos este mês"
            icon={Users}
            trend="up"
            color="indigo"
          />
          <MetricCard
            title="Boletos Pendentes"
            value={dashboardData.pendingBills}
            change="2 vencem hoje"
            icon={Clock}
            trend="neutral"
            color="[#fb923c]"
          />
          <MetricCard
            title="Pagamentos em Atraso"
            value={dashboardData.overduePayments}
            change="Requer atenção"
            icon={AlertCircle}
            trend="down"
            color="[#fb7185]"
          />
          <MetricCard
            title="Crescimento Mensal"
            value={`+${dashboardData.monthlyGrowth}%`}
            change="Meta: +10%"
            icon={Activity}
            trend="up"
            color="[#34d399]"
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
              <CardDescription>Receitas, despesas e lucro dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="receita" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="despesas" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="lucro" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.8} />
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
              <CardDescription>Distribuição dos gastos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Diárias</CardTitle>
              <CardDescription>Entradas e saídas da última semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTransactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="entradas" fill="#10b981" />
                  <Bar dataKey="saidas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>Performance por método de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(method.amount)}</div>
                      <div className="text-sm text-gray-500">
                        {method.percentage}% 
                        <Badge variant={method.growth.startsWith('+') ? 'default' : 'destructive'} className="ml-2">
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