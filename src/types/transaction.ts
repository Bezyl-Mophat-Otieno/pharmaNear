import { PaymentMethod, PaymentStatus } from "./order";

export interface Transaction {
  transaction_id: string;
  transaction_number: string;
  order_id: string;
  customer_fullname: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  method_of_payment: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_type: TransactionType;
  reconciled: boolean;
  reconcilled_by?: string;
  reconciled_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'order_payment' | 'order_refund'| 'order_reversal';

export interface FinancialSummary {
  total_transactions: string;
  paid_transactions: string;
  pending_transactions: string;
  failed_transactions: string;
  total_revenue: string;
  mpesa_revenue: string;
  cash_revenue: string;
  bank_revenue: string;
  total_profit: string;
  average_order_value: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalProfit: number;
  totalTransactions: number;
  pendingPayments: number;
  mpesaPayments: number;
  cardPayments: number;
  cashPayments: number;
  profitMargin: number;
}