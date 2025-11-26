import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateFinancialReportPDF = (dashboardData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cores
  const primaryColor = [139, 92, 246]; // Purple
  const successColor = [52, 211, 153]; // Green
  const dangerColor = [239, 68, 68]; // Red
  const warningColor = [251, 146, 60]; // Orange

  // Função auxiliar para adicionar seção
  const addSection = (title, emoji) => {
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${emoji} ${title}`, 20, yPosition);
    yPosition += 10;
  };

  // Função auxiliar para adicionar linha
  const addLine = (label, value, color = [0, 0, 0]) => {
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'normal');
    doc.text(label, 30, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 8;
  };

  // Header
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 LuPA - Relatório Financeiro', 20, yPosition);
  yPosition += 12;

  // Data
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, yPosition);
  yPosition += 15;

  // Linha divisória
  doc.setDrawColor(...primaryColor);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Seção: Resumo Financeiro
  addSection('Resumo Financeiro', '💰');

  // Dados de resumo
  const income = JSON.parse(localStorage.getItem('lupa_income') || '[]');
  const expenses = JSON.parse(localStorage.getItem('lupa_expenses') || '[]');
  const receivables = JSON.parse(localStorage.getItem('lupa_receivables') || '[]');

  const totalIncome = income.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalReceivables = receivables.reduce((sum, item) => sum + (item.remaining_amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0;

  addLine('Receita Total', `R$ ${totalIncome.toFixed(2).replace('.', ',')}`, successColor);
  addLine('Despesas Totais', `R$ ${totalExpenses.toFixed(2).replace('.', ',')}`, dangerColor);
  addLine('Contas a Receber', `R$ ${totalReceivables.toFixed(2).replace('.', ',')}`, warningColor);
  yPosition += 5;
  addLine('Lucro Líquido', `R$ ${netProfit.toFixed(2).replace('.', ',')}`, successColor);
  addLine('Margem de Lucro', `${profitMargin}%`, successColor);
  yPosition += 10;

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Seção: Detalhes de Receitas
  addSection('Detalhes de Receitas', '📈');

  if (income.length > 0) {
    const incomeTableData = income.map(item => [
      item.description || '-',
      `R$ ${(item.amount || 0).toFixed(2).replace('.', ',')}`,
      item.category || '-',
      item.payment_method || '-',
      item.date || '-'
    ]);

    doc.autoTable({
      head: [['Descrição', 'Valor', 'Categoria', 'Forma de Pagamento', 'Data']],
      body: incomeTableData,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 243, 255]
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhuma receita registrada', 30, yPosition);
    yPosition += 10;
  }

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Seção: Detalhes de Despesas
  addSection('Detalhes de Despesas', '📉');

  if (expenses.length > 0) {
    const expenseTableData = expenses.map(item => [
      item.description || '-',
      `R$ ${(item.amount || 0).toFixed(2).replace('.', ',')}`,
      item.category || '-',
      item.payment_method || '-',
      item.date || '-'
    ]);

    doc.autoTable({
      head: [['Descrição', 'Valor', 'Categoria', 'Forma de Pagamento', 'Data']],
      body: expenseTableData,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      headStyles: {
        fillColor: dangerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [255, 245, 245]
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhuma despesa registrada', 30, yPosition);
    yPosition += 10;
  }

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Seção: Contas a Receber
  addSection('Contas a Receber', '📋');

  if (receivables.length > 0) {
    const receivablesTableData = receivables.map(item => [
      item.customer_name || '-',
      `R$ ${(item.original_amount || 0).toFixed(2).replace('.', ',')}`,
      `R$ ${(item.remaining_amount || 0).toFixed(2).replace('.', ',')}`,
      item.status || '-',
      item.due_date || '-'
    ]);

    doc.autoTable({
      head: [['Cliente', 'Valor Original', 'Valor Pendente', 'Status', 'Vencimento']],
      body: receivablesTableData,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      headStyles: {
        fillColor: warningColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [255, 250, 240]
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhuma conta a receber registrada', 30, yPosition);
    yPosition += 10;
  }

  // Footer
  const totalPages = doc.internal.pages.length;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages - 1}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const fileName = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`;
  try {
    doc.save(fileName);
    console.log('PDF salvo com sucesso:', fileName);
  } catch (error) {
    console.error('Erro ao salvar PDF:', error);
    throw error;
  }
};
