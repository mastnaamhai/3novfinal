// Enhanced ledger types for double-entry bookkeeping

export interface LedgerTransaction {
  _id: string;
  date: string;
  voucherNumber?: string;
  voucherType: 'INVOICE' | 'PAYMENT' | 'ADVANCE' | 'RECEIPT' | 'JOURNAL' | 'THN';
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'DR' | 'CR';
  reference?: string; // Invoice number, THN number, etc.
  customerId?: string;
  customerName?: string;
  paymentMode?: string;
  notes?: string;
  linkedTransactionId?: string; // For linking related transactions
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientLedgerEntry {
  date: string;
  voucherNumber?: string;
  voucherType: 'INVOICE' | 'PAYMENT' | 'ADVANCE' | 'RECEIPT';
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'DR' | 'CR';
  reference?: string;
  paymentMode?: string;
  notes?: string;
}

export interface CompanyLedgerEntry {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'DR' | 'CR';
  reference?: string;
  customerName?: string;
  notes?: string;
}


export interface LedgerSummary {
  openingBalance: number;
  openingBalanceType: 'DR' | 'CR';
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  closingBalanceType: 'DR' | 'CR';
  transactionCount: number;
}

export interface ClientLedgerData {
  customerId: string;
  customerName: string;
  openingBalance: number;
  openingBalanceType: 'DR' | 'CR';
  transactions: ClientLedgerEntry[];
  summary: LedgerSummary;
}

export interface CompanyLedgerData {
  period: {
    startDate: string;
    endDate: string;
  };
  transactions: CompanyLedgerEntry[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalAssets: number;
    totalLiabilities: number;
  };
}


export interface LedgerFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  voucherType?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface LedgerExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  includeSummary: boolean;
  includeNotes: boolean;
  groupByCustomer?: boolean;
  groupByAccount?: boolean;
}
