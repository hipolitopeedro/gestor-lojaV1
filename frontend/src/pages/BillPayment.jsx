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
  Scan,
  Receipt,
  CreditCard,
  DollarSign,
  Trash2,
  Edit2,
  Settings
} from 'lucide-react';
import PaymentMethodManager from '@/components/transactions/PaymentMethodManager';

const BillPayment = ({ onNavigate }) => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({});
  const [showAddBill, setShowAddBill] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPaymentMethodManager, setShowPaymentMethodManager] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  // Load bills from localStorage
  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = () => {
    // Try to get bills from localStorage
    try {
      const storedBills = localStorage.getItem('lupa_bills');
      const billsData = storedBills ? JSON.parse(storedBills) : [];
      setBills(billsData);
      updateSummary(billsData);
    } catch (error) {
      console.error('Error loading bills:', error);
      setBills([]);
      updateSummary([]);
    }
  };

  const updateSummary = (billsData) => {
    const pendingBills = billsData.filter(b => b.status === 'pending' && !b.is_overdue);
    const paidBills = billsData.filter(b => b.status === 'paid');
    const overdueBills = billsData.filter(b => b.is_overdue);
    
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const billsDueThisWeek = billsData.filter(b => {
      const dueDate = new Date(b.due_date);
      return b.status === 'pending' && dueDate >= today && dueDate <= nextWeek;
    });

    const totalPendingAmount = pendingBills.reduce((sum, b) => sum + b.final_amount, 0);
    const totalPaidAmount = paidBills.reduce((sum, b) => sum + b.final_amount, 0);
    const totalOverdueAmount = overdueBills.reduce((sum, b) => sum + b.final_amount, 0);

    setSummary({
      total_bills: billsData.length,
      pending_bills: pendingBills.length,
      paid_bills: paidBills.length,
      overdue_bills: overdueBills.length,
      bills_due_this_week: billsDueThisWeek.length,
      total_pending_amount: totalPendingAmount,
      total_paid_amount: totalPaidAmount,
      total_overdue_amount: totalOverdueAmount
    });
  };

  const saveBills = (updatedBills) => {
    try {
      localStorage.setItem('lupa_bills', JSON.stringify(updatedBills));
    } catch (error) {
      console.error('Error saving bills:', error);
    }
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'destructive';
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status, isOverdue) => {
    if (isOverdue) return <AlertTriangle className="w-4 h-4" />;
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status, isOverdue, daysUntilDue) => {
    if (isOverdue) return `Vencida há ${Math.abs(daysUntilDue)} dias`;
    switch (status) {
      case 'paid': return 'Paga';
      case 'pending': 
        if (daysUntilDue === 0) return 'Vence hoje';
        if (daysUntilDue === 1) return 'Vence amanhã';
        if (daysUntilDue > 0) return `Vence em ${daysUntilDue} dias`;
        return 'Pendente';
      default: return 'Pendente';
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'overdue' && bill.is_overdue) ||
      (filters.status !== 'overdue' && bill.status === filters.status);
    
    const matchesCategory = filters.category === 'all' || bill.category === filters.category;
    
    const matchesSearch = !filters.search || 
      bill.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.company.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handlePayBill = (billId) => {
    const updatedBills = bills.map(bill => 
      bill.id === billId 
        ? { ...bill, status: 'paid', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Dinheiro' }
        : bill
    );
    setBills(updatedBills);
    saveBills(updatedBills);
    updateSummary(updatedBills);
  };

  const handleSaveBill = (bill) => {
    const newBill = { ...bill, id: Date.now() };
    const updatedBills = [...bills, newBill];
    setBills(updatedBills);
    saveBills(updatedBills);
    updateSummary(updatedBills);
    setShowAddBill(false);
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('Tem certeza que deseja excluir este boleto?')) {
      const updatedBills = bills.filter(b => b.id !== billId);
      setBills(updatedBills);
      saveBills(updatedBills);
      updateSummary(updatedBills);
    }
  };

  const handleScanBill = (billData) => {
    const newBill = { ...billData, id: Date.now() };
    const updatedBills = [...bills, newBill];
    setBills(updatedBills);
    saveBills(updatedBills);
    updateSummary(updatedBills);
    setShowBarcodeScanner(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (showAddBill) {
    return <AddBillForm onBack={() => setShowAddBill(false)} onSave={handleSaveBill} />;
  }

  if (showBarcodeScanner) {
    return <BarcodeScanner onBack={() => setShowBarcodeScanner(false)} onScan={handleScanBill} />;
  }

  const handlePaymentMethodManagerClose = () => {
    setShowPaymentMethodManager(false);
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f5f3ff' }}>
      {/* Payment Method Manager Modal */}
      {showPaymentMethodManager && (
        <PaymentMethodManager onClose={handlePaymentMethodManagerClose} hideFeatures={true} />
      )}

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
                  <Receipt className="w-6 h-6 mr-2 text-white" />
                  Pagamento de Boletos
                </h1>
                <p className="text-white/80">Gerencie e pague suas contas</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowPaymentMethodManager(true)} className="bg-white text-purple-600 hover:bg-gray-100">
                <Settings className="w-4 h-4 mr-2" />
                Formas de Pagamento
              </Button>
              <Button onClick={() => setShowBarcodeScanner(true)} className="bg-white text-purple-600 hover:bg-gray-100">
                <Scan className="w-4 h-4 mr-2" />
                Escanear Código
              </Button>
              <Button onClick={() => setShowAddBill(true)} className="bg-white text-purple-600 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Novo Boleto
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Pendentes</CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.pending_bills}</div>
              <p className="text-xs text-gray-600">
                {formatCurrency(summary.total_pending_amount || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Pagas</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.paid_bills}</div>
              <p className="text-xs text-gray-600">
                {formatCurrency(summary.total_paid_amount || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.overdue_bills}</div>
              <p className="text-xs text-gray-600">
                {formatCurrency(summary.total_overdue_amount || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencem Esta Semana</CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.bills_due_this_week}</div>
              <p className="text-xs text-gray-600">Requer atenção</p>
            </CardContent>
          </Card>
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
                  placeholder="Buscar boleto..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
                <option value="paid">Pagos</option>
                <option value="overdue">Vencidos</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas as categorias</option>
                <option value="Energia">Energia</option>
                <option value="Água">Água</option>
                <option value="Internet">Internet</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Outros">Outros</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setFilters({ status: 'all', category: 'all', search: '' })}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle>Boletos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBills.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhum boleto encontrado</p>
                  <Button onClick={() => setShowAddBill(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Boleto
                  </Button>
                </div>
              ) : (
                filteredBills.map(bill => (
                  <div key={bill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{bill.title}</h3>
                          <Badge variant={getStatusColor(bill.status, bill.is_overdue)}>
                            {getStatusText(bill.status, bill.is_overdue, bill.days_until_due)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Empresa:</span>
                            <p className="font-semibold">{bill.company}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Categoria:</span>
                            <p className="font-semibold">{bill.category}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Vencimento:</span>
                            <p className="font-semibold">{new Date(bill.due_date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Valor:</span>
                            <p className="font-semibold text-orange-600">{formatCurrency(bill.final_amount)}</p>
                          </div>
                        </div>

                        {bill.barcode && (
                          <p className="text-xs text-gray-500 mt-2">
                            Código: {bill.barcode}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {bill.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayBill(bill.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBill(bill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add Bill Form Component
const AddBillForm = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'Energia',
    original_amount: '',
    due_date: '',
    barcode: '',
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
    
    if (!formData.title || !formData.company || !formData.original_amount || !formData.due_date) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Calculate days until due
    const today = new Date();
    const dueDate = new Date(formData.due_date);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;
    
    onSave({
      ...formData,
      original_amount: parseFloat(formData.original_amount),
      final_amount: parseFloat(formData.original_amount),
      status: 'pending',
      is_overdue: isOverdue,
      days_until_due: daysUntilDue,
      interest_amount: 0
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
            <CardTitle>Novo Boleto</CardTitle>
            <CardDescription>Adicione um novo boleto para pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <Label htmlFor="title">Título da Conta *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Conta de Luz"
                  className="mt-1"
                />
              </div>

              {/* Empresa */}
              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Ex: Companhia de Energia"
                  className="mt-1"
                />
              </div>

              {/* Categoria */}
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="Energia">Energia</option>
                  <option value="Água">Água</option>
                  <option value="Internet">Internet</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Outros">Outros</option>
                </select>
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

              {/* Código de Barras */}
              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Ex: 12345.67890 12345.678901 12345.678901 1 12345678901234"
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
                  Adicionar Boleto
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

// Barcode Scanner Component
const BarcodeScanner = ({ onBack, onScan }) => {
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleScan = () => {
    if (!barcodeInput.trim()) {
      alert('Por favor, insira um código de barras válido');
      return;
    }

    // Parse barcode data
    // Format: NNNNN.NNNNN NNNNN.NNNNN NNNNN.NNNNN N NNNNNNNNNNNNN
    const parts = barcodeInput.trim().split(' ');
    
    if (parts.length !== 4) {
      alert('Formato de código de barras inválido');
      return;
    }

    onScan({
      title: 'Boleto Escaneado',
      company: 'Empresa',
      category: 'Outros',
      original_amount: 100.00,
      final_amount: 100.00,
      due_date: new Date().toISOString().split('T')[0],
      barcode: barcodeInput.trim(),
      status: 'pending',
      is_overdue: false,
      days_until_due: 0,
      interest_amount: 0
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
            <CardTitle>Escanear Código de Barras</CardTitle>
            <CardDescription>Insira o código de barras do boleto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Ex: 12345.67890 12345.678901 12345.678901 1 12345678901234"
                  className="mt-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Formato: NNNNN.NNNNN NNNNN.NNNNN NNNNN.NNNNN N NNNNNNNNNNNNN
                </p>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleScan} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Scan className="h-4 w-4 mr-2" />
                  Processar Código
                </Button>
                <Button variant="outline" onClick={onBack} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillPayment;

