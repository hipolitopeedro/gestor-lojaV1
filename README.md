# Sistema de Gestão Financeira LuPA (MVP)

O **LuPA** (*Lucro e Performance em Análise*) é um sistema web completo de gestão financeira para pequenas e médias empresas (PMEs), desenvolvido como MVP funcional com suporte a análise de fluxo de caixa, conciliação de taxas de maquininha/cartão, contas a pagar/receber, geração de relatórios executivos em PDF e diagnóstico financeiro assistido por IA.

> **Demo Online Interativa (GitHub Pages):** [https://hipolitopeedro.github.io/gestor-lojaV1/](https://hipolitopeedro.github.io/gestor-lojaV1/)
> *(Pré-carregado com dados realistas de demonstração — todas as alterações ficam salvas localmente no navegador e podem ser redefinidas a qualquer momento pelo botão **"Restaurar Demo"** no topo do Dashboard).*

---

## Principais Funcionalidades do MVP

### Frontend (React 19 + Vite + Tailwind CSS + Recharts)
* **Dashboard Executivo em Tempo Real**:
  * Indicadores principais (KPIs): Receita Total, Despesas Totais, Lucro Líquido, Margem de Lucro, Clientes Ativos, Contas Pendentes e Recebíveis em Atraso.
  * **4 Visões Gráficas Interativas**:
    1. *Evolução Mensal* (Receitas vs. Despesas vs. Lucro nos últimos 6 meses).
    2. *Categorias de Despesas* (Gráfico de pizza + detalhamento percentual por centro de custo).
    3. *Formas de Pagamento* (Distribuição por PIX, Cartão de Crédito/Débito, Dinheiro e Boleto).
    4. *Fluxo Diário* (Entradas e saídas dos últimos 7 dias).
* **Gestão de Entradas e Despesas (CRUD Completo)**:
  * Cálculo automático de taxas de cartão/maquininha (valor bruto, taxa percentual descontada e valor líquido).
  * Filtros dinâmicos por busca textual, categoria, forma de pagamento, período e faixa de valor.
  * Edição e exclusão em tempo real com recálculo imediato de métricas.
* **Contas a Pagar (`Bills`)**:
  * Controle de vencimentos, alertas de contas atrasadas, filtros por fornecedor/categoria e baixa rápida de pagamentos.
* **Contas a Receber (`Accounts Receivable`)**:
  * Gestão de vendas a prazo (*Fiado*), recebíveis de maquininha e faturas/boletos.
  * Suporte a pagamentos parciais (abatimento automático de saldo devedor) e histórico de amortizações por cliente.
* **Relatórios Inteligentes (Diagnóstico IA)**:
  * Geração de diagnósticos financeiros completos (Geral, Receitas, Despesas ou Fluxo de Caixa) com análise de margem líquida, impacto de taxas de meios de pagamento, inadimplência e plano de ação recomendado, com exportação em Markdown (`.md`).
* **Exportação de Relatório Executivo em PDF**:
  * Geração instantânea no cliente (`jsPDF` + `jspdf-autotable`) com resumo financeiro consolidado, tabelas de transações, contas a pagar e contas a receber.

### Backend (Python + Flask + SQLAlchemy)
* **API RESTful Modular**: Blueprints dedicados para Autenticação (`/api/auth`), Transações (`/api/transactions`), Contas a Pagar (`/api/bills`), Contas a Receber (`/api/receivables`) e Relatórios IA (`/api/ai/reports`).
* **Servimento Unificado (SPA)**: O servidor Flask serve automaticamente o bundle de produção compilado em `backend/src/static/`, permitindo rodar toda a aplicação em uma única porta (`http://localhost:5000`).

---

## Estrutura do Repositório

```plaintext
gestor-lojaV1/
├── .github/workflows/
│   └── build-and-deploy.yml  # Pipeline CI/CD: compila o frontend, atualiza backend/src/static e publica no GitHub Pages
├── frontend/                 # Aplicação SPA em React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Formulários, listagens, gerenciador de taxas e componentes Shadcn/UI
│   │   ├── pages/            # Dashboard, Income, Expense, Bills, AccountsReceivable, AIReports
│   │   ├── services/         # dataService.js (persistência local + seed de dados demo realistas)
│   │   └── utils/            # pdfExporter.js (gerador de relatórios PDF executivos)
│   ├── package.json
│   └── vite.config.js
├── backend/                  # API RESTful em Python/Flask + SQLite (SQLAlchemy)
│   ├── src/
│   │   ├── models/           # Modelos relacionais (User, Transaction, Bill, Receivable, Customer)
│   │   ├── routes/           # Endpoints REST (/api/*)
│   │   ├── static/           # Bundle de produção do React servido pelo Flask
│   │   └── main.py           # Ponto de entrada da aplicação Flask
│   └── requirements.txt
└── README.md
```

---

## Como Executar Localmente

### Opção 1: Executar apenas o Frontend (Modo MVP / Apresentação Rápida)

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Acesse `http://localhost:5173`. O sistema carregará automaticamente a base de demonstração completa.

### Opção 2: Executar Full-Stack (Flask servindo API + Frontend Compilado)

```bash
cd backend
python -m venv venv
# No Windows:
venv\Scripts\activate
# No Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python src/main.py
```
Acesse `http://localhost:5000`.

---

## Tecnologias Utilizadas

* **Frontend**: React 19, Vite 6, Tailwind CSS 4, Radix UI / Shadcn, Recharts, Lucide Icons, jsPDF & jsPDF-AutoTable.
* **Backend**: Python 3.11+, Flask 3, Flask-SQLAlchemy, Flask-CORS, PyJWT, ReportLab.
* **CI/CD**: GitHub Actions (Build automatizado do React + atualização de estáticos + deploy no GitHub Pages).
