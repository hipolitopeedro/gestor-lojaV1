import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Receipt,
  CreditCard,
  DollarSign,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calculator,
  TrendingUp,
  Banknote,
  Trash2,
  Edit2
} from 'lucide-react';
import dataService from '@/services/dataService';

const AccountsReceivable = ({ onNavigate }) => {
  const [receivables, setReceivables] = useState([]);
  const [summary, setSummary] = useState({
    total_receivables: 0,
    pending_receivables: 0,
    partial_receivables: 0,
    paid_receivables: 0,
    overdue_receivables: 0,
    receivables_due_this_week: 0,
    total_amount: 0,
    total_pending_amount: 0,
    total_paid_amount: 0,
    total_overdue_amount: 0,
    types: {
      fiado: { count: 0, total_amount: 0, pending_amount: 0 },
      machine_receipt: { count: 0, total_amount: 0, pending_amount: 0 },
      invoice: { count: 0, total_amount: 0, pending_amount: 0 }
    },
    top_customers: []
  });
  const [showAddReceivable, setShowAddReceivable] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    customer: ''
  });

  // Load receivables from localStorage
  useEffect(() => {
    loadReceivables();
  }, []);

  const loadReceivables = () => {
    try {
      const storedReceivables = localStorage.getItem('lupa_receivables');
      const receivablesData = storedReceivables ? JSON.parse(storedReceivables) : [];
      setReceivables(receivablesData);
      updateSummary(receivablesData);
    } catch (error) {
      console.error('Error loading receivables:', error);
      setReceivables([]);
      updateSummary([]);
    }
  };

  const updateSummary = (receivablesData) => {
    const pendingReceivables = receivablesData.filter(r => r.status === 'pending' && !r.is_overdue);
    const partialReceivables = receivablesData.filter(r => r.status === 'partial');
    const paidReceivables = receivablesData.filter(r => r.status === 'paid');
    const overdueReceivables = receivablesData.filter(r => r.is_overdue);

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const receivablesDueThisWeek = receivablesData.filter(r => {
      const dueDate = new Date(r.due_date);
      return r.status !== 'paid' && dueDate >= today && dueDate <= nextWeek;
    });

    const totalAmount = receivablesData.reduce((sum, r) => sum + r.original_amount, 0);
    const totalPendingAmount = pendingReceivables.reduce((sum, r) => sum + r.remaining_amount, 0) +
                               partialReceivables.reduce((sum, r) => sum + r.remaining_amount, 0);
    const totalPaidAmount = paidReceivables.reduce((sum, r) => sum + r.original_amount, 0);
    const totalOverdueAmount = overdueReceivables.reduce((sum, r) => sum + r.remaining_amount, 0);

    // Calculate types breakdown
    const types = {
      fiado: { count: 0, total_amount: 0, pending_amount: 0 },
      machine_receipt: { count: 0, total_amount: 0, pending_amount: 0 },
      invoice: { count: 0, total_amount: 0, pending_amount: 0 }
    };

    receivablesData.forEach(r => {
      if (types[r.type]) {
        types[r.type].count++;
        types[r.type].total_amount += r.original_amount;
        if (r.status !== 'paid') {
          types[r.type].pending_amount += r.remaining_amount;
        }
      }
    });

    // Get top customers
    const customerMap = {};
    receivablesData.forEach(r => {
      if (!customerMap[r.customer_name]) {
        customerMap[r.customer_name] = { total_amount: 0, pending_amount: 0, count: 0 };
      }
      customerMap[r.customer_name].total_amount += r.original_amount;
      customerMap[r.customer_name].pending_amount += r.remaining_amount;
      customerMap[r.customer_name].count++;
    });

    const topCustomers = Object.entries(customerMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5);

    setSummary({
      total_receivables: receivablesData.length,
      pending_receivables: pendingReceivables.length,
      partial_receivables: partialReceivables.length,
      paid_receivables: paidReceivables.length,
      overdue_receivables: overdueReceivables.length,
      receivables_due_this_week: receivablesDueThisWeek.length,
      total_amount: totalAmount,
      total_pending_amount: totalPendingAmount,
      total_paid_amount: totalPaidAmount,
      total_overdue_amount: totalOverdueAmount,
      types,
      top_customers: topCustomers
    });
  };

  const saveReceivables = (updatedReceivables) => {
    try {
      localStorage.setItem('lupa_receivables', JSON.stringify(updatedReceivables));
    } catch (error) {
      console.error('Error saving receivables:', error);
    }
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'destructive';
    switch (status) {
      case 'paid': return 'default';
      case 'partial': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status, isOverdue) => {
    if (isOverdue) return <AlertTriangle className="w-4 h-4" />;
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status, isOverdue, daysUntilDue, daysOverdue) => {
    if (isOverdue) return `Vencida há ${daysOverdue} dias`;
    switch (status) {
      case 'paid': return 'Pago';
      case 'partial': return 'Pagamento Parcial';
      case 'pending': 
        if (daysUntilDue === 0) return 'Vence hoje';
        if (daysUntilDue === 1) return 'Vence amanhã';
        if (daysUntilDue > 0) return `Vence em ${daysUntilDue} dias`;
        return 'Pendente';
      default: return 'Pendente';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'fiado': return 'Fiado';
      case 'machine_receipt': return 'Máquina';
      case 'invoice': return 'Fatura';
      default: return 'Outros';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'fiado': return 'bg-blue-100 text-blue-800';
      case 'machine_receipt': return 'bg-purple-100 text-purple-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReceivables = receivables.filter(receivable => {
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'overdue' && receivable.is_overdue) ||
      (filters.status !== 'overdue' && receivable.status === filters.status);
    
    const matchesType = filters.type === 'all' || receivable.type === filters.type;
    
    const matchesCustomer = !filters.customer || 
      receivable.customer_name.toLowerCase().includes(filters.customer.toLowerCase());
    
    return matchesStatus && matchesType && matchesCustomer;
  });

  const handleAddPayment = (receivableId, amount, paymentMethod, notes) => {
    setReceivables(receivables.map(r => {
      if (r.id === receivableId) {
        const newPaidAmount = r.paid_amount + amount;
        const newRemainingAmount = r.original_amount - newPaidAmount;
        const newPayment = {
          id: Date.now(),
          amount,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString().split('T')[0],
          notes
        };
        
        const updated = {
          ...r,
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? 'paid' : 'partial',
          last_payment_date: new Date().toISOString().split('T')[0],
          payments: [...(r.payments || []), newPayment]
        };
        
        return updated;
      }
      return r;
    }));
    
    setShowAddPayment(false);
    setSelectedReceivable(null);
  };

  const handleAddReceivable = (receivable) => {
    const newReceivable = {
      ...receivable,
      id: Date.now(),
      paid_amount: 0,
      remaining_amount: receivable.original_amount,
      status: 'pending',
      is_overdue: false,
      payments: [],
      issue_date: new Date().toISOString().split('T')[0]
    };
    
    const updatedReceivables = [...receivables, newReceivable];
    setReceivables(updatedReceivables);
    saveReceivables(updatedReceivables);
    updateSummary(updatedReceivables);
    setShowAddReceivable(false);
  };

  const handleDeleteReceivable = (receivableId) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta a receber?')) {
      const updatedReceivables = receivables.filter(r => r.id !== receivableId);
      setReceivables(updatedReceivables);
      saveReceivables(updatedReceivables);
      updateSummary(updatedReceivables);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (showAddReceivable) {
    return <AddReceivableForm onBack={() => setShowAddReceivable(false)} onSave={handleAddReceivable} />;
  }

  if (showAddPayment && selectedReceivable) {
    return <AddPaymentForm 
      receivable={selectedReceivable}
      onBack={() => {
        setShowAddPayment(false);
        setSelectedReceivable(null);
      }} 
      onSave={handleAddPayment}
    />;
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div style={{ backgroundColor: '#8b5cf6' }} className="p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => onNavigate('dashboard')} className="border-white bg-white text-black hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2 text-white" />
                  Contas a Receber
                </h1>
                <p className="text-white/80">Gerencie fiados, máquinas e faturas</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddReceivable(true)} className="bg-white text-purple-600 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.total_pending_amount)}
              </div>
              <p className="text-xs text-gray-600">
                {summary.pending_receivables + summary.partial_receivables} contas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Já Recebido</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_paid_amount)}
              </div>
              <p className="text-xs text-gray-600">
                {summary.paid_receivables} contas pagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_overdue_amount)}
              </div>
              <p className="text-xs text-gray-600">
                {summary.overdue_receivables} contas vencidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencem Esta Semana</CardTitle>
              <Calendar className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.receivables_due_this_week}</div>
              <p className="text-xs text-gray-600">Requer atenção</p>
            </CardContent>
          </Card>
        </div>

        {/* Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summary.types && Object.entries(summary.types).map(([type, data]) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  {type === 'fiado' && <User className="w-4 h-4 mr-2 text-blue-600" />}
                  {type === 'machine_receipt' && <CreditCard className="w-4 h-4 mr-2 text-purple-600" />}
                  {type === 'invoice' && <FileText className="w-4 h-4 mr-2 text-green-600" />}
                  {getTypeText(type)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-sm font-semibold">{formatCurrency(data.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pendente:</span>
                    <span className="text-sm font-semibold text-orange-600">{formatCurrency(data.pending_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Contas:</span>
                    <span className="text-sm font-semibold">{data.count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente..."
                  value={filters.customer}
                  onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                  className="pl-10"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="partial">Pagamento Parcial</option>
                <option value="paid">Pagos</option>
                <option value="overdue">Vencidos</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os tipos</option>
                <option value="fiado">Fiado</option>
                <option value="machine_receipt">Máquina</option>
                <option value="invoice">Fatura</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setFilters({ status: 'all', type: 'all', customer: '' })}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receivables List */}
        <div className="space-y-4">
          {filteredReceivables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma conta encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {filters.customer || filters.status !== 'all' || filters.type !== 'all'
                    ? 'Tente ajustar os filtros para encontrar contas.'
                    : 'Você ainda não possui contas a receber registradas.'}
                </p>
                {!filters.customer && filters.status === 'all' && filters.type === 'all' && (
                  <Button onClick={() => setShowAddReceivable(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Conta
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredReceivables.map((receivable) => (
              <Card key={receivable.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{receivable.customer_name}</h3>
                        <Badge className={getTypeColor(receivable.type)}>
                          {getTypeText(receivable.type)}
                        </Badge>
                        <Badge variant={getStatusColor(receivable.status, receivable.is_overdue)}>
                          {getStatusText(receivable.status, receivable.is_overdue, receivable.days_until_due, receivable.days_overdue)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{receivable.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Valor Original:</span>
                          <p className="font-semibold">{formatCurrency(receivable.original_amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Pago:</span>
                          <p className="font-semibold text-green-600">{formatCurrency(receivable.paid_amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Restante:</span>
                          <p className="font-semibold text-orange-600">{formatCurrency(receivable.remaining_amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Vencimento:</span>
                          <p className="font-semibold">{formatDate(receivable.due_date)}</p>
                        </div>
                      </div>

                      {receivable.customer_phone && (
                        <p className="text-sm text-gray-600 mt-3 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {receivable.customer_phone}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {receivable.status !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedReceivable(receivable);
                            setShowAddPayment(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Registrar Pagamento
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteReceivable(receivable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Add Receivable Form Component
const AddReceivableForm = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    type: 'fiado',
    description: '',
    reference_number: '',
    original_amount: '',
    due_date: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.original_amount || !formData.due_date) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onSave({
      ...formData,
      original_amount: parseFloat(formData.original_amount)
    });
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Nova Conta a Receber</CardTitle>
            <CardDescription>Registre um novo fiado, máquina ou fatura</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo */}
              <div>
                <Label htmlFor="type">Tipo de Conta *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="fiado">Fiado</option>
                  <option value="machine_receipt">Máquina de Cartão</option>
                  <option value="invoice">Fatura</option>
                </select>
              </div>

              {/* Cliente */}
              <div>
                <Label htmlFor="customer_name">Nome do Cliente *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                  className="mt-1"
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="customer_phone">Telefone</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="Ex: (11) 99999-9999"
                  className="mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="Ex: joao@example.com"
                  className="mt-1"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ex: Compra de produtos diversos"
                  className="mt-1"
                />
              </div>

              {/* Número de Referência */}
              <div>
                <Label htmlFor="reference_number">Número de Referência</Label>
                <Input
                  id="reference_number"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  placeholder="Ex: FD001"
                  className="mt-1"
                />
              </div>

              {/* Valor */}
              <div>
                <Label htmlFor="original_amount">Valor *</Label>
                <Input
                  id="original_amount"
                  name="original_amount"
                  type="number"
                  step="0.01"
                  value={formData.original_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              {/* Data de Vencimento */}
              <div>
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-4 pt-6">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conta
                </Button>
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add Payment Form Component
const AddPaymentForm = ({ receivable, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'PIX',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    if (parseFloat(formData.amount) > receivable.remaining_amount) {
      alert('O valor do pagamento não pode ser maior que o saldo devedor');
      return;
    }

    onSave(receivable.id, parseFloat(formData.amount), formData.payment_method, formData.notes);
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Pagamento</CardTitle>
            <CardDescription>Cliente: {receivable.customer_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Original</p>
                  <p className="text-lg font-semibold">
                    R$ {receivable.original_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saldo Devedor</p>
                  <p className="text-lg font-semibold text-orange-600">
                    R$ {receivable.remaining_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Valor do Pagamento */}
              <div>
                <Label htmlFor="amount">Valor do Pagamento *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-1"
                  max={receivable.remaining_amount}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Máximo: R$ {receivable.remaining_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <Label htmlFor="payment_method">Forma de Pagamento *</Label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Débito">Débito</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-4 pt-6">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar Pagamento
                </Button>
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountsReceivable;

