import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { DashboardWrapper } from './components/route-wrappers/DashboardWrapper';
import { LorryReceiptsWrapper } from './components/route-wrappers/LorryReceiptsWrapper';
import { LorryReceiptFormWrapper } from './components/route-wrappers/LorryReceiptFormWrapper';
import { LorryReceiptPDFWrapper } from './components/route-wrappers/LorryReceiptPDFWrapper';
import { InvoicesWrapper } from './components/route-wrappers/InvoicesWrapper';
import { InvoiceFormWrapper } from './components/route-wrappers/InvoiceFormWrapper';
import { InvoicePDFWrapper } from './components/route-wrappers/InvoicePDFWrapper';
import { PendingPaymentsWrapper } from './components/route-wrappers/PendingPaymentsWrapper';
import { LedgerWrapper } from './components/route-wrappers/LedgerWrapper';
import { EnhancedLedgerWrapper } from './components/route-wrappers/EnhancedLedgerWrapper';
import { LedgerPDFWrapper } from './components/route-wrappers/LedgerPDFWrapper';
import { ClientsWrapper } from './components/route-wrappers/ClientsWrapper';
import { TruckHiringNotesWrapper } from './components/route-wrappers/TruckHiringNotesWrapper';
import { THNPdfWrapper } from './components/route-wrappers/THNPdfWrapper';
import { SettingsWrapper } from './components/route-wrappers/SettingsWrapper';

// Create the router configuration
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardWrapper />
      },
      {
        path: 'lorry-receipts',
        element: <LorryReceiptsWrapper />
      },
      {
        path: 'lorry-receipts/create',
        element: <LorryReceiptFormWrapper />
      },
      {
        path: 'lorry-receipts/edit/:id',
        element: <LorryReceiptFormWrapper />
      },
      {
        path: 'lorry-receipts/view/:id',
        element: <LorryReceiptPDFWrapper />
      },
      {
        path: 'invoices',
        element: <InvoicesWrapper />
      },
      {
        path: 'invoices/create',
        element: <InvoiceFormWrapper />
      },
      {
        path: 'invoices/create-from-lr/:lrId',
        element: <InvoiceFormWrapper />
      },
      {
        path: 'invoices/edit/:id',
        element: <InvoiceFormWrapper />
      },
      {
        path: 'invoices/view/:id',
        element: <InvoicePDFWrapper />
      },
      {
        path: 'payments',
        element: <PendingPaymentsWrapper />
      },
      {
        path: 'ledger',
        element: <LedgerWrapper />
      },
      {
        path: 'enhanced-ledger',
        element: <EnhancedLedgerWrapper />
      },
      {
        path: 'ledger/client/:customerId',
        element: <LedgerPDFWrapper />
      },
      {
        path: 'ledger/company',
        element: <LedgerPDFWrapper />
      },
      {
        path: 'clients',
        element: <ClientsWrapper />
      },
      {
        path: 'truck-hiring',
        element: <TruckHiringNotesWrapper />
      },
      {
        path: 'truck-hiring/view/:id',
        element: <THNPdfWrapper />
      },
      {
        path: 'settings',
        element: <SettingsWrapper />
      }
    ]
  }
]);
