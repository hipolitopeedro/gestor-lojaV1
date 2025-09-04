import React, { useState } from 'react';
import SimpleTransactionList from '@/components/transactions/SimpleTransactionList';
import SimpleTransactionForm from '@/components/transactions/SimpleTransactionForm';
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

const Income = ({ onNavigate }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Mock summary data
  const summaryData = {
    totalIncome: 15750.80,
    monthlyGrowth: 12.5,
    transactionCount: 23,
    averageTransaction: 684.38,
    topCategory: 'Vendas',
    topPaymentMethod: 'PIX'
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
              Voltar para Entradas
            </Button>
          </div>

          <SimpleTransactionForm
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Receipt className="h-6 w-6 mr-2 text-green-600" />
                Entradas
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie todas as entradas do seu negócio
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Olá, {user?.username}</p>
              <Button
                onClick={() => window.navigateTo('dashboard')}
                variant="outline"
                size="sm"
                className="mt-1"
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
              <div className="text-2xl font-bold">45%</div>
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
              <div className="text-2xl font-bold">38%</div>
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

