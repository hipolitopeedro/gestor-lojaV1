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

const PaymentMethodManager = ({ onClose, hideFeatures = false }) => {
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

    if (!hideFeatures) {
      if (data.fee === '' || isNaN(data.fee) || parseFloat(data.fee) < 0) {
        newErrors.fee = 'Taxa deve ser um número válido (0 ou maior)';
      }
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
      fee: hideFeatures ? 0 : parseFloat(newMethod.fee)
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
            fee: hideFeatures ? 0 : parseFloat(editingMethod.fee)
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
      const updatedMethods = paymentMethods.filter(m => m.id !== methodId);
      localStorage.setItem(dataService.PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
      setPaymentMethods(updatedMethods);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Gerenciar Formas de Pagamento
            </CardTitle>
            <CardDescription>
              {hideFeatures ? 'Cadastre as formas de pagamento para boletos' : 'Adicione e configure suas formas de pagamento com taxas'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          {!hideFeatures && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Dica:</p>
                <p>Configure as taxas de cada forma de pagamento. Estas taxas serão aplicadas automaticamente ao registrar transações.</p>
              </div>
            </div>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">Adicionar Nova Forma de Pagamento</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-method-name">Nome *</Label>
                  <Input
                    id="new-method-name"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    placeholder="Ex: Cartão Elo"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                {!hideFeatures && (
                  <div>
                    <Label htmlFor="new-method-fee">Taxa (%) *</Label>
                    <Input
                      id="new-method-fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newMethod.fee}
                      onChange={(e) => setNewMethod({ ...newMethod, fee: e.target.value })}
                      placeholder="Ex: 2.5"
                      className={errors.fee ? 'border-red-500' : ''}
                    />
                    {errors.fee && <p className="text-red-600 text-sm mt-1">{errors.fee}</p>}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddMethod} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewMethod({ name: '', fee: '' });
                      setErrors({});
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Methods List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Formas de Pagamento Cadastradas</h3>
            
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma forma de pagamento cadastrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <div key={method.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    {editingMethod?.id === method.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-name-${method.id}`}>Nome</Label>
                          <Input
                            id={`edit-name-${method.id}`}
                            value={editingMethod.name}
                            onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {!hideFeatures && (
                          <div>
                            <Label htmlFor={`edit-fee-${method.id}`}>Taxa (%)</Label>
                            <Input
                              id={`edit-fee-${method.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingMethod.fee}
                              onChange={(e) => setEditingMethod({ ...editingMethod, fee: e.target.value })}
                              className={errors.fee ? 'border-red-500' : ''}
                            />
                            {errors.fee && <p className="text-red-600 text-sm mt-1">{errors.fee}</p>}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={handleUpdateMethod} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingMethod(null)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold">{method.name}</span>
                            {!hideFeatures && (
                              <Badge variant="secondary" className="ml-2">
                                <Percent className="h-3 w-3 mr-1" />
                                {method.fee}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMethod(method)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMethod(method.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Button */}
          {!showAddForm && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Forma de Pagamento
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodManager;

