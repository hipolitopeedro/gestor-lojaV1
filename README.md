# 📊 Sistema de Gestão Financeira LuPA - Projeto Interdisciplinar

O **LuPA** (Lucro e Performance em Análise) é um sistema completo de gestão financeira, criado para ajudar pequenas e médias empresas. Com ele, é possível ver em tempo real as finanças, gerenciar transações e analisar a performance do negócio por uma interface web super intuitiva.

-----

## 🚀 Funcionalidades

### **Frontend (React + Tailwind CSS)**

  * **Dashboard Responsivo** - Uma visão geral completa das finanças com gráficos e as métricas mais importantes.
  * **Menu Fixo no Topo** - Acesso rápido às funções principais (Receitas, Despesas, Contas a Pagar e a Receber).
  * **Gráficos em Tempo Real** - Acompanhe a evolução financeira, veja para onde o dinheiro está indo e as transações do dia.
  * **Funciona em qualquer tela** - Otimizado para funcionar tanto no computador quanto no celular.
  * **Visual Moderno** - Um design limpo, com a cor roxa como marca principal e um contraste melhorado para facilitar a leitura.

### **Backend (Flask + Python)**

  * **Autenticação Simplificada** - Um sistema de login direto, focado na demonstração do projeto.
  * **API RESTful** - Endpoints bem definidos para todas as operações financeiras.
  * **Gestão de Transações** - Todas as operações de Criar, Ler, Atualizar e Deletar (CRUD) registros financeiros.
  * **Contas a Pagar** - Gerencie pagamentos recorrentes e não perca os vencimentos.
  * **Contas a Receber** - Acompanhe o que seus clientes precisam pagar.

-----

## 🎨 Sistema de Design

### **Paleta de Cores**

  * **Fundo:** `#f5f3ff` (Lavanda claro)
  * **Cor Principal:** `#8b5cf6` (Roxo)
  * **Sucesso/Lucros:** `#34d399` (Verde)
  * **Despesas:** `#fb7185` (Coral)
  * **Neutro:** `#fb923c` (Laranja)
  * **Texto:** Preto, para garantir a melhor leitura possível.

### **Principais Melhorias na Interface**

  * **Menu Fixo:** As ações rápidas estão sempre visíveis no topo.
  * **Contraste Melhorado:** Texto preto sobre fundos claros para facilitar a leitura.
  * **Botões Menores:** Design mais compacto para aproveitar melhor o espaço.
  * **Layout Flexível:** Se adapta de 4 colunas (desktop) para 2 colunas (celular).

-----

## 🛠️ Tecnologias Usadas

### **Frontend**

  * **React 19** - A versão mais moderna do React, com hooks e context.
  * **Vite** - Ferramenta super rápida para rodar e construir o projeto.
  * **Tailwind CSS** - Framework CSS que agiliza muito a estilização.
  * **Shadcn/UI** - Biblioteca de componentes de alta qualidade.
  * **Recharts** - Para criar gráficos bonitos e responsivos.
  * **Lucide React** - Biblioteca de ícones modernos.

### **Backend**

  * **Flask** - Framework web leve em Python.
  * **SQLAlchemy** - ORM para conversar com o banco de dados.
  * **Flask-CORS** - Para permitir a comunicação entre o front e o back.
  * **Python 3.11** - Usando as features mais recentes do Python.

-----

## 📁 Estrutura do Projeto

```plaintext
lupa-financial-system/
├── frontend/                 # Aplicação frontend em React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis (botões, cards, etc.)
│   │   ├── pages/          # As páginas principais do sistema
│   │   ├── contexts/       # Para compartilhar estado global
│   │   ├── styles/         # CSS customizado e temas
│   │   └── lib/           # Funções úteis
│   ├── package.json
│   └── vite.config.js
├── backend/                 # API backend em Flask
│   ├── src/
│   │   ├── routes/         # As rotas da API (endpoints)
│   │   ├── models/         # Os modelos do banco de dados
│   │   ├── utils/          # Funções de ajuda
│   │   └── static/         # Arquivos do frontend (após o build)
│   ├── requirements.txt
│   └── main.py
└── README.md
```

-----

## 🚀 Como Começar

### **Pré-requisitos**

  * Node.js 20+ e npm/pnpm
  * Python 3.11+
  * Git


### **Configurando o Backend**

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
mkdir src/database
python src/main.py
```

### **Gerando a Versão de Produção (para deploy)**

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

-----

## 📈 Principais Métricas Analisadas

  * **Receita Total** - Acompanhamento completo do que entra.
  * **Despesas Totais** - Gestão total do que sai.
  * **Lucro Líquido** - Cálculos de lucro em tempo real.
  * **Margem de Lucro** - A porcentagem de performance do negócio.
  * **Clientes Ativos** - Acompanhamento de clientes.
  * **Contas Pendentes** - Gestão de datas de vencimento.
  * **Pagamentos Atrasados** - O que ainda não foi recebido.
  * **Crescimento Mensal** - Análise de tendência da performance.

-----

## 🤝 Contribuição

Este é um projeto acadêmico para a matéria de Projeto Interdisciplinar (PIN).

