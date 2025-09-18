// Data service for managing localStorage operations
class DataService {
  constructor() {
    this.STORAGE_KEY = 'lupa_transactions';
    this.PAYMENT_METHODS_KEY = 'lupa_payment_methods';
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
      
      transactions.push(newTransaction);
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
      const index = transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Transaction not found');
      }
      
      transactions[index] = {
        ...transactions[index],
        ...updatedData,
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
      const filteredTransactions = transactions.filter(t => t.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTransactions));
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Filter transactions by type
  getTransactionsByType(type) {
    return this.getTransactions().filter(t => t.type === type);
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

  // Dashboard calculations
  getDashboardData() {
    const transactions = this.getTransactions();
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + (t.net_amount || 0), 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.net_amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    // Calculate category distribution
    const categoryStats = {};
    incomeTransactions.forEach(t => {
      if (t.category) {
        categoryStats[t.category] = (categoryStats[t.category] || 0) + (t.net_amount || 0);
      }
    });

    // Calculate payment method distribution
    const paymentMethodStats = {};
    incomeTransactions.forEach(t => {
      if (t.payment_method) {
        const paymentMethods = this.getPaymentMethods();
        const method = paymentMethods.find(pm => pm.id === t.payment_method);
        const methodName = method ? method.name : 'Desconhecido';
        paymentMethodStats[methodName] = (paymentMethodStats[methodName] || 0) + (t.net_amount || 0);
      }
    });

    // Find top category and payment method
    const topCategory = Object.keys(categoryStats).length > 0 
      ? Object.keys(categoryStats).reduce((a, b) => categoryStats[a] > categoryStats[b] ? a : b)
      : 'N/A';
    
    const topPaymentMethod = Object.keys(paymentMethodStats).length > 0
      ? Object.keys(paymentMethodStats).reduce((a, b) => paymentMethodStats[a] > paymentMethodStats[b] ? a : b)
      : 'N/A';

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      transactionCount: incomeTransactions.length,
      averageTransaction: incomeTransactions.length > 0 ? totalRevenue / incomeTransactions.length : 0,
      topCategory,
      topPaymentMethod,
      categoryStats,
      paymentMethodStats,
      pendingBills: 0, // TODO: Implement when bills feature is added
      overduePayments: 0, // TODO: Implement when receivables feature is added
      activeCustomers: 0, // TODO: Implement when customers feature is added
      monthlyGrowth: 0 // TODO: Calculate based on historical data
    };
  }

  // Get monthly data for charts
  getMonthlyData() {
    const transactions = this.getTransactions();
    const monthlyData = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          receita: 0,
          despesas: 0,
          lucro: 0
        };
      }

      const amount = transaction.net_amount || 0;
      if (transaction.type === 'income') {
        monthlyData[monthKey].receita += amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].despesas += amount;
      }
    });

    // Calculate profit for each month
    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].lucro = monthlyData[key].receita - monthlyData[key].despesas;
    });

    // Return last 6 months of data
    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6);
  }

  // Get daily data for the last week
  getDailyData() {
    const transactions = this.getTransactions();
    const dailyData = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dailyData[dayKey] = {
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        entradas: 0,
        saidas: 0
      };
    }

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const dayKey = transactionDate.toISOString().split('T')[0];
      
      if (dailyData[dayKey]) {
        const amount = transaction.net_amount || 0;
        if (transaction.type === 'income') {
          dailyData[dayKey].entradas += amount;
        } else if (transaction.type === 'expense') {
          dailyData[dayKey].saidas += amount;
        }
      }
    });

    return Object.values(dailyData);
  }

  // Clear all data (for testing purposes)
  clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PAYMENT_METHODS_KEY);
  }
}

export default new DataService();
