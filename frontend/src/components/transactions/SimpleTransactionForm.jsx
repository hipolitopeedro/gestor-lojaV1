import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Receipt, 
  DollarSign, 
  Calendar, 
  FileText, 
  CreditCard,
  Calculator,
  Settings
} from 'lucide-react';
import PaymentMethodManager from './PaymentMethodManager';
import dataService from '@/services/dataService';

const SimpleTransactionForm = ({ type, onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    type: type || 'income',
    amount: '',
    description: '',
    category: '',
    payment_method: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [cardFee, setCardFee] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentMethodManager, setShowPaymentMethodManager] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Load payment methods from localStorage
  useEffect(() => {
    const savedMethods = localStorage.getItem('lupa_payment_methods');
    if (savedMethods) {
      setPaymentMethods(JSON.parse(savedMethods));
    } else {
      // Default payment methods
      const defaultMethods = [
        { id: 1, name: 'PIX', fee: 0 },
        { id: 2, name: 'Dinheiro', fee: 0 },
        { id: 3, name: 'Cartão Débito', fee: 1.5 },
        { id: 4, name: 'Cartão Crédito', fee: 3.5 },
        { id: 5, name: 'Boleto', fee: 2.0 }
      ];
      setPaymentMethods(defaultMethods);
      localStorage.setItem('lupa_payment_methods', JSON.stringify(defaultMethods));
    }
  }, []);

  // Categories
  const incomeCategories = [
    'Vendas', 'Serviços', 'Comissões', 'Juros', 'Aluguel', 'Outros'
  ];

  const expenseCategories = [
    'Fornecedores', 'Salários', 'Aluguel', 'Marketing', 'Transporte', 
    'Alimentação', 'Energia', 'Internet', 'Telefone', 'Materiais', 'Outros'
  ];

  // Calculate card fee and net amount
  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const selectedMethod = paymentMethods.find(method => method.id.toString() === formData.payment_method);
    const feeRate = selectedMethod ? selectedMethod.fee / 100 : 0;
    const fee = amount * feeRate;
    const net = amount - fee;

    setCardFee(fee);
    setNetAmount(net);
  }, [formData.amount, formData.payment_method, paymentMethods]);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        amount: initialData.amount.toString(),
        description: initialData.description,
        category: initialData.category,
        payment_method: initialData.payment_method || '',
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.category || formData.category === 'Selecione uma categoria') {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.payment_method || formData.payment_method === 'Selecione a forma de pagamento') {
      newErrors.payment_method = 'Forma de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        card_fee: cardFee,
        net_amount: netAmount
      };

      // Save transaction using dataService
      const savedTransaction = await dataService.saveTransaction(submitData);
      
      // Call the parent onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(savedTransaction);
      }
      
      // Navigate back or reset form
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          {formData.type === 'income' ? (
            <Receipt className="h-5 w-5 mr-2 text-green-600" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2 text-red-600" />
          )}
          {initialData ? 'Editar' : 'Nova'} {formData.type === 'income' ? 'Entrada' : 'Despesa'}
        </CardTitle>
        <CardDescription>
          {formData.type === 'income' 
            ? 'Registre uma nova entrada no seu caixa'
            : 'Registre uma nova despesa do seu negócio'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Valor *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Descrição *
            </Label>
            <Input
              id="description"
              placeholder="Descreva a transação..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              Categoria *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                Forma de Pagamento *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentMethodManager(true)}
              >
                <Settings className="h-3 w-3 mr-1" />
                Gerenciar
              </Button>
            </div>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => handleInputChange('payment_method', value)}
            >
              <SelectTrigger className={`w-full ${errors.payment_method ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name} {method.fee > 0 && `(${method.fee}%)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.payment_method}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Data *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Fee Calculation */}
          {formData.payment_method && cardFee > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calculator className="h-4 w-4 mr-2 text-yellow-600" />
                <span className="font-medium text-yellow-800">Cálculo de Taxas</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor Bruto:</span>
                  <span>{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Taxa ({paymentMethods.find(m => m.id.toString() === formData.payment_method)?.fee || 0}%):</span>
                  <span>-{formatCurrency(cardFee)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Valor Líquido:</span>
                  <span className="text-green-600">{formatCurrency(netAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Salvando...' : (initialData ? 'Atualizar' : 'Salvar')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Payment Method Manager Modal */}
      {showPaymentMethodManager && (
        <PaymentMethodManager
          onClose={() => {
            setShowPaymentMethodManager(false);
            // Refresh payment methods after closing the manager
            const savedMethods = localStorage.getItem('lupa_payment_methods');
            if (savedMethods) {
              setPaymentMethods(JSON.parse(savedMethods));
            }
          }}
        />
      )}
    </Card>
  );
};

export default SimpleTransactionForm;
