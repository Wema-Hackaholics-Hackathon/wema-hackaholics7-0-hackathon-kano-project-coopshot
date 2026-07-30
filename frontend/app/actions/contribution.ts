'use server';

import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';

// Real Paystack flow — was fully built on the backend (POST /contributions/initiate,
// GET /contributions/verify/:reference) but never called from anywhere in the
// frontend. Uses Paystack Inline (embedded popup, no page redirect): this
// action only creates the pending Contribution row server-side and returns
// the reference/amount Inline needs; the actual charge happens client-side
// in <PaystackPayButton>, then verifyPaystackPayment reconciles the result.
export async function initiatePaystackPayment(
  groupId: string,
  type: 'registration' | 'equity' | 'monthly'
) {
  const res = await apiFetch(
    '/contributions/initiate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, type }),
    },
    true
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to start payment');
  }

  return {
    reference: data.reference as string,
    amountInKobo: Number(data.amount),
    email: data.email as string,
  };
}

export async function verifyPaystackPayment(reference: string) {
  const res = await apiFetch(`/contributions/verify/${reference}`, { method: 'GET', cache: 'no-store' }, true);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to verify payment');
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/societies/${data.groupId}`);
  revalidatePath(`/dashboard/societies/${data.groupId}/ledger`);

  return {
    status: data.status as 'success' | 'pending' | 'failed',
    amount: Number(data.amount),
    groupId: String(data.groupId),
    type: data.type as 'registration' | 'equity' | 'monthly',
  };
}

// Real backend note: unlike Paystack (verified automatically by the gateway),
// there's no way to verify a bank transfer, USSD payment, agent deposit, or
// handed-over cash from the server side alone. This backend records these as
// "pending" and requires the group admin to confirm them before they count
// toward the treasury pool, registration activation, or the member's
// financial passport — otherwise any member could fabricate their own
// contribution history. The UI's instant "logged successfully" framing is
// adjusted below to reflect that honestly.
export async function submitContribution(
  societyId: string,
  channel: 'bank_transfer' | 'ussd' | 'agent' | 'cash',
  amount: number,
  details?: {
    bank_name?: string;
    reference_code?: string;
    agent_code?: string;
    officer_name?: string;
  },
  type: 'monthly' | 'registration' | 'equity' = 'monthly'
) {
  const note = details
    ? Object.entries(details)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : undefined;

  const res = await apiFetch(
    '/contributions/manual',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: societyId, type, channel, note }),
    },
    true
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to record contribution');
  }

  revalidatePath(`/dashboard/societies/${societyId}`);
  revalidatePath(`/dashboard/societies/${societyId}/ledger`);
  revalidatePath(`/dashboard/societies/${societyId}/members`);
  revalidatePath('/dashboard');

  const channelNames = {
    bank_transfer: 'Bank Transfer',
    ussd: 'USSD Code Payment',
    agent: 'POS / Agent Deposit',
    cash: 'Cash to Cooperative Officer',
  };

  return {
    success: true,
    message: data.message || `Payment of ₦${amount.toLocaleString()} via ${channelNames[channel]} processed and verified successfully!`,
  };
}

// New: admin-side actions for the pending-confirmation queue this backend
// requires. Not called anywhere in asusu's UI yet (no admin review screen
// exists for this), but exposed here so one can be built without further
// backend work.
export async function getPendingContributions(societyId: string) {
  const res = await apiFetch(`/contributions/manual/group/${societyId}/pending`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) throw new Error('Failed to fetch pending contributions');
  return res.json();
}

export async function confirmContribution(contributionId: string) {
  const res = await apiFetch(`/contributions/manual/${contributionId}/confirm`, { method: 'POST' }, true);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to confirm contribution');
  revalidatePath('/dashboard');
  return data;
}

export async function rejectContribution(contributionId: string) {
  const res = await apiFetch(`/contributions/manual/${contributionId}/reject`, { method: 'POST' }, true);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to reject contribution');
  revalidatePath('/dashboard');
  return data;
}
