import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RegisterPage = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    // Placeholder registration - redirect directly to dashboard without validation
    onNavigate('dashboard');
  };

  const handleLoginClick = () => {
    onNavigate('login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f3ff' }}>
      {/* Header */}
      <header className="bg-[#8b5cf6] shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-white">LuPA</span>
              </div>
            </div>

            {/* Header buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => onNavigate('login')}
              >
                Login
              </Button>
              <Button 
                className="bg-white text-[#8b5cf6] hover:bg-gray-100"
                onClick={() => onNavigate('register')}
              >
                Cadastre-se
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">Crie sua Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                  placeholder="Nome"
                />
              </div>
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                  placeholder="Email"
                />
              </div>
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                  placeholder="Senha"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium rounded-lg transition-colors"
              >
                Criar Conta
              </Button>
            </form>
            
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <button
                  onClick={handleLoginClick}
                  className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium underline"
                >
                  Faça login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

