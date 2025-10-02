import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Percent,
  Save,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import dataService from '@/services/dataService';

const PaymentMethodManager = ({ onClose }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [editingMethod, setEditingMethod] = useState(null);
  const [newMethod, setNewMethod] = useState({ name: '', fee: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});

  // Load payment methods from dataService on component mount
  useEffect(() => {
    const methods = dataService.getPaymentMethods();
    setPaymentMethods(methods);
  }, []);

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (data.fee === '' || isNaN(data.fee) || parseFloat(data.fee) < 0) {
      newErrors.fee = 'Taxa deve ser um número válido (0 ou maior)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMethod = () => {
    if (!validateForm(newMethod)) {
      return;
    }

    const method = {
      id: Date.now().toString(),
      name: newMethod.name.trim(),
      fee: parseFloat(newMethod.fee)
    };

    const updatedMethods = [...paymentMethods, method];
    
    // Save to localStorage using dataService
    localStorage.setItem(dataService.PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
    setPaymentMethods(updatedMethods);
    
    setNewMethod({ name: '', fee: '' });
    setShowAddForm(false);
    setErrors({});
  };

  const handleEditMethod = (method) => {
    setEditingMethod({
      ...method,
      fee: method.fee.toString()
    });
  };

  const handleUpdateMethod = () => {
    if (!validateForm(editingMethod)) {
      return;
    }

    const updatedMethods = paymentMethods.map(method =>
      method.id === editingMethod.id
        ? {
            ...method,
            name: editingMethod.name.trim(),
            fee: parseFloat(editingMethod.fee)
          }
        : method
    );

    // Save to localStorage using dataService
    localStorage.setItem(dataService.PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
    setPaymentMethods(updatedMethods);
    setEditingMethod(null);
    setErrors({});
  };

  const handleDeleteMethod = (methodId) => {
    if (window.confirm('Tem certeza que deseja excluir este método de pagamento?')) {
      const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
      
      // Save to localStorage using dataService
      localStorage.setItem(dataService.PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
      setPaymentMethods(updatedMethods);
    }
  };

  const formatFee = (fee) => {
    return `${fee.toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Gerenciar Métodos de Pagamento
              </CardTitle>
              <CardDescription>
                Configure os métodos de pagamento e suas respectivas taxas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Info Card */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  Os métodos de pagamento cadastrados aqui estarão disponíveis para seleção ao registrar novas transações.
                  As taxas configuradas serão automaticamente calculadas com base no valor da transação.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add New Method Form */}
          {showAddForm && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Novo Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nome *</Label>
                    <Input
                      id="new-name"
                      placeholder="Ex: Cartão Visa"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-fee" className="flex items-center">
                      <Percent className="h-3 w-3 mr-1" />
                      Taxa (%)
                    </Label>
                    <Input
                      id="new-fee"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={newMethod.fee}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, fee: e.target.value }))}
                      className={errors.fee ? 'border-red-500' : ''}
                    />
                    {errors.fee && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.fee}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddMethod} size="sm">
                    <Save className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewMethod({ name: '', fee: '' });
                      setErrors({});
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Button */}
          {!showAddForm && (
            <div className="mb-6">
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Método de Pagamento
              </Button>
            </div>
          )}

          {/* Payment Methods List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Métodos Cadastrados</h3>
            
            {paymentMethods.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum método cadastrado
                  </h3>
                  <p className="text-gray-600">
                    Adicione métodos de pagamento para começar a usar o sistema.
                  </p>
                </CardContent>
              </Card>
            ) : (
              paymentMethods.map((method) => (
                <Card key={method.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {editingMethod && editingMethod.id === method.id ? (
                      // Edit Mode
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={editingMethod.name}
                            onChange={(e) => setEditingMethod(prev => ({ ...prev, name: e.target.value }))}
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <Percent className="h-3 w-3 mr-1" />
                            Taxa (%)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={editingMethod.fee}
                            onChange={(e) => setEditingMethod(prev => ({ ...prev, fee: e.target.value }))}
                            className={errors.fee ? 'border-red-500' : ''}
                          />
                          {errors.fee && (
                            <p className="text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.fee}
                            </p>
                          )}
                        </div>
                        
                        <div className="md:col-span-2 flex gap-2">
                          <Button onClick={handleUpdateMethod} size="sm">
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingMethod(null);
                              setErrors({});
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{method.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={method.fee === 0 ? 'default' : 'secondary'}>
                                Taxa: {formatFee(method.fee)}
                              </Badge>
                              {method.fee === 0 && (
                                <Badge variant="outline" className="text-green-600">
                                  Sem taxa
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMethod(method)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMethod(method.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodManager;
