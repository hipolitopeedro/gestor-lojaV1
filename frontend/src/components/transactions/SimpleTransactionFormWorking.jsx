import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Calculator } from 'lucide-react';
import dataService from '@/services/dataService';

const SimpleTransactionFormWorking = ({ type, onSubmit, onCancel, initialData = null }) => {
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
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Load payment methods
  useEffect(() => {
    try {
      const methods = dataService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  }, []);

  // Calculate fees when amount or payment method changes
  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const selectedMethod = paymentMethods.find(m => m.id === formData.payment_method);
    const feeRate = selectedMethod ? selectedMethod.fee : 0;
    const fee = (amount * feeRate) / 100;
    const net = amount - fee;

    setCardFee(fee);
    setNetAmount(net);
  }, [formData.amount, formData.payment_method, paymentMethods]);

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

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Forma de pagamento é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
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
      
      // Navigate back
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

  const categories = [
    'Vendas',
    'Serviços',
    'Consultoria',
    'Produtos',
    'Comissões',
    'Outros'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {type === 'income' ? 'Nova Entrada' : 'Nova Despesa'}
              </h1>
              <p className="text-gray-600">
                Registre uma nova {type === 'income' ? 'entrada' : 'despesa'} no sistema
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Detalhes da Transação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Descreva a transação"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label>Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label>Forma de Pagamento *</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value) => handleInputChange('payment_method', value)}
                >
                  <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} {method.fee > 0 && `(${method.fee}%)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Fee Calculation */}
              {cardFee > 0 && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Cálculo de Taxas</h3>
                    <div className="space-y-1 text-sm text-yellow-700">
                      <div className="flex justify-between">
                        <span>Valor Bruto:</span>
                        <span>{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa ({paymentMethods.find(m => m.id === formData.payment_method)?.fee || 0}%):</span>
                        <span>-{formatCurrency(cardFee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-yellow-300 pt-1">
                        <span>Valor Líquido:</span>
                        <span>{formatCurrency(netAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleTransactionFormWorking;
