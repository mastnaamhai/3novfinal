import type { ClientLedgerData, CompanyLedgerData, LedgerExportOptions } from '../types/ledger';
import type { CompanyInfo } from '../types';

export class LedgerExportService {
  /**
   * Export client ledger to PDF format
   */
  static async exportClientLedgerPDF(
    ledgerData: ClientLedgerData,
    companyInfo: CompanyInfo,
    options: LedgerExportOptions
  ): Promise<void> {
    // This would integrate with the existing PDF service
    console.log('Exporting client ledger to PDF:', {
      customer: ledgerData.customerName,
      transactions: ledgerData.transactions.length,
      options
    });
    
    // For now, we'll use the browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = this.generateClientLedgerHTML(ledgerData, companyInfo, options);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Export company ledger to PDF format
   */
  static async exportCompanyLedgerPDF(
    ledgerData: CompanyLedgerData,
    companyInfo: CompanyInfo,
    options: LedgerExportOptions
  ): Promise<void> {
    console.log('Exporting company ledger to PDF:', {
      period: ledgerData.period,
      transactions: ledgerData.transactions.length,
      options
    });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = this.generateCompanyLedgerHTML(ledgerData, companyInfo, options);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Export ledger to Excel format
   */
  static async exportLedgerExcel(
    ledgerData: ClientLedgerData | CompanyLedgerData,
    filename: string
  ): Promise<void> {
    // This would integrate with a library like SheetJS
    console.log('Exporting ledger to Excel:', filename);
    
    // For now, we'll create a CSV format that can be opened in Excel
    const csvContent = this.generateLedgerCSV(ledgerData);
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * Generate HTML content for client ledger
   */
  private static generateClientLedgerHTML(
    ledgerData: ClientLedgerData,
    companyInfo: CompanyInfo,
    options: LedgerExportOptions
  ): string {
    const transactions = ledgerData.transactions.map(tx => `
      <tr>
        <td>${new Date(tx.date).toLocaleDateString('en-IN')}</td>
        <td>${tx.particulars}</td>
        <td style="text-align: right;">${tx.debit > 0 ? `₹${tx.debit.toFixed(2)}` : ''}</td>
        <td style="text-align: right;">${tx.credit > 0 ? `₹${tx.credit.toFixed(2)}` : ''}</td>
        <td style="text-align: right;">₹${tx.balance.toFixed(2)} ${tx.balanceType}</td>
        <td>${tx.paymentMode || ''}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Client Ledger - ${ledgerData.customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { font-size: 18px; font-weight: bold; }
            .customer-info { margin: 20px 0; padding: 15px; background-color: #f5f5f5; }
            .summary { margin: 20px 0; padding: 15px; background-color: #e8f4fd; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .debit { color: #d32f2f; }
            .credit { color: #388e3c; }
            .balance-dr { color: #d32f2f; }
            .balance-cr { color: #388e3c; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">${companyInfo.name}</div>
            <div>${companyInfo.address}</div>
            <div>GSTIN: ${companyInfo.gstin}</div>
          </div>

          <div class="customer-info">
            <h2>Client Ledger - ${ledgerData.customerName}</h2>
            <p><strong>Customer ID:</strong> ${ledgerData.customerId}</p>
          </div>

          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Debits:</strong> <span class="debit">₹${ledgerData.summary.totalDebits.toFixed(2)}</span></p>
            <p><strong>Total Credits:</strong> <span class="credit">₹${ledgerData.summary.totalCredits.toFixed(2)}</span></p>
            <p><strong>Closing Balance:</strong> 
              <span class="${ledgerData.summary.closingBalanceType === 'DR' ? 'balance-dr' : 'balance-cr'}">
                ₹${ledgerData.summary.closingBalance.toFixed(2)} ${ledgerData.summary.closingBalanceType}
              </span>
            </p>
            <p><strong>Total Transactions:</strong> ${ledgerData.summary.transactionCount}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th style="text-align: right;">Debit (₹)</th>
                <th style="text-align: right;">Credit (₹)</th>
                <th style="text-align: right;">Balance (₹)</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              ${transactions}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            Generated on: ${new Date().toLocaleString('en-IN')}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for company ledger
   */
  private static generateCompanyLedgerHTML(
    ledgerData: CompanyLedgerData,
    companyInfo: CompanyInfo,
    options: LedgerExportOptions
  ): string {
    const transactions = ledgerData.transactions.map(tx => `
      <tr>
        <td>${new Date(tx.date).toLocaleDateString('en-IN')}</td>
        <td>${tx.particulars}</td>
        <td style="text-align: right;">${tx.debit > 0 ? `₹${tx.debit.toFixed(2)}` : ''}</td>
        <td style="text-align: right;">${tx.credit > 0 ? `₹${tx.credit.toFixed(2)}` : ''}</td>
        <td style="text-align: right;">₹${tx.balance.toFixed(2)} ${tx.balanceType}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Company Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { font-size: 18px; font-weight: bold; }
            .period-info { margin: 20px 0; padding: 15px; background-color: #f5f5f5; }
            .summary { margin: 20px 0; padding: 15px; background-color: #e8f4fd; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .debit { color: #d32f2f; }
            .credit { color: #388e3c; }
            .balance-dr { color: #d32f2f; }
            .balance-cr { color: #388e3c; }
            .profit { color: #388e3c; }
            .loss { color: #d32f2f; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">${companyInfo.name}</div>
            <div>${companyInfo.address}</div>
            <div>GSTIN: ${companyInfo.gstin}</div>
          </div>

          <div class="period-info">
            <h2>Company Ledger</h2>
            <p><strong>Period:</strong> ${new Date(ledgerData.period.startDate).toLocaleDateString('en-IN')} to ${new Date(ledgerData.period.endDate).toLocaleDateString('en-IN')}</p>
          </div>

          <div class="summary">
            <h3>Financial Summary</h3>
            <p><strong>Total Revenue:</strong> <span class="credit">₹${ledgerData.summary.totalRevenue.toFixed(2)}</span></p>
            <p><strong>Total Expenses:</strong> <span class="debit">₹${ledgerData.summary.totalExpenses.toFixed(2)}</span></p>
            <p><strong>Net Profit/Loss:</strong> 
              <span class="${ledgerData.summary.netProfit >= 0 ? 'profit' : 'loss'}">
                ₹${Math.abs(ledgerData.summary.netProfit).toFixed(2)} ${ledgerData.summary.netProfit >= 0 ? 'Profit' : 'Loss'}
              </span>
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th style="text-align: right;">Debit (₹)</th>
                <th style="text-align: right;">Credit (₹)</th>
                <th style="text-align: right;">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${transactions}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            Generated on: ${new Date().toLocaleString('en-IN')}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate CSV content for ledger export
   */
  private static generateLedgerCSV(ledgerData: ClientLedgerData | CompanyLedgerData): string {
    if ('customerName' in ledgerData) {
      // Client ledger CSV
      const headers = ['Date', 'Particulars', 'Debit', 'Credit', 'Balance', 'Balance Type', 'Payment Mode', 'Notes'];
      const rows = ledgerData.transactions.map(tx => [
        new Date(tx.date).toLocaleDateString('en-IN'),
        tx.particulars,
        tx.debit.toFixed(2),
        tx.credit.toFixed(2),
        tx.balance.toFixed(2),
        tx.balanceType,
        tx.paymentMode || '',
        tx.notes || ''
      ]);
      
      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    } else {
      // Company ledger CSV
      const headers = ['Date', 'Account Head', 'Particulars', 'Debit', 'Credit', 'Balance', 'Balance Type', 'Customer', 'Notes'];
      const rows = ledgerData.transactions.map(tx => [
        new Date(tx.date).toLocaleDateString('en-IN'),
        tx.accountHead,
        tx.particulars,
        tx.debit.toFixed(2),
        tx.credit.toFixed(2),
        tx.balance.toFixed(2),
        tx.balanceType,
        tx.customerName || '',
        tx.notes || ''
      ]);
      
      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
  }

  /**
   * Download file with given content
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
