import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  CreditCard, 
  DollarSign, 
  FileText, 
  PieChart, 
  Shield, 
  Smartphone, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Intuitivo',
      description: 'Visualize a saúde financeira do seu negócio com gráficos e métricas em tempo real.',
      color: 'text-[#34d399]'
    },
    {
      icon: CreditCard,
      title: 'Controle de Entradas com Taxas',
      description: 'Gerencie todas as formas de pagamento e calcule automaticamente as taxas de cartão.',
      color: 'text-[#34d399]'
    },
    {
      icon: DollarSign,
      title: 'Gestão de Despesas',
      description: 'Categorize e controle todas as saídas do seu caixa de forma organizada.',
      color: 'text-[#fb7185]'
    },
    {
      icon: Smartphone,
      title: 'Pagamento de Boletos',
      description: 'Escaneie códigos de barras e registre boletos automaticamente.',
      color: 'text-[#fb923c]'
    },

    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados financeiros protegidos com criptografia de ponta.',
      color: 'text-indigo-600'
    }
  ];

  const benefits = [
    'Economize horas de trabalho manual',
    'Reduza erros nos cálculos financeiros',
    'Tome decisões baseadas em dados',
    'Acompanhe seu crescimento em tempo real',
    'Simplifique a gestão do seu negócio'
  ];

  return (
    <div className="min-h-screen lupa-bg-background">
      {/* Header */}
      <header className="lupa-bg-primary shadow-sm border-b lupa-border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg class="h-8 w-8 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
                <span className="ml-2 text-xl font-bold text-white">LuPA</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => window.navigateTo("login")}
              >
                Login
              </Button>
              <Button 
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => window.navigateTo("register")}
              >
                Cadastre-se
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  className="justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    window.navigateTo("login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button 
                  className="justify-start bg-white text-black hover:bg-gray-100"
                  onClick={() => {
                    window.navigateTo("register");
                    setMobileMenuOpen(false);
                  }}
                >
                  Cadastre-se
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#f5f3ff] via-[#f5f3ff] to-[#f5f3ff] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              A gestão financeira do seu negócio, simplificada
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transforme a forma como você gerencia as finanças do seu negócio. 
              Controle entradas, despesas, taxas e receba insights inteligentes 
              para maximizar sua lucratividade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => window.navigateTo("register")}
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => window.navigateTo("login")}
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas poderosas e intuitivas para revolucionar a gestão financeira do seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o LuPA?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nossa plataforma foi desenvolvida especificamente para pequenos e médios negócios 
                que precisam de controle financeiro profissional sem complicação.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-[#34d399] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">98%</div>
                    <div className="text-blue-100">Satisfação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">5h</div>
                    <div className="text-blue-100">Economizadas/semana</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">+25%</div>
                    <div className="text-blue-100">Lucro médio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-blue-100">Suporte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de empreendedores que já revolucionaram 
            sua gestão financeira com nossa plataforma.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-50"
            onClick={() => window.navigateTo("register")}
          >
            Começar Agora - É Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-black py-6" style={{ backgroundColor: '#f5f3ff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <svg class="h-6 w-6 text-black mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
              <span className="ml-2 text-lg font-bold">LuPA</span>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Simplificando a gestão financeira para pequenos e médios negócios
            </p>
            <p className="text-gray-500 text-xs">
              © 2025 LuPA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

