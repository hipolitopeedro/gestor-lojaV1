import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dataService from '@/services/dataService';

export const generateFinancialReportPDF = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const primaryColor = [139, 92, 246];
  const successColor = [16, 185, 129];
  const dangerColor = [239, 68, 68];
  const warningColor = [245, 158, 11];

  const formatBRL = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  const addSection = (title) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    yPosition += 8;
  };

  const addLine = (label, value, color = [30, 30, 30]) => {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(label, 25, yPosition);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), pageWidth - 25, yPosition, { align: 'right' });
    yPosition += 7;
  };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('LuPA - Relatorio Gerencial Financeiro', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Emitido em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
    20,
    yPosition
  );
  yPosition += 6;

  doc.setDrawColor(...primaryColor);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Fetch live data from dataService
  const stats = dataService.getDashboardData();
  const transactions = dataService.getTransactions();
  const paymentMethods = dataService.getPaymentMethods();
  const receivables = dataService.getReceivables();
  const bills = dataService.getBills();

  const getMethodName = (id) => {
    const found = paymentMethods.find((m) => String(m.id) === String(id));
    return found ? found.name : String(id || '-');
  };

  const income = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalReceivablesPending = receivables
    .filter((r) => r.status !== 'paid')
    .reduce((sum, r) => sum + (parseFloat(r.remaining_amount) || 0), 0);

  // Executive Summary
  addSection('1. Resumo Executivo');
  addLine('Receita Liquida Total:', formatBRL(stats.totalRevenue), successColor);
  addLine('Despesas Totais:', formatBRL(stats.totalExpenses), dangerColor);
  addLine('Lucro Liquido:', formatBRL(stats.netProfit), stats.netProfit >= 0 ? successColor : dangerColor);
  addLine('Margem de Lucro:', `${stats.profitMargin}%`, primaryColor);
  addLine('Taxas de Maquininha/Cartao:', formatBRL(stats.totalFeesPaid), warningColor);
  addLine('Contas a Receber em Aberto:', formatBRL(totalReceivablesPending), warningColor);
  yPosition += 6;

  // Income Table
  addSection('2. Entradas Registradas');
  if (income.length > 0) {
    autoTable(doc, {
      head: [['Descricao', 'Valor Liquido', 'Categoria', 'Pagamento', 'Data']],
      body: income.map((item) => [
        item.description || '-',
        formatBRL(item.net_amount ?? item.amount),
        item.category || '-',
        getMethodName(item.payment_method),
        item.date || '-'
      ]),
      startY: yPosition,
      margin: { left: 20, right: 20 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [245, 243, 255] }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.text('Nenhuma entrada registrada.', 25, yPosition);
    yPosition += 10;
  }

  // Expenses Table
  addSection('3. Despesas Registradas');
  if (expenses.length > 0) {
    autoTable(doc, {
      head: [['Descricao', 'Valor', 'Categoria', 'Pagamento', 'Data']],
      body: expenses.map((item) => [
        item.description || '-',
        formatBRL(item.net_amount ?? item.amount),
        item.category || '-',
        getMethodName(item.payment_method),
        item.date || '-'
      ]),
      startY: yPosition,
      margin: { left: 20, right: 20 },
      headStyles: { fillColor: dangerColor, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [255, 245, 245] }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.text('Nenhuma despesa registrada.', 25, yPosition);
    yPosition += 10;
  }

  // Bills & Receivables Table
  addSection('4. Contas a Receber e Boletos');
  if (receivables.length > 0 || bills.length > 0) {
    const combinedRows = [
      ...receivables.map((r) => [
        `Receber: ${r.customer_name}`,
        formatBRL(r.original_amount),
        formatBRL(r.remaining_amount),
        r.is_overdue ? 'Vencido' : r.status,
        r.due_date || '-'
      ]),
      ...bills.map((b) => [
        `Boleto: ${b.title} (${b.company})`,
        formatBRL(b.original_amount),
        formatBRL(b.status === 'paid' ? 0 : b.final_amount),
        b.is_overdue && b.status !== 'paid' ? 'Vencido' : b.status,
        b.due_date || '-'
      ])
    ];

    autoTable(doc, {
      head: [['Origem / Cliente', 'Valor Original', 'Saldo Pendente', 'Status', 'Vencimento']],
      body: combinedRows,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      headStyles: { fillColor: warningColor, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] }
    });
  }

  // Page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`LuPA Gestao Financeira - Pagina ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: 'center'
    });
  }

  doc.save(`relatorio_financeiro_lupa_${new Date().toISOString().split('T')[0]}.pdf`);
};
