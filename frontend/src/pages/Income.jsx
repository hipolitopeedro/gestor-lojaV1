import React, { useState, useEffect } from 'react';
import SimpleTransactionList from '@/components/transactions/SimpleTransactionList';
import SimpleTransactionFormWorking from '@/components/transactions/SimpleTransactionFormWorking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Calendar,
  ArrowLeft,
  Plus,
  BarChart3
} from 'lucide-react';
import dataService from '@/services/dataService';

const Income = ({ onNavigate }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    monthlyGrowth: 0,
    transactionCount: 0,
    averageTransaction: 0,
    topCategory: 'N/A',
    topPaymentMethod: 'N/A'
  });

  // Load summary data from dataService
  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = () => {
    try {
      const dashboardData = dataService.getDashboardData();
      setSummaryData({
        totalIncome: dashboardData.totalRevenue,
        monthlyGrowth: dashboardData.monthlyGrowth,
        transactionCount: dashboardData.transactionCount,
        averageTransaction: dashboardData.averageTransaction,
        topCategory: dashboardData.topCategory,
        topPaymentMethod: dashboardData.topPaymentMethod
      });
    } catch (error) {
      console.error('Error loading summary data:', error);
    }
  };

  const handleAddTransaction = () => {
    setCurrentView('add');
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setCurrentView('edit');
  };

  const handleDeleteTransaction = (transaction) => {
    // Refresh summary data after deletion
    loadSummaryData();
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Transaction is already saved by the form component
      // Just refresh the summary data and navigate back
      loadSummaryData();
      setCurrentView('list');
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setEditingTransaction(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleFormCancel}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Entradas
            </Button>
          </div>

          <SimpleTransactionFormWorking
            type="income"
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={editingTransaction}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f3ff' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#8b5cf6' }} className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Receipt className="h-6 w-6 mr-2 text-white" />
                Entradas
              </h1>
              <p className="text-white/80 mt-1">
                Gerencie todas as entradas do seu negócio
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white">Olá, Demo User</p>
              <Button
                onClick={() => onNavigate('dashboard')}
                variant="outline"
                size="sm"
                className="mt-1 border-white bg-white text-black hover:bg-gray-100"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryData.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +{summaryData.monthlyGrowth}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.transactionCount}</div>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(summaryData.averageTransaction)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {summaryData.topCategory}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                do total de entradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forma Principal</CardTitle>
              <Badge variant="outline" className="text-xs">
                {summaryData.topPaymentMethod}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                das transações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <SimpleTransactionList
          type="income"
          onAddTransaction={handleAddTransaction}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default Income;

