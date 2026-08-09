// Real endpoints: GET /api/charges, GET/POST /api/payments
import { apiClient } from "./api-client";
import type { Charge, ChargeStatus, ChargeType, Payment, PaymentMethod } from "@/types/billing";

export interface BackendCharge {
  id: number;
  userId: number;
  loanId: number | null;
  ebookLoanId: number | null;
  type: ChargeType;
  amount: number;
  status: ChargeStatus;
  bookTitle: string | null;
  createdAt: string;
  clearedAt: string | null;
}

interface BackendPayment {
  id: number;
  chargeId: number;
  userId: number;
  method: PaymentMethod;
  amount: number;
  paystackReference: string | null;
  clearedByLibrarianId: number | null;
  paidAt: string;
}

export function toCharge(c: BackendCharge): Charge {
  return {
    id: String(c.id),
    userId: String(c.userId),
    loanId: c.loanId != null ? String(c.loanId) : undefined,
    ebookLoanId: c.ebookLoanId != null ? String(c.ebookLoanId) : undefined,
    type: c.type,
    amount: c.amount,
    status: c.status,
    bookTitle: c.bookTitle ?? undefined,
    createdAt: c.createdAt,
    clearedAt: c.clearedAt ?? undefined,
  };
}

function toPayment(p: BackendPayment): Payment {
  return {
    id: String(p.id),
    chargeId: String(p.chargeId),
    userId: String(p.userId),
    method: p.method,
    amount: p.amount,
    paystackReference: p.paystackReference ?? undefined,
    clearedByLibrarianId: p.clearedByLibrarianId != null ? String(p.clearedByLibrarianId) : undefined,
    paidAt: p.paidAt,
  };
}

export async function listCharges(filter?: { mine?: boolean }): Promise<Charge[]> {
  const { data } = await apiClient.get<BackendCharge[]>("/charges", { params: { mine: filter?.mine } });
  return data.map(toCharge);
}

export async function listPayments(filter?: { mine?: boolean }): Promise<Payment[]> {
  const { data } = await apiClient.get<BackendPayment[]>("/payments", { params: { mine: filter?.mine } });
  return data.map(toPayment);
}

// clearedByLibrarianId is derived server-side from the JWT, never sent by the client.
// reference is the Paystack transaction reference from the checkout popup -- required
// when method is "paystack"; the backend re-verifies it against Paystack's API.
export async function payCharge(chargeId: string, method: PaymentMethod, reference?: string): Promise<Payment> {
  const { data } = await apiClient.post<BackendPayment>("/payments", { chargeId: Number(chargeId), method, reference });
  return toPayment(data);
}
