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
  Scan,
  Receipt,
  CreditCard,
  DollarSign
} from 'lucide-react';

const BillPayment = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({});
  const [showAddBill, setShowAddBill] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockSummary = {
      total_bills: 12,
      pending_bills: 5,
      paid_bills: 6,
      overdue_bills: 1,
      bills_due_this_week: 3,
      total_pending_amount: 1847.50,
      total_paid_amount: 2340.80,
      total_overdue_amount: 156.30
    };

    const mockBills = [
      {
        id: 1,
        title: 'Conta de Energia Elétrica',
        company: 'Companhia de Energia',
        category: 'Energia',
        original_amount: 245.80,
        final_amount: 245.80,
        due_date: '2025-09-05',
        status: 'pending',
        is_overdue: false,
        days_until_due: 4,
        barcode: '34191790010104351004791020150008291070026000'
      },
      {
        id: 2,
        title: 'Conta de Água e Esgoto',
        company: 'Companhia de Saneamento',
        category: 'Água',
        original_amount: 89.50,
        final_amount: 89.50,
        due_date: '2025-09-08',
        status: 'pending',
        is_overdue: false,
        days_until_due: 7,
        barcode: '34191790010104351004791020150008291070026001'
      },
      {
        id: 3,
        title: 'Internet Banda Larga',
        company: 'Provedor Internet',
        category: 'Telecomunicações',
        original_amount: 99.90,
        final_amount: 99.90,
        due_date: '2025-09-10',
        status: 'pending',
        is_overdue: false,
        days_until_due: 9
      },
      {
        id: 4,
        title: 'Conta de Gás',
        company: 'Companhia de Gás',
        category: 'Gás',
        original_amount: 156.30,
        interest_amount: 15.63,
        final_amount: 171.93,
        due_date: '2025-08-28',
        status: 'pending',
        is_overdue: true,
        days_until_due: -4
      },
      {
        id: 5,
        title: 'Seguro Residencial',
        company: 'Seguradora XYZ',
        category: 'Seguros',
        original_amount: 156.40,
        final_amount: 156.40,
        due_date: '2025-08-25',
        payment_date: '2025-08-24',
        status: 'paid',
        payment_method: 'PIX'
      },
      {
        id: 6,
        title: 'Financiamento Veículo',
        company: 'Banco ABC',
        category: 'Financiamentos',
        original_amount: 890.50,
        final_amount: 890.50,
        due_date: '2025-08-20',
        payment_date: '2025-08-19',
        status: 'paid',
        payment_method: 'Débito Automático'
      }
    ];

    setSummary(mockSummary);
    setBills(mockBills);
  }, []);

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
    // In a real app, this would open a payment modal or redirect to payment flow
    console.log('Paying bill:', billId);
    // Mock payment
    setBills(bills.map(bill => 
      bill.id === billId 
        ? { ...bill, status: 'paid', payment_date: new Date().toISOString().split('T')[0], payment_method: 'PIX' }
        : bill
    ));
  };

  if (showAddBill) {
    return <AddBillForm onBack={() => setShowAddBill(false)} onSave={(bill) => {
      setBills([...bills, { ...bill, id: Date.now() }]);
      setShowAddBill(false);
    }} />;
  }

  if (showBarcodeScanner) {
    return <BarcodeScanner onBack={() => setShowBarcodeScanner(false)} onScan={(billData) => {
      setBills([...bills, { ...billData, id: Date.now() }]);
      setShowBarcodeScanner(false);
    }} />;
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
                <Receipt className="w-6 h-6 mr-2 text-blue-600" />
                Pagamento de Boletos
              </h1>
              <p className="text-gray-600">Gerencie e pague suas contas</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowBarcodeScanner(true)} className="bg-purple-600 hover:bg-purple-700">
              <Scan className="w-4 h-4 mr-2" />
              Escanear Código
            </Button>
            <Button onClick={() => setShowAddBill(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
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
                R$ {summary.total_pending_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                R$ {summary.total_paid_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.overdue_bills}</div>
              <p className="text-xs text-gray-600">
                R$ {summary.total_overdue_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contas..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
                <option value="paid">Pagas</option>
                <option value="overdue">Vencidas</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as categorias</option>
                <option value="Energia">Energia</option>
                <option value="Água">Água</option>
                <option value="Telecomunicações">Telecomunicações</option>
                <option value="Gás">Gás</option>
                <option value="Seguros">Seguros</option>
                <option value="Financiamentos">Financiamentos</option>
              </select>

              <Button variant="outline" onClick={() => setFilters({ status: 'all', category: 'all', search: '' })}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Contas ({filteredBills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(bill.status, bill.is_overdue)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {bill.title}
                        </h3>
                        <Badge variant={getStatusColor(bill.status, bill.is_overdue)}>
                          {getStatusText(bill.status, bill.is_overdue, bill.days_until_due)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">{bill.company}</p>
                        <Badge variant="outline">{bill.category}</Badge>
                        <p className="text-sm text-gray-600">
                          Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      {bill.barcode && (
                        <p className="text-xs text-gray-500 mt-1">
                          Código: {bill.barcode.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {bill.final_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {bill.interest_amount > 0 && (
                        <p className="text-sm text-red-600">
                          +R$ {bill.interest_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} juros
                        </p>
                      )}
                      {bill.payment_method && (
                        <p className="text-xs text-gray-600">
                          Pago via {bill.payment_method}
                        </p>
                      )}
                    </div>

                    {bill.status === 'pending' && (
                      <Button 
                        onClick={() => handlePayBill(bill.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredBills.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

// Add Bill Form Component
const AddBillForm = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'Energia',
    original_amount: '',
    due_date: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      original_amount: parseFloat(formData.original_amount),
      final_amount: parseFloat(formData.original_amount),
      status: 'pending',
      is_overdue: false,
      days_until_due: Math.ceil((new Date(formData.due_date) - new Date()) / (1000 * 60 * 60 * 24))
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
                  Nova Conta
                </CardTitle>
                <CardDescription>Adicione uma nova conta para pagamento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Conta *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Conta de Energia Elétrica"
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Ex: Companhia de Energia"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Energia">Energia</option>
                  <option value="Água">Água</option>
                  <option value="Telecomunicações">Telecomunicações</option>
                  <option value="Gás">Gás</option>
                  <option value="Seguros">Seguros</option>
                  <option value="Financiamentos">Financiamentos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.original_amount}
                  onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

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

// Barcode Scanner Component
const BarcodeScanner = ({ onBack, onScan }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async () => {
    if (!barcodeInput.trim()) return;
    
    setIsProcessing(true);
    
    // Mock barcode processing
    setTimeout(() => {
      const mockBillData = {
        title: 'Conta identificada por código de barras',
        company: 'Empresa identificada',
        category: 'Energia',
        original_amount: 187.45,
        final_amount: 187.45,
        due_date: '2025-09-15',
        status: 'pending',
        is_overdue: false,
        days_until_due: 14,
        barcode: barcodeInput
      };
      
      onScan(mockBillData);
      setIsProcessing(false);
    }, 2000);
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
                  <Scan className="w-5 h-5 mr-2 text-purple-600" />
                  Escanear Código de Barras
                </CardTitle>
                <CardDescription>Digite ou escaneie o código de barras da conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Scan className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-gray-600">
                Digite o código de barras ou linha digitável da sua conta
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="barcode">Código de Barras / Linha Digitável</Label>
                <Input
                  id="barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Digite ou cole o código aqui..."
                  className="text-center font-mono"
                />
              </div>

              <Button 
                onClick={handleScan}
                disabled={!barcodeInput.trim() || isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Processar Código
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Digite ou cole o código de barras completo</li>
                <li>• Ou use a linha digitável (números separados por espaços)</li>
                <li>• O sistema identificará automaticamente os dados da conta</li>
                <li>• Você poderá revisar e editar antes de salvar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillPayment;

