import React, { useState } from 'react';
import SimpleTransactionList from '@/components/transactions/SimpleTransactionList';
import SimpleTransactionForm from '@/components/transactions/SimpleTransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  ArrowLeft,
  Plus,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const Expense = ({ onNavigate }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Mock summary data
  const summaryData = {
    totalExpenses: 28340.50,
    monthlyGrowth: 8.2,
    transactionCount: 45,
    averageTransaction: 629.79,
    topCategory: 'Fornecedores',
    topPaymentMethod: 'Cartão Crédito',
    totalFees: 1250.30
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
    // TODO: Implement delete functionality
    console.log('Delete transaction:', transaction);
  };

  const handleFormSubmit = async (formData) => {
    try {
      // TODO: Implement API call to save transaction
      console.log('Saving transaction:', formData);
      
      // Simulate success
      setTimeout(() => {
        setCurrentView('list');
        setEditingTransaction(null);
      }, 1000);
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
              Voltar para Despesas
            </Button>
          </div>

          <SimpleTransactionForm
            type="expense"
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
                <CreditCard className="h-6 w-6 mr-2 text-white" />
                Despesas
              </h1>
              <p className="text-white/80 mt-1">
                Controle todas as saídas do seu negócio
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
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summaryData.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                +{summaryData.monthlyGrowth}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
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
              <div className="text-2xl font-bold">44%</div>
              <p className="text-xs text-muted-foreground">
                do total de despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxas Pagas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summaryData.totalFees)}
              </div>
              <p className="text-xs text-muted-foreground">
                4.4% do total gasto
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fee Alert */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Atenção às Taxas</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Você pagou {formatCurrency(summaryData.totalFees)} em taxas este mês. 
                  Considere usar mais PIX para reduzir custos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <SimpleTransactionList
          type="expense"
          onAddTransaction={handleAddTransaction}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default Expense;

