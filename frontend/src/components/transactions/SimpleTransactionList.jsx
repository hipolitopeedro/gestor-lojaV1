import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  MoreHorizontal
} from 'lucide-react';

const SimpleTransactionList = ({ type, onAddTransaction, onEditTransaction, onDeleteTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  // Mock data for demonstration
  const mockTransactions = [];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const filtered = type ? mockTransactions.filter(t => t.type === type) : mockTransactions;
      setTransactions(filtered);
      setFilteredTransactions(filtered);
      setLoading(false);
    }, 500);
  }, [type]);

  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Payment method filter
    if (selectedPaymentMethod) {
      filtered = filtered.filter(t => t.payment_method === selectedPaymentMethod);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory, selectedPaymentMethod]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'pix': 'PIX',
      'dinheiro': 'Dinheiro',
      'debito': 'Cartão Débito',
      'credito': 'Cartão Crédito',
      'boleto': 'Boleto'
    };
    return methods[method] || method;
  };

  const getUniqueCategories = () => {
    return [...new Set(transactions.map(t => t.category))];
  };

  const getUniquePaymentMethods = () => {
    return [...new Set(transactions.map(t => t.payment_method).filter(Boolean))];
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, t) => sum + t.net_amount, 0);
  };

  const getTransactionCount = () => {
    return filteredTransactions.length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando transações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'income' ? 'Entradas' : type === 'expense' ? 'Despesas' : 'Transações'}
          </h2>
          <p className="text-gray-600 mt-1">
            {getTransactionCount()} transações • Total: {formatCurrency(getTotalAmount())}
          </p>
        </div>
        
        <Button onClick={onAddTransaction} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nova {type === 'income' ? 'Entrada' : type === 'expense' ? 'Despesa' : 'Transação'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas as categorias</option>
              {getUniqueCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas as formas</option>
              {getUniquePaymentMethods().map((method) => (
                <option key={method} value={method}>
                  {getPaymentMethodLabel(method)}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                {type === 'income' ? <Receipt className="h-12 w-12 mx-auto" /> : <CreditCard className="h-12 w-12 mx-auto" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory || selectedPaymentMethod
                  ? 'Tente ajustar os filtros para encontrar transações.'
                  : `Você ainda não possui ${type === 'income' ? 'entradas' : type === 'expense' ? 'despesas' : 'transações'} registradas.`
                }
              </p>
              {!searchTerm && !selectedCategory && !selectedPaymentMethod && (
                <Button onClick={onAddTransaction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar {type === 'income' ? 'Entrada' : type === 'expense' ? 'Despesa' : 'Transação'}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {transaction.description}
                        </h3>
                        <Badge variant="secondary">
                          {transaction.category}
                        </Badge>
                        {transaction.payment_method && (
                          <Badge variant="outline">
                            {getPaymentMethodLabel(transaction.payment_method)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(transaction.date)}
                        </span>
                        {transaction.card_fee > 0 && (
                          <span className="text-red-600">
                            Taxa: {formatCurrency(transaction.card_fee)}
                          </span>
                        )}
                        {transaction.notes && (
                          <span className="truncate max-w-xs">
                            {transaction.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.net_amount)}
                      </div>
                      {transaction.card_fee > 0 && (
                        <div className="text-xs text-gray-500">
                          Bruto: {formatCurrency(transaction.amount)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTransaction(transaction)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTransaction(transaction)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleTransactionList;

