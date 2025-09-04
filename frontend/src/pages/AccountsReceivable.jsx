import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Banknote
} from 'lucide-react';

const AccountsReceivable = ({ onNavigate }) => {
  const { user } = useAuth();
  const [receivables, setReceivables] = useState([]);
  const [summary, setSummary] = useState({});
  const [showAddReceivable, setShowAddReceivable] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    customer: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockSummary = {
      total_receivables: 18,
      pending_receivables: 8,
      partial_receivables: 3,
      paid_receivables: 6,
      overdue_receivables: 1,
      receivables_due_this_week: 4,
      total_amount: 12450.80,
      total_pending_amount: 8750.30,
      total_paid_amount: 3700.50,
      total_overdue_amount: 450.00,
      types: {
        fiado: { count: 12, total_amount: 8500.00, pending_amount: 6200.00 },
        machine_receipt: { count: 4, total_amount: 2800.00, pending_amount: 1850.00 },
        invoice: { count: 2, total_amount: 1150.80, pending_amount: 700.30 }
      },
      top_customers: [
        { name: 'João Silva', total_amount: 2450.00, pending_amount: 1200.00, count: 5 },
        { name: 'Maria Santos', total_amount: 1850.00, pending_amount: 950.00, count: 3 },
        { name: 'Pedro Costa', total_amount: 1650.00, pending_amount: 0, count: 4 }
      ]
    };

    const mockReceivables = [
      {
        id: 1,
        customer_name: 'João Silva',
        customer_phone: '(11) 99999-1111',
        type: 'fiado',
        description: 'Compra de produtos diversos',
        reference_number: 'FD001',
        original_amount: 450.00,
        paid_amount: 0,
        remaining_amount: 450.00,
        issue_date: '2025-08-15',
        due_date: '2025-09-15',
        status: 'pending',
        is_overdue: false,
        days_until_due: 14,
        total_with_fees: 450.00,
        payments: []
      },
      {
        id: 2,
        customer_name: 'Maria Santos',
        customer_phone: '(11) 99999-2222',
        type: 'machine_receipt',
        description: 'Pagamento máquina de cartão',
        reference_number: 'MC002',
        machine_id: 'MACH001',
        machine_location: 'Loja Centro',
        original_amount: 280.50,
        paid_amount: 100.00,
        remaining_amount: 180.50,
        issue_date: '2025-08-20',
        due_date: '2025-09-05',
        status: 'partial',
        is_overdue: false,
        days_until_due: 4,
        total_with_fees: 180.50,
        payments: [
          {
            id: 1,
            amount: 100.00,
            payment_method: 'PIX',
            payment_date: '2025-08-25',
            notes: 'Pagamento parcial'
          }
        ]
      },
      {
        id: 3,
        customer_name: 'Pedro Costa',
        customer_phone: '(11) 99999-3333',
        type: 'fiado',
        description: 'Fiado semanal - produtos alimentícios',
        reference_number: 'FD003',
        original_amount: 320.00,
        paid_amount: 320.00,
        remaining_amount: 0,
        issue_date: '2025-08-10',
        due_date: '2025-08-25',
        last_payment_date: '2025-08-24',
        status: 'paid',
        is_overdue: false,
        days_until_due: 0,
        total_with_fees: 0,
        payments: [
          {
            id: 2,
            amount: 320.00,
            payment_method: 'Dinheiro',
            payment_date: '2025-08-24',
            notes: 'Pagamento integral'
          }
        ]
      },
      {
        id: 4,
        customer_name: 'Ana Oliveira',
        customer_phone: '(11) 99999-4444',
        type: 'fiado',
        description: 'Compra de bebidas e lanches',
        reference_number: 'FD004',
        original_amount: 150.00,
        paid_amount: 0,
        remaining_amount: 150.00,
        interest_rate: 2.0,
        late_fee: 10.00,
        issue_date: '2025-08-05',
        due_date: '2025-08-25',
        status: 'overdue',
        is_overdue: true,
        days_overdue: 7,
        days_until_due: -7,
        total_with_fees: 167.00,
        payments: []
      },
      {
        id: 5,
        customer_name: 'Carlos Mendes',
        customer_phone: '(11) 99999-5555',
        type: 'invoice',
        description: 'Serviços prestados - consultoria',
        reference_number: 'INV005',
        original_amount: 850.00,
        paid_amount: 0,
        remaining_amount: 850.00,
        issue_date: '2025-08-28',
        due_date: '2025-09-12',
        status: 'pending',
        is_overdue: false,
        days_until_due: 11,
        total_with_fees: 850.00,
        payments: []
      }
    ];

    setSummary(mockSummary);
    setReceivables(mockReceivables);
  }, []);

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
    // Mock payment addition
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
        
        return {
          ...r,
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? 'paid' : 'partial',
          last_payment_date: new Date().toISOString().split('T')[0],
          payments: [...r.payments, newPayment]
        };
      }
      return r;
    }));
    
    setShowAddPayment(false);
    setSelectedReceivable(null);
  };

  if (showAddReceivable) {
    return <AddReceivableForm onBack={() => setShowAddReceivable(false)} onSave={(receivable) => {
      setReceivables([...receivables, { ...receivable, id: Date.now() }]);
      setShowAddReceivable(false);
    }} />;
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Contas a Receber
              </h1>
              <p className="text-gray-600">Gerencie fiados, máquinas e faturas</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowAddReceivable(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
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
                R$ {summary.total_pending_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                R$ {summary.total_paid_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                R$ {summary.total_overdue_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    <span className="font-medium">R$ {data.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pendente:</span>
                    <span className="font-medium text-orange-600">R$ {data.pending_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Contas:</span>
                    <span className="font-medium">{data.count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Principais Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.top_customers?.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-gray-600">{customer.count} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {customer.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    {customer.pending_amount > 0 && (
                      <p className="text-sm text-orange-600">
                        R$ {customer.pending_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="partial">Parciais</option>
                <option value="paid">Pagos</option>
                <option value="overdue">Vencidos</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="fiado">Fiado</option>
                <option value="machine_receipt">Máquina</option>
                <option value="invoice">Fatura</option>
              </select>

              <Button variant="outline" onClick={() => setFilters({ status: 'all', type: 'all', customer: '' })}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receivables List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Contas a Receber ({filteredReceivables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReceivables.map((receivable) => (
                <div key={receivable.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(receivable.status, receivable.is_overdue)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {receivable.customer_name}
                        </h3>
                        <Badge variant={getStatusColor(receivable.status, receivable.is_overdue)}>
                          {getStatusText(receivable.status, receivable.is_overdue, receivable.days_until_due, receivable.days_overdue)}
                        </Badge>
                        <Badge className={getTypeColor(receivable.type)}>
                          {getTypeText(receivable.type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">{receivable.description}</p>
                        {receivable.reference_number && (
                          <Badge variant="outline">{receivable.reference_number}</Badge>
                        )}
                        <p className="text-sm text-gray-600">
                          Vencimento: {new Date(receivable.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      {receivable.customer_phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{receivable.customer_phone}</p>
                        </div>
                      )}
                      
                      {receivable.machine_id && (
                        <div className="flex items-center space-x-2 mt-1">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Máquina: {receivable.machine_id} - {receivable.machine_location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {receivable.remaining_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {receivable.paid_amount > 0 && (
                        <p className="text-sm text-green-600">
                          R$ {receivable.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pago
                        </p>
                      )}
                      {receivable.total_with_fees > receivable.remaining_amount && (
                        <p className="text-sm text-red-600">
                          +R$ {(receivable.total_with_fees - receivable.remaining_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} juros/multa
                        </p>
                      )}
                      {receivable.payments.length > 0 && (
                        <p className="text-xs text-gray-600">
                          {receivable.payments.length} pagamento(s)
                        </p>
                      )}
                    </div>

                    {receivable.status !== 'paid' && (
                      <Button 
                        onClick={() => {
                          setSelectedReceivable(receivable);
                          setShowAddPayment(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Receber
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredReceivables.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma conta encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
    payment_terms: '',
    machine_id: '',
    machine_location: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      original_amount: parseFloat(formData.original_amount),
      remaining_amount: parseFloat(formData.original_amount),
      paid_amount: 0,
      issue_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      is_overdue: false,
      days_until_due: Math.ceil((new Date(formData.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
      payments: []
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Nova Conta a Receber
                </CardTitle>
                <CardDescription>Adicione uma nova conta a receber</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Nome do Cliente *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nome completo do cliente"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone">Telefone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="fiado">Fiado</option>
                  <option value="machine_receipt">Máquina de Cartão</option>
                  <option value="invoice">Fatura/Serviço</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que foi vendido ou o serviço prestado"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_number">Número de Referência</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="Ex: FD001, INV123"
                  />
                </div>

                <div>
                  <Label htmlFor="original_amount">Valor *</Label>
                  <Input
                    id="original_amount"
                    type="number"
                    step="0.01"
                    value={formData.original_amount}
                    onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Data de Vencimento *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="payment_terms">Condições de Pagamento</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="Ex: À vista, 30 dias"
                  />
                </div>
              </div>

              {formData.type === 'machine_receipt' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="machine_id">ID da Máquina</Label>
                    <Input
                      id="machine_id"
                      value={formData.machine_id}
                      onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                      placeholder="Ex: MACH001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="machine_location">Local da Máquina</Label>
                    <Input
                      id="machine_location"
                      value={formData.machine_location}
                      onChange={(e) => setFormData({ ...formData, machine_location: e.target.value })}
                      placeholder="Ex: Loja Centro"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Salvar Conta
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(receivable.id, parseFloat(formData.amount), formData.payment_method, formData.notes);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <CardTitle className="flex items-center">
                  <Banknote className="w-5 h-5 mr-2 text-green-600" />
                  Receber Pagamento
                </CardTitle>
                <CardDescription>Cliente: {receivable.customer_name}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receivable Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Informações da Conta</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valor Original:</span>
                  <span className="ml-2 font-medium">R$ {receivable.original_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valor Pago:</span>
                  <span className="ml-2 font-medium text-green-600">R$ {receivable.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valor Restante:</span>
                  <span className="ml-2 font-medium text-orange-600">R$ {receivable.remaining_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-gray-600">Vencimento:</span>
                  <span className="ml-2 font-medium">{new Date(receivable.due_date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Valor do Pagamento *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  max={receivable.remaining_amount}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Máximo: R$ {receivable.remaining_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <Label htmlFor="payment_method">Forma de Pagamento *</Label>
                <select
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão Débito">Cartão Débito</option>
                  <option value="Cartão Crédito">Cartão Crédito</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre o pagamento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Banknote className="w-4 h-4 mr-2" />
                  Confirmar Pagamento
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
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

