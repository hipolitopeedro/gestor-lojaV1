// Data service for managing localStorage operations and realistic MVP demo seed data
class DataService {
  constructor() {
    this.STORAGE_KEY = 'lupa_transactions';
    this.PAYMENT_METHODS_KEY = 'lupa_payment_methods';
    this.BILLS_KEY = 'lupa_bills';
    this.RECEIVABLES_KEY = 'lupa_receivables';
    this.SEEDED_FLAG_KEY = 'lupa_mvp_seeded_v2';
    this.ensureSeedData();
  }

  // Automatically populate realistic demo data on first visit so MVP presentations look complete
  ensureSeedData() {
    try {
      const alreadySeeded = localStorage.getItem(this.SEEDED_FLAG_KEY);
      const existingTx = localStorage.getItem(this.STORAGE_KEY);
      if (!alreadySeeded && (!existingTx || JSON.parse(existingTx).length === 0)) {
        this.resetToDemoData();
      }
    } catch (error) {
      console.error('Error checking seed data:', error);
    }
  }

  resetToDemoData() {
    const today = new Date();
    const daysAgo = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().split('T')[0];
    };
    const daysFromNow = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0];
    };

    const paymentMethods = this.getDefaultPaymentMethods();
    localStorage.setItem(this.PAYMENT_METHODS_KEY, JSON.stringify(paymentMethods));

    const demoTransactions = [
      {
        id: 'tx-101',
        type: 'income',
        amount: 4850.00,
        card_fee: 0,
        net_amount: 4850.00,
        description: 'Vendas Balcão - Lote Semanal',
        category: 'Vendas',
        payment_method: '1', // PIX
        date: daysAgo(1),
        notes: 'Pagamentos via PIX QR Code',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-102',
        type: 'income',
        amount: 3200.00,
        card_fee: 112.00,
        net_amount: 3088.00,
        description: 'Vendas Parceladas Cartão',
        category: 'Produtos',
        payment_method: '4', // Cartão Crédito (3.5%)
        date: daysAgo(2),
        notes: 'Maquininha principal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-103',
        type: 'expense',
        amount: 2400.00,
        card_fee: 0,
        net_amount: 2400.00,
        description: 'Reposição de Estoque - Fornecedor Central',
        category: 'Fornecedores',
        payment_method: '1', // PIX
        date: daysAgo(2),
        notes: 'Nota Fiscal #4821',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-104',
        type: 'income',
        amount: 1950.00,
        card_fee: 29.25,
        net_amount: 1920.75,
        description: 'Serviços de Manutenção e Atendimento',
        category: 'Serviços',
        payment_method: '3', // Cartão Débito (1.5%)
        date: daysAgo(3),
        notes: 'Clientes avulsos',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-105',
        type: 'expense',
        amount: 1850.00,
        card_fee: 0,
        net_amount: 1850.00,
        description: 'Aluguel do Ponto Comercial',
        category: 'Aluguel',
        payment_method: '5', // Boleto
        date: daysAgo(4),
        notes: 'Contrato mensal imobiliária',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-106',
        type: 'income',
        amount: 2780.00,
        card_fee: 0,
        net_amount: 2780.00,
        description: 'Pedido Corporativo - Entrega Expressa',
        category: 'Vendas',
        payment_method: '1', // PIX
        date: daysAgo(5),
        notes: 'Cliente PJ recorrente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-107',
        type: 'expense',
        amount: 680.00,
        card_fee: 0,
        net_amount: 680.00,
        description: 'Campanha Tráfego Pago & Instagram Ads',
        category: 'Marketing',
        payment_method: '4',
        date: daysAgo(5),
        notes: 'Campanha mensal divulgação local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-108',
        type: 'income',
        amount: 9400.00,
        card_fee: 141.00,
        net_amount: 9259.00,
        description: 'Faturamento Quinzena Anterior',
        category: 'Vendas',
        payment_method: '3',
        date: daysAgo(35),
        notes: 'Fechamento consolidado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-109',
        type: 'expense',
        amount: 5100.00,
        card_fee: 0,
        net_amount: 5100.00,
        description: 'Folha Salarial e Encargos + Fornecedores',
        category: 'Salários',
        payment_method: '1',
        date: daysAgo(38),
        notes: 'Pagamento equipe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-110',
        type: 'income',
        amount: 8200.00,
        card_fee: 0,
        net_amount: 8200.00,
        description: 'Faturamento Mensal Consolidado',
        category: 'Vendas',
        payment_method: '1',
        date: daysAgo(65),
        notes: 'Histórico trimestral',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tx-111',
        type: 'expense',
        amount: 4650.00,
        card_fee: 0,
        net_amount: 4650.00,
        description: 'Custos Operacionais e Mercadorias',
        category: 'Fornecedores',
        payment_method: '5',
        date: daysAgo(68),
        notes: 'Histórico trimestral',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const demoBills = [
      {
        id: 201,
        title: 'Conta de Energia Elétrica',
        company: 'CEMIG Distribuição S.A.',
        category: 'Energia',
        original_amount: 485.90,
        final_amount: 485.90,
        due_date: daysFromNow(2),
        barcode: '83640000004-8 85900138001-2 00000000000-0 00000000000-0',
        notes: 'Vencimento próximo',
        status: 'pending',
        is_overdue: false,
        days_until_due: 2,
        interest_amount: 0
      },
      {
        id: 202,
        title: 'Link Dedicado Fibra 600Mbps',
        company: 'Vivo Empresas',
        category: 'Internet',
        original_amount: 199.90,
        final_amount: 199.90,
        due_date: daysFromNow(5),
        barcode: '84670000001-9 99900291004-7 00000000000-0 00000000000-0',
        notes: 'Débito mensal internet loja',
        status: 'pending',
        is_overdue: false,
        days_until_due: 5,
        interest_amount: 0
      },
      {
        id: 203,
        title: 'Fornecedor de Embalagens e Sacolas',
        company: 'PackBrasil Indústria',
        category: 'Outros',
        original_amount: 640.00,
        final_amount: 652.80,
        due_date: daysAgo(3),
        barcode: '23793.38128 60083.013528 56000.063305 9 98710000064000',
        notes: 'Boleto em atraso - aguardando conciliação',
        status: 'pending',
        is_overdue: true,
        days_until_due: -3,
        interest_amount: 12.80
      },
      {
        id: 204,
        title: 'Taxa de Água e Saneamento',
        company: 'COPASA MG',
        category: 'Água',
        original_amount: 142.50,
        final_amount: 142.50,
        due_date: daysAgo(8),
        payment_date: daysAgo(9),
        payment_method: 'PIX',
        barcode: '82600000001-5 42500049102-1 00000000000-0 00000000000-0',
        status: 'paid',
        is_overdue: false,
        days_until_due: 0,
        interest_amount: 0
      }
    ];

    const demoReceivables = [
      {
        id: 301,
        customer_name: 'Carlos Eduardo Mendes',
        customer_phone: '(31) 99812-4410',
        customer_email: 'carlos.mendes@email.com',
        type: 'fiado',
        description: 'Compra mensal conveniência (Caderno de Clientes)',
        reference_number: 'FD-104',
        original_amount: 750.00,
        paid_amount: 300.00,
        remaining_amount: 450.00,
        issue_date: daysAgo(12),
        due_date: daysFromNow(4),
        status: 'partial',
        is_overdue: false,
        days_until_due: 4,
        days_overdue: 0,
        payments: [
          { id: 1, amount: 300.00, payment_method: 'PIX', payment_date: daysAgo(5), notes: 'Adiantamento via PIX' }
        ]
      },
      {
        id: 302,
        customer_name: 'Oficina & Auto Peças Rocha Ltda',
        customer_phone: '(31) 3421-8890',
        customer_email: 'financeiro@autorocha.com.br',
        type: 'invoice',
        description: 'Faturamento Corporativo B2B - Lote #19',
        reference_number: 'NF-0882',
        original_amount: 1680.00,
        paid_amount: 0,
        remaining_amount: 1680.00,
        issue_date: daysAgo(15),
        due_date: daysFromNow(6),
        status: 'pending',
        is_overdue: false,
        days_until_due: 6,
        days_overdue: 0,
        payments: []
      },
      {
        id: 303,
        customer_name: 'Repasse Operadora Stone / Máquina',
        customer_phone: '0800-941-2100',
        customer_email: 'repasse@stone.com.br',
        type: 'machine_receipt',
        description: 'Lote vendas crédito parcelado a liquidar',
        reference_number: 'STN-5591',
        original_amount: 2340.00,
        paid_amount: 2340.00,
        remaining_amount: 0,
        issue_date: daysAgo(20),
        due_date: daysAgo(2),
        status: 'paid',
        is_overdue: false,
        days_until_due: 0,
        days_overdue: 0,
        payments: [
          { id: 2, amount: 2340.00, payment_method: 'Transferência', payment_date: daysAgo(2), notes: 'Liquidado na conta' }
        ]
      },
      {
        id: 304,
        customer_name: 'Fernanda Cristina Oliveira',
        customer_phone: '(31) 98744-1120',
        customer_email: 'fernanda.oli@email.com',
        type: 'fiado',
        description: 'Encomenda especial produtos da loja',
        reference_number: 'FD-099',
        original_amount: 390.00,
        paid_amount: 0,
        remaining_amount: 390.00,
        issue_date: daysAgo(25),
        due_date: daysAgo(4),
        status: 'pending',
        is_overdue: true,
        days_until_due: -4,
        days_overdue: 4,
        payments: []
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(demoTransactions));
    localStorage.setItem(this.BILLS_KEY, JSON.stringify(demoBills));
    localStorage.setItem(this.RECEIVABLES_KEY, JSON.stringify(demoReceivables));
    localStorage.setItem(this.SEEDED_FLAG_KEY, 'true');
  }

  // Transaction operations
  getTransactions() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  saveTransaction(transaction) {
    try {
      const transactions = this.getTransactions();
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      transactions.unshift(newTransaction);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  updateTransaction(id, updatedData) {
    try {
      const transactions = this.getTransactions();
      const index = transactions.findIndex(t => String(t.id) === String(id));

      if (index === -1) {
        throw new Error('Transaction not found');
      }

      transactions[index] = {
        ...transactions[index],
        ...updatedData,
        id: transactions[index].id,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
      return transactions[index];
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  deleteTransaction(id) {
    try {
      const transactions = this.getTransactions();
      const filteredTransactions = transactions.filter(t => String(t.id) !== String(id));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTransactions));
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  getTransactionsByType(type) {
    return this.getTransactions().filter(t => t.type === type);
  }

  // Bills & Receivables helpers
  getBills() {
    try {
      const data = localStorage.getItem(this.BILLS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getReceivables() {
    try {
      const data = localStorage.getItem(this.RECEIVABLES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Payment methods operations
  getPaymentMethods() {
    try {
      const data = localStorage.getItem(this.PAYMENT_METHODS_KEY);
      return data ? JSON.parse(data) : this.getDefaultPaymentMethods();
    } catch (error) {
      console.error('Error loading payment methods:', error);
      return this.getDefaultPaymentMethods();
    }
  }

  getDefaultPaymentMethods() {
    return [
      { id: '1', name: 'PIX', fee: 0 },
      { id: '2', name: 'Dinheiro', fee: 0 },
      { id: '3', name: 'Cartão Débito', fee: 1.5 },
      { id: '4', name: 'Cartão Crédito', fee: 3.5 },
      { id: '5', name: 'Boleto', fee: 2.0 },
      { id: '6', name: 'Cartão Mastercard', fee: 2.8 }
    ];
  }

  savePaymentMethod(method) {
    const methods = this.getPaymentMethods();
    const newMethod = { ...method, id: Date.now().toString() };
    methods.push(newMethod);
    localStorage.setItem(this.PAYMENT_METHODS_KEY, JSON.stringify(methods));
    return newMethod;
  }

  updatePaymentMethod(id, updatedData) {
    const methods = this.getPaymentMethods();
    const index = methods.findIndex(m => String(m.id) === String(id));
    if (index === -1) throw new Error('Payment method not found');
    methods[index] = { ...methods[index], ...updatedData };
    localStorage.setItem(this.PAYMENT_METHODS_KEY, JSON.stringify(methods));
    return methods[index];
  }

  deletePaymentMethod(id) {
    const methods = this.getPaymentMethods();
    const filteredMethods = methods.filter(m => String(m.id) !== String(id));
    localStorage.setItem(this.PAYMENT_METHODS_KEY, JSON.stringify(filteredMethods));
    return true;
  }

  // Dashboard calculations with live integration across Transactions, Bills & Receivables
  getDashboardData() {
    const transactions = this.getTransactions();
    const bills = this.getBills();
    const receivables = this.getReceivables();

    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + (parseFloat(t.net_amount ?? t.amount) || 0), 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (parseFloat(t.net_amount ?? t.amount) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    const totalFeesPaid = transactions.reduce((sum, t) => sum + (parseFloat(t.card_fee) || 0), 0);

    const incomeCategoryStats = {};
    incomeTransactions.forEach(t => {
      if (t.category) {
        incomeCategoryStats[t.category] = (incomeCategoryStats[t.category] || 0) + (parseFloat(t.net_amount ?? t.amount) || 0);
      }
    });

    const expenseCategoryStats = {};
    expenseTransactions.forEach(t => {
      if (t.category) {
        expenseCategoryStats[t.category] = (expenseCategoryStats[t.category] || 0) + (parseFloat(t.net_amount ?? t.amount) || 0);
      }
    });

    const paymentMethods = this.getPaymentMethods();
    const paymentMethodStats = {};
    transactions.forEach(t => {
      if (t.payment_method) {
        const method = paymentMethods.find(pm => String(pm.id) === String(t.payment_method));
        const methodName = method ? method.name : String(t.payment_method);
        paymentMethodStats[methodName] = (paymentMethodStats[methodName] || 0) + (parseFloat(t.net_amount ?? t.amount) || 0);
      }
    });

    const topIncomeCategory = Object.keys(incomeCategoryStats).length > 0
      ? Object.keys(incomeCategoryStats).reduce((a, b) => incomeCategoryStats[a] > incomeCategoryStats[b] ? a : b)
      : 'N/A';

    const topExpenseCategory = Object.keys(expenseCategoryStats).length > 0
      ? Object.keys(expenseCategoryStats).reduce((a, b) => expenseCategoryStats[a] > expenseCategoryStats[b] ? a : b)
      : 'N/A';

    const topPaymentMethod = Object.keys(paymentMethodStats).length > 0
      ? Object.keys(paymentMethodStats).reduce((a, b) => paymentMethodStats[a] > paymentMethodStats[b] ? a : b)
      : 'N/A';

    const topIncomeCategoryPct = (totalRevenue > 0 && topIncomeCategory !== 'N/A')
      ? Math.round((incomeCategoryStats[topIncomeCategory] / totalRevenue) * 100)
      : 0;

    const topExpenseCategoryPct = (totalExpenses > 0 && topExpenseCategory !== 'N/A')
      ? Math.round((expenseCategoryStats[topExpenseCategory] / totalExpenses) * 100)
      : 0;

    const totalVolume = totalRevenue + totalExpenses;
    const topPaymentMethodPct = (totalVolume > 0 && topPaymentMethod !== 'N/A')
      ? Math.round((paymentMethodStats[topPaymentMethod] / totalVolume) * 100)
      : 0;

    // Live Bills & Receivables metrics
    const pendingBillsCount = bills.filter(b => b.status === 'pending').length;
    const overdueBillsCount = bills.filter(b => b.is_overdue && b.status !== 'paid').length;
    const overdueReceivablesCount = receivables.filter(r => r.is_overdue && r.status !== 'paid').length;
    const uniqueCustomers = new Set(receivables.map(r => r.customer_name).filter(Boolean)).size;

    // Calculate monthly growth from monthly data
    const monthlySeries = this.getMonthlyData();
    let monthlyGrowth = 14.2;
    if (monthlySeries.length >= 2) {
      const prev = monthlySeries[monthlySeries.length - 2].receita;
      const curr = monthlySeries[monthlySeries.length - 1].receita;
      if (prev > 0) {
        monthlyGrowth = Math.round(((curr - prev) / prev) * 1000) / 10;
      }
    }

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      incomeTransactionCount: incomeTransactions.length,
      expenseTransactionCount: expenseTransactions.length,
      transactionCount: transactions.length,
      averageIncome: incomeTransactions.length > 0 ? totalRevenue / incomeTransactions.length : 0,
      averageExpense: expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0,
      averageTransaction: transactions.length > 0 ? (totalRevenue + totalExpenses) / transactions.length : 0,
      topIncomeCategory,
      topExpenseCategory,
      topIncomeCategoryPct,
      topExpenseCategoryPct,
      topCategory: topIncomeCategory,
      topPaymentMethod,
      topPaymentMethodPct,
      incomeCategoryStats,
      expenseCategoryStats,
      categoryStats: expenseCategoryStats,
      paymentMethodStats,
      totalFeesPaid,
      pendingBills: pendingBillsCount,
      overduePayments: overdueBillsCount + overdueReceivablesCount,
      activeCustomers: uniqueCustomers,
      monthlyGrowth
    };
  }

  getMonthlyData() {
    const transactions = this.getTransactions();
    const monthlyData = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date + 'T12:00:00');
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          sortKey: monthKey,
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          receita: 0,
          despesas: 0,
          lucro: 0
        };
      }

      const amount = parseFloat(transaction.net_amount ?? transaction.amount) || 0;
      if (transaction.type === 'income') {
        monthlyData[monthKey].receita += amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].despesas += amount;
      }
    });

    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].lucro = monthlyData[key].receita - monthlyData[key].despesas;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);
  }

  getDailyData() {
    const transactions = this.getTransactions();
    const dailyData = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dailyData[dayKey] = {
        day: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        entradas: 0,
        saidas: 0
      };
    }

    transactions.forEach(transaction => {
      const dayKey = (transaction.date || '').split('T')[0];
      if (dailyData[dayKey]) {
        const amount = parseFloat(transaction.net_amount ?? transaction.amount) || 0;
        if (transaction.type === 'income') {
          dailyData[dayKey].entradas += amount;
        } else if (transaction.type === 'expense') {
          dailyData[dayKey].saidas += amount;
        }
      }
    });

    return Object.values(dailyData);
  }

  clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PAYMENT_METHODS_KEY);
    localStorage.removeItem(this.BILLS_KEY);
    localStorage.removeItem(this.RECEIVABLES_KEY);
    localStorage.removeItem(this.SEEDED_FLAG_KEY);
  }
}

export default new DataService();
