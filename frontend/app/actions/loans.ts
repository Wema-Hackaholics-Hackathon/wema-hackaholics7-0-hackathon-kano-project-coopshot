'use server';

import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export interface LoanRequest {
  id: number;
  groupId: number;
  userId: number;
  amount: number;
  eligibleAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  decidedByUserId: number | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: { id: number; name: string; email: string };
  decider?: { id: number; name: string; email: string } | null;
}

export async function requestLoan(societyId: string, amount: number) {
  const res = await apiFetch(
    `/groups/${societyId}/loans`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    },
    true
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to submit loan request');
  }

  revalidatePath(`/dashboard/societies/${societyId}`);
  revalidatePath(`/dashboard/societies/${societyId}/settings`);

  return data as LoanRequest;
}

export async function getMyLoanRequests(societyId: string): Promise<LoanRequest[]> {
  const res = await apiFetch(`/groups/${societyId}/loans/mine`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) return [];
  return res.json();
}

export async function getGroupLoanRequests(societyId: string): Promise<LoanRequest[]> {
  const res = await apiFetch(`/groups/${societyId}/loans`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) return [];
  return res.json();
}

export async function decideLoanRequest(
  societyId: string,
  loanId: number,
  status: 'approved' | 'rejected',
  note?: string
) {
  const res = await apiFetch(
    `/groups/${societyId}/loans/${loanId}/decision`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    },
    true
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to record decision');
  }

  revalidatePath(`/dashboard/societies/${societyId}/settings`);

  return data as LoanRequest;
}
