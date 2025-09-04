from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
import os
import json
from src.models.user_simple import db, User
from src.models.transaction import Transaction
from src.models.bill import Bill
from src.models.receivable import Receivable
from src.utils.auth import basic_auth_required

# Import Gemini API
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai package not installed. AI features will be disabled.")

ai_reports_bp = Blueprint('ai_reports', __name__)

def get_gemini_client(user):
    """Initialize Gemini client with API key"""
    if not GEMINI_AVAILABLE:
        return None
    
    # Try to get API key from environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        # For demo purposes, we'll use a mock response
        return None
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        return model
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
        return None

def get_financial_data(user_id, period='30'):
    """Get comprehensive financial data for AI analysis"""
    try:
        # Calculate date range
        end_date = date.today()
        if period == '7':
            start_date = end_date - timedelta(days=7)
        elif period == '30':
            start_date = end_date - timedelta(days=30)
        elif period == '90':
            start_date = end_date - timedelta(days=90)
        elif period == '365':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        # Get transactions
        transactions = Transaction.query.filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()
        
        # Get bills
        bills = Bill.query.filter(
            Bill.user_id == user_id,
            Bill.due_date >= start_date,
            Bill.due_date <= end_date
        ).all()
        
        # Get receivables
        receivables = Receivable.query.filter(
            Receivable.user_id == user_id,
            Receivable.issue_date >= start_date
        ).all()
        
        # Process data
        income_transactions = [t for t in transactions if t.type == 'income']
        expense_transactions = [t for t in transactions if t.type == 'expense']
        
        total_income = sum([float(t.amount) for t in income_transactions])
        total_expenses = sum([float(t.amount) for t in expense_transactions])
        net_profit = total_income - total_expenses
        
        # Bills analysis
        pending_bills = [b for b in bills if b.status in ['pending', 'overdue']]
        paid_bills = [b for b in bills if b.status == 'paid']
        total_bills_pending = sum([float(b.amount) for b in pending_bills])
        total_bills_paid = sum([float(b.amount) for b in paid_bills])
        
        # Receivables analysis
        pending_receivables = [r for r in receivables if r.status in ['pending', 'partial']]
        paid_receivables = [r for r in receivables if r.status == 'paid']
        overdue_receivables = [r for r in receivables if r.is_overdue()]
        
        total_receivables_pending = sum([float(r.remaining_amount) for r in pending_receivables])
        total_receivables_received = sum([float(r.paid_amount) for r in receivables])
        total_overdue = sum([float(r.remaining_amount) for r in overdue_receivables])
        
        # Category analysis
        income_by_category = {}
        expense_by_category = {}
        
        for t in income_transactions:
            category = t.category or 'Outros'
            income_by_category[category] = income_by_category.get(category, 0) + float(t.amount)
        
        for t in expense_transactions:
            category = t.category or 'Outros'
            expense_by_category[category] = expense_by_category.get(category, 0) + float(t.amount)
        
        # Payment method analysis
        payment_methods = {}
        for t in transactions:
            method = t.payment_method or 'Outros'
            if method not in payment_methods:
                payment_methods[method] = {'count': 0, 'total': 0, 'fees': 0}
            payment_methods[method]['count'] += 1
            payment_methods[method]['total'] += float(t.amount)
            payment_methods[method]['fees'] += float(t.fees or 0)
        
        return {
            'period': f'{period} dias',
            'date_range': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': end_date.strftime('%Y-%m-%d')
            },
            'summary': {
                'total_income': total_income,
                'total_expenses': total_expenses,
                'net_profit': net_profit,
                'profit_margin': (net_profit / total_income * 100) if total_income > 0 else 0,
                'transaction_count': len(transactions),
                'income_transaction_count': len(income_transactions),
                'expense_transaction_count': len(expense_transactions)
            },
            'bills': {
                'total_pending': total_bills_pending,
                'total_paid': total_bills_paid,
                'pending_count': len(pending_bills),
                'paid_count': len(paid_bills),
                'overdue_bills': len([b for b in bills if b.status == 'overdue'])
            },
            'receivables': {
                'total_pending': total_receivables_pending,
                'total_received': total_receivables_received,
                'total_overdue': total_overdue,
                'pending_count': len(pending_receivables),
                'paid_count': len(paid_receivables),
                'overdue_count': len(overdue_receivables)
            },
            'categories': {
                'income': income_by_category,
                'expenses': expense_by_category
            },
            'payment_methods': payment_methods,
            'cash_flow': {
                'operational_cash_flow': total_income - total_expenses,
                'accounts_receivable': total_receivables_pending,
                'accounts_payable': total_bills_pending,
                'net_cash_position': total_income - total_expenses + total_receivables_pending - total_bills_pending
            }
        }
        
    except Exception as e:
        print(f"Error getting financial data: {e}")
        return None

def generate_mock_ai_report(financial_data, report_type):
    """Generate a mock AI report when Gemini API is not available"""
    
    summary = financial_data['summary']
    bills = financial_data['bills']
    receivables = financial_data['receivables']
    categories = financial_data['categories']
    payment_methods = financial_data['payment_methods']
    cash_flow = financial_data['cash_flow']
    
    if report_type == 'financial_summary':
        return {
            'title': f'Relatório Financeiro - {financial_data["period"]}',
            'summary': f'Análise do período de {financial_data["date_range"]["start"]} a {financial_data["date_range"]["end"]}',
            'sections': [
                {
                    'title': '📊 Resumo Executivo',
                    'content': f'''Seu negócio apresentou um desempenho {'positivo' if summary['net_profit'] > 0 else 'que requer atenção'} no período analisado.

**Principais Indicadores:**
• Receita Total: R$ {summary['total_income']:,.2f}
• Despesas Totais: R$ {summary['total_expenses']:,.2f}
• Lucro Líquido: R$ {summary['net_profit']:,.2f}
• Margem de Lucro: {summary['profit_margin']:.1f}%
• Total de Transações: {summary['transaction_count']}

{'✅ Parabéns! Seu negócio está gerando lucro.' if summary['net_profit'] > 0 else '⚠️ Atenção: Suas despesas estão superiores às receitas.'}'''
                },
                {
                    'title': '💰 Análise de Fluxo de Caixa',
                    'content': f'''**Posição Atual do Caixa:**
• Fluxo Operacional: R$ {cash_flow['operational_cash_flow']:,.2f}
• Contas a Receber: R$ {receivables['total_pending']:,.2f}
• Contas a Pagar: R$ {bills['total_pending']:,.2f}
• Posição Líquida: R$ {cash_flow['net_cash_position']:,.2f}

**Recomendações:**
{'• Excelente gestão de caixa! Continue monitorando.' if cash_flow['net_cash_position'] > 0 else '• Foque na cobrança de recebíveis e negocie prazos com fornecedores.'}
{'• Considere investir o excesso de caixa.' if cash_flow['operational_cash_flow'] > summary['total_income'] * 0.2 else '• Mantenha uma reserva de emergência.'}'''
                },
                {
                    'title': '📈 Análise por Categorias',
                    'content': f'''**Principais Fontes de Receita:**
{chr(10).join([f'• {cat}: R$ {val:,.2f} ({val/summary["total_income"]*100:.1f}%)' for cat, val in sorted(categories['income'].items(), key=lambda x: x[1], reverse=True)[:3]])}

**Maiores Despesas:**
{chr(10).join([f'• {cat}: R$ {val:,.2f} ({val/summary["total_expenses"]*100:.1f}%)' for cat, val in sorted(categories['expenses'].items(), key=lambda x: x[1], reverse=True)[:3]])}

**Insights:**
• Diversifique suas fontes de receita para reduzir riscos
• Analise se as despesas estão alinhadas com o crescimento do negócio'''
                },
                {
                    'title': '💳 Análise de Formas de Pagamento',
                    'content': f'''**Performance por Método:**
{chr(10).join([f'• {method}: R$ {data["total"]:,.2f} ({data["count"]} transações, R$ {data["fees"]:,.2f} em taxas)' for method, data in sorted(payment_methods.items(), key=lambda x: x[1]["total"], reverse=True)[:5]])}

**Otimização de Taxas:**
• Total pago em taxas: R$ {sum([data["fees"] for data in payment_methods.values()]):,.2f}
• Incentive pagamentos via PIX para reduzir custos
• Considere renegociar taxas de cartão se o volume for alto'''
                },
                {
                    'title': '🎯 Recomendações Estratégicas',
                    'content': f'''**Ações Imediatas:**
{'• Mantenha o bom desempenho e foque em crescimento sustentável' if summary['net_profit'] > 0 else '• Revise despesas e identifique oportunidades de redução de custos'}
• Monitore de perto as contas a receber (R$ {receivables['total_pending']:,.2f} pendentes)
{'• Atenção especial às contas em atraso (R$ ' + f'{receivables["total_overdue"]:,.2f})' if receivables['total_overdue'] > 0 else '• Excelente gestão de recebíveis!'}

**Planejamento:**
• Estabeleça metas mensais baseadas no desempenho atual
• Considere investir em marketing se a margem permitir
• Mantenha uma reserva equivalente a 3 meses de despesas'''
                }
            ],
            'generated_at': datetime.now().isoformat(),
            'period': financial_data['period']
        }
    
    elif report_type == 'cash_flow_analysis':
        return {
            'title': f'Análise de Fluxo de Caixa - {financial_data["period"]}',
            'summary': 'Análise detalhada da movimentação financeira e projeções',
            'sections': [
                {
                    'title': '💧 Fluxo de Caixa Operacional',
                    'content': f'''**Entradas de Caixa:**
• Receitas Operacionais: R$ {summary['total_income']:,.2f}
• Recebimentos de Clientes: R$ {receivables['total_received']:,.2f}
• Total de Entradas: R$ {summary['total_income'] + receivables['total_received']:,.2f}

**Saídas de Caixa:**
• Despesas Operacionais: R$ {summary['total_expenses']:,.2f}
• Pagamento de Contas: R$ {bills['total_paid']:,.2f}
• Total de Saídas: R$ {summary['total_expenses'] + bills['total_paid']:,.2f}

**Fluxo Líquido:** R$ {cash_flow['operational_cash_flow']:,.2f}'''
                },
                {
                    'title': '📊 Análise de Recebíveis',
                    'content': f'''**Situação Atual:**
• Total a Receber: R$ {receivables['total_pending']:,.2f}
• Contas em Atraso: R$ {receivables['total_overdue']:,.2f} ({receivables['overdue_count']} contas)
• Taxa de Inadimplência: {(receivables['total_overdue']/receivables['total_pending']*100) if receivables['total_pending'] > 0 else 0:.1f}%

**Recomendações:**
{'• Excelente gestão de recebíveis!' if receivables['total_overdue'] < receivables['total_pending'] * 0.05 else '• Implemente políticas mais rígidas de cobrança'}
• Considere oferecer desconto para pagamento à vista
• Monitore o prazo médio de recebimento'''
                },
                {
                    'title': '💸 Gestão de Pagamentos',
                    'content': f'''**Contas a Pagar:**
• Pendentes: R$ {bills['total_pending']:,.2f} ({bills['pending_count']} contas)
• Pagas no Período: R$ {bills['total_paid']:,.2f}
• Contas em Atraso: {bills.get('overdue_bills', 0)} contas

**Estratégias:**
• Negocie prazos maiores com fornecedores
• Aproveite descontos por pagamento antecipado
• Mantenha um calendário de vencimentos'''
                }
            ],
            'generated_at': datetime.now().isoformat(),
            'period': financial_data['period']
        }
    
    elif report_type == 'performance_insights':
        return {
            'title': f'Insights de Performance - {financial_data["period"]}',
            'summary': 'Análise avançada de performance e oportunidades de melhoria',
            'sections': [
                {
                    'title': '🎯 KPIs Principais',
                    'content': f'''**Indicadores de Performance:**
• ROI Operacional: {(summary['net_profit']/summary['total_expenses']*100) if summary['total_expenses'] > 0 else 0:.1f}%
• Ticket Médio: R$ {(summary['total_income']/summary['income_transaction_count']) if summary['income_transaction_count'] > 0 else 0:.2f}
• Frequência de Transações: {summary['transaction_count']/(int(financial_data['period'].split()[0])/30):.1f} por mês
• Eficiência de Cobrança: {(receivables['total_received']/(receivables['total_received']+receivables['total_pending'])*100) if (receivables['total_received']+receivables['total_pending']) > 0 else 0:.1f}%

**Benchmarks:**
{'✅ Performance acima da média' if summary['profit_margin'] > 15 else '⚠️ Performance abaixo do esperado'}'''
                },
                {
                    'title': '🔍 Análise de Tendências',
                    'content': f'''**Padrões Identificados:**
• Concentração de receitas: {'Diversificada' if len(categories['income']) > 3 else 'Concentrada'}
• Controle de despesas: {'Eficiente' if summary['total_expenses'] < summary['total_income'] * 0.8 else 'Requer atenção'}
• Gestão de recebíveis: {'Excelente' if receivables['overdue_count'] < receivables['pending_count'] * 0.1 else 'Melhorar'}

**Oportunidades:**
• Automatize processos de cobrança
• Implemente programa de fidelidade
• Otimize mix de produtos/serviços'''
                },
                {
                    'title': '📈 Projeções e Metas',
                    'content': f'''**Projeção Próximo Período:**
• Receita Projetada: R$ {summary['total_income'] * 1.1:,.2f} (+10%)
• Meta de Redução de Custos: R$ {summary['total_expenses'] * 0.05:,.2f} (-5%)
• Lucro Projetado: R$ {(summary['total_income'] * 1.1) - (summary['total_expenses'] * 0.95):,.2f}

**Metas Recomendadas:**
• Aumentar margem de lucro para {summary['profit_margin'] + 5:.1f}%
• Reduzir inadimplência para menos de 3%
• Diversificar fontes de receita'''
                }
            ],
            'generated_at': datetime.now().isoformat(),
            'period': financial_data['period']
        }
    
    else:
        return {
            'title': 'Relatório Personalizado',
            'summary': 'Análise financeira personalizada',
            'sections': [
                {
                    'title': '📋 Resumo Geral',
                    'content': f'Análise do período de {financial_data["period"]} com foco em performance e oportunidades.'
                }
            ],
            'generated_at': datetime.now().isoformat(),
            'period': financial_data['period']
        }

@ai_reports_bp.route('/api/ai-reports/generate', methods=['POST'])
@basic_auth_required
def generate_ai_report(user):
    """Generate AI-powered financial report"""
    try:
        current_user_id = user.id
        data = request.get_json()
        
        # Get parameters
        report_type = data.get('report_type', 'financial_summary')
        period = data.get('period', '30')
        custom_prompt = data.get('custom_prompt', '')
        
        # Validate report type
        valid_types = ['financial_summary', 'cash_flow_analysis', 'performance_insights', 'custom']
        if report_type not in valid_types:
            return jsonify({'error': 'Invalid report type'}), 400
        
        # Get financial data
        financial_data = get_financial_data(current_user_id, period)
        if not financial_data:
            return jsonify({'error': 'Unable to retrieve financial data'}), 500
        
        # Try to use Gemini API
        client = get_gemini_client()
        
        if client and GEMINI_AVAILABLE:
            try:
                # Prepare prompt for Gemini
                prompt = create_gemini_prompt(financial_data, report_type, custom_prompt)
                
                response = client.generate_content(prompt)
                
                # Parse Gemini response
                ai_report = parse_gemini_response(response.text, report_type, financial_data)
                
            except Exception as e:
                print(f"Error with Gemini API: {e}")
                # Fall back to mock report
                ai_report = generate_mock_ai_report(financial_data, report_type)
        else:
            # Use mock report
            ai_report = generate_mock_ai_report(financial_data, report_type)
        
        return jsonify({
            'success': True,
            'report': ai_report,
            'financial_data': financial_data,
            'ai_powered': client is not None and GEMINI_AVAILABLE
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_gemini_prompt(financial_data, report_type, custom_prompt=''):
    """Create a detailed prompt for Gemini API"""
    
    base_prompt = f"""
Você é um consultor financeiro especializado em pequenas e médias empresas brasileiras. 
Analise os dados financeiros fornecidos e gere um relatório detalhado e profissional.

DADOS FINANCEIROS ({financial_data['period']}):
- Período: {financial_data['date_range']['start']} a {financial_data['date_range']['end']}
- Receita Total: R$ {financial_data['summary']['total_income']:,.2f}
- Despesas Totais: R$ {financial_data['summary']['total_expenses']:,.2f}
- Lucro Líquido: R$ {financial_data['summary']['net_profit']:,.2f}
- Margem de Lucro: {financial_data['summary']['profit_margin']:.1f}%
- Transações: {financial_data['summary']['transaction_count']}

CONTAS A PAGAR:
- Pendentes: R$ {financial_data['bills']['total_pending']:,.2f} ({financial_data['bills']['pending_count']} contas)
- Pagas: R$ {financial_data['bills']['total_paid']:,.2f} ({financial_data['bills']['paid_count']} contas)

CONTAS A RECEBER:
- Pendentes: R$ {financial_data['receivables']['total_pending']:,.2f} ({financial_data['receivables']['pending_count']} contas)
- Recebidas: R$ {financial_data['receivables']['total_received']:,.2f} ({financial_data['receivables']['paid_count']} contas)
- Em Atraso: R$ {financial_data['receivables']['total_overdue']:,.2f} ({financial_data['receivables']['overdue_count']} contas)

RECEITAS POR CATEGORIA:
{chr(10).join([f'- {cat}: R$ {val:,.2f}' for cat, val in financial_data['categories']['income'].items()])}

DESPESAS POR CATEGORIA:
{chr(10).join([f'- {cat}: R$ {val:,.2f}' for cat, val in financial_data['categories']['expenses'].items()])}

FORMAS DE PAGAMENTO:
{chr(10).join([f'- {method}: R$ {data["total"]:,.2f} ({data["count"]} transações, R$ {data["fees"]:,.2f} em taxas)' for method, data in financial_data['payment_methods'].items()])}
"""

    if report_type == 'financial_summary':
        specific_prompt = """
TIPO DE RELATÓRIO: Resumo Financeiro Executivo

Gere um relatório estruturado com as seguintes seções:
1. Resumo Executivo (situação geral, principais indicadores)
2. Análise de Performance (receitas, despesas, lucratividade)
3. Fluxo de Caixa (entradas, saídas, posição líquida)
4. Análise por Categorias (principais fontes de receita e despesas)
5. Recomendações Estratégicas (ações imediatas e planejamento)

Use linguagem profissional mas acessível. Inclua insights práticos e recomendações específicas.
"""
    elif report_type == 'cash_flow_analysis':
        specific_prompt = """
TIPO DE RELATÓRIO: Análise de Fluxo de Caixa

Foque em:
1. Fluxo de Caixa Operacional (entradas e saídas)
2. Análise de Recebíveis (prazos, inadimplência, oportunidades)
3. Gestão de Pagamentos (contas a pagar, estratégias de pagamento)
4. Projeções de Caixa (tendências e previsões)
5. Recomendações de Gestão Financeira

Enfatize a saúde financeira e liquidez do negócio.
"""
    elif report_type == 'performance_insights':
        specific_prompt = """
TIPO DE RELATÓRIO: Insights de Performance

Analise:
1. KPIs e Indicadores de Performance
2. Benchmarking e Comparações
3. Análise de Tendências e Padrões
4. Oportunidades de Otimização
5. Metas e Projeções Futuras

Forneça insights avançados e recomendações estratégicas para crescimento.
"""
    else:
        specific_prompt = custom_prompt or "Gere um relatório financeiro abrangente com insights e recomendações."

    return base_prompt + specific_prompt + """

FORMATO DE RESPOSTA:
Retorne um JSON com a seguinte estrutura:
{
    "title": "Título do Relatório",
    "summary": "Resumo em uma frase",
    "sections": [
        {
            "title": "Título da Seção",
            "content": "Conteúdo detalhado da seção com insights e recomendações"
        }
    ]
}

Use emojis apropriados nos títulos das seções. Seja específico, prático e orientado a resultados.
"""

def parse_gemini_response(response_text, report_type, financial_data):
    """Parse Gemini API response and format as report"""
    try:
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            report_data = json.loads(json_match.group())
            report_data['generated_at'] = datetime.now().isoformat()
            report_data['period'] = financial_data['period']
            return report_data
        else:
            # If no JSON found, create structured report from text
            return {
                'title': f'Relatório Financeiro - {financial_data["period"]}',
                'summary': 'Relatório gerado por IA com base nos dados financeiros',
                'sections': [
                    {
                        'title': '🤖 Análise da IA',
                        'content': response_text
                    }
                ],
                'generated_at': datetime.now().isoformat(),
                'period': financial_data['period']
            }
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        # Fall back to mock report
        return generate_mock_ai_report(financial_data, report_type)

@ai_reports_bp.route('/ai-reports/types', methods=['GET'])
def get_report_types(user):
    """Get available report types"""
    return jsonify({
        'report_types': [
            {
                'id': 'financial_summary',
                'name': 'Resumo Financeiro',
                'description': 'Relatório executivo com visão geral do desempenho financeiro',
                'icon': '📊'
            },
            {
                'id': 'cash_flow_analysis',
                'name': 'Análise de Fluxo de Caixa',
                'description': 'Análise detalhada de entradas e saídas de caixa',
                'icon': '💰'
            },
            {
                'id': 'performance_insights',
                'name': 'Insights de Performance',
                'description': 'Análise avançada de KPIs e oportunidades de melhoria',
                'icon': '🎯'
            },
            {
                'id': 'custom',
                'name': 'Relatório Personalizado',
                'description': 'Relatório customizado com base em prompt específico',
                'icon': '🔧'
            }
        ],
        'periods': [
            {'id': '7', 'name': 'Últimos 7 dias'},
            {'id': '30', 'name': 'Últimos 30 dias'},
            {'id': '90', 'name': 'Últimos 90 dias'},
            {'id': '365', 'name': 'Último ano'}
        ]
    }), 200

@ai_reports_bp.route('/api/ai-reports/health', methods=['GET'])
@basic_auth_required
def ai_health_check(user):
    """Check AI service health"""
    client = get_gemini_client()
    return jsonify({
        'gemini_available': GEMINI_AVAILABLE,
        'api_key_configured': os.getenv('GEMINI_API_KEY') is not None,
        'client_initialized': client is not None,
        'status': 'healthy' if (GEMINI_AVAILABLE and client) else 'mock_mode'
    }), 200

