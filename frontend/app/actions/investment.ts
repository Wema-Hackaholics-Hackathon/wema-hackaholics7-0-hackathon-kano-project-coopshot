'use server';

import { apiFetch } from '@/lib/api';
import { InvestmentCycle } from '@/types';
import { revalidatePath } from 'next/cache';

// Real backend note: this app's mock model assumes an admin picks a variable
// allocation percentage (5-50%) of *total historical assets* each time they
// start a cycle. The real backend works differently — it auto-skims a fixed
// 5% off every monthly contribution as it's paid, into a running pool
// balance; "starting a cycle" just means sweeping whatever's already
// accumulated in that pool into a treasury bill purchase. The percentage
// input in the UI is therefore cosmetic here (kept for the 5% minimum
// validation) — it doesn't change what gets invested, since the rate was
// already fixed at contribution time, not at cycle-start time.

const STAGE_TITLES = [
  { title: 'Pool Allocation Reserved', description: 'The 5% treasury cut from monthly contributions has accumulated in the group pool.' },
  { title: 'T-Bill Subscription Executed', description: 'The pool balance was swept into a sandbox treasury bill purchase.' },
  { title: 'Investment Active', description: 'Accruing simple interest at the connected product’s rate until maturity.' },
  { title: 'Maturity Reached', description: 'The treasury bill has reached its maturity date.' },
  { title: 'Returns Distributed', description: 'Principal + interest credited back to the group’s pool, ready to reinvest.' },
];

function emptyCycle(societyId: string, societyName: string, poolBalance: number): InvestmentCycle {
  return {
    id: `${societyId}-none`,
    society_id: societyId,
    society_name: societyName,
    total_pool_assets: poolBalance,
    allocation_percentage: 5,
    principal_amount: 0,
    instrument_name: 'Not yet started',
    tenor_days: 0,
    annual_yield_rate: 0,
    expected_returns: 0,
    status: 'allocated',
    started_at: '',
    maturity_date: '',
    milestones: [
      { stage: 1, ...STAGE_TITLES[0], date: '', completed: poolBalance > 0 },
      { stage: 2, ...STAGE_TITLES[1], date: '', completed: false },
      { stage: 3, ...STAGE_TITLES[2], date: '', completed: false },
      { stage: 4, ...STAGE_TITLES[3], date: '', completed: false },
      { stage: 5, ...STAGE_TITLES[4], date: '', completed: false },
    ],
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export async function getSocietyInvestmentCycle(
  societyId: string
): Promise<InvestmentCycle> {
  const res = await apiFetch(`/groups/${societyId}/treasury`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) throw new Error('Failed to fetch investment cycle');
  const data = await res.json();

  const latest = data.investments?.[0];
  if (!latest) {
    return emptyCycle(societyId, '', Number(data.poolBalance));
  }

  const isMatured = latest.status === 'matured';
  const status: InvestmentCycle['status'] = isMatured ? 'distributed' : 'active';

  return {
    id: `${societyId}-${latest.id}`,
    society_id: societyId,
    society_name: '',
    total_pool_assets: Number(data.poolBalance) + Number(latest.principal),
    allocation_percentage: 5,
    principal_amount: Number(latest.principal),
    instrument_name: latest.treasuryBill?.name || 'Treasury Bill',
    tenor_days: latest.tenorDays,
    annual_yield_rate: Number(latest.interestRate),
    expected_returns: isMatured ? Number(latest.returnAmount) : Number(latest.currentValue) - Number(latest.principal),
    status,
    started_at: latest.purchasedAt,
    maturity_date: latest.maturityDate,
    milestones: [
      { stage: 1, ...STAGE_TITLES[0], date: formatDate(latest.purchasedAt), completed: true },
      { stage: 2, ...STAGE_TITLES[1], date: formatDate(latest.purchasedAt), completed: true },
      { stage: 3, ...STAGE_TITLES[2], date: formatDate(latest.purchasedAt), completed: true },
      { stage: 4, ...STAGE_TITLES[3], date: formatDate(latest.maturityDate), completed: isMatured },
      { stage: 5, ...STAGE_TITLES[4], date: latest.distributedAt ? formatDate(latest.distributedAt) : '', completed: isMatured },
    ],
  };
}

async function ensureTreasuryBillConnected(societyId: string) {
  const summaryRes = await apiFetch(`/groups/${societyId}/treasury`, { method: 'GET', cache: 'no-store' }, true);
  if (!summaryRes.ok) return;
  const summary = await summaryRes.json();
  if (summary.connected) return;

  const catalogRes = await apiFetch('/treasury-bills', { method: 'GET', cache: 'no-store' }, true);
  if (!catalogRes.ok) return;
  const catalog = await catalogRes.json();
  const defaultBill = catalog[0]; // shortest tenor, ordered by tenorDays ASC — matches the 91-day mock default
  if (!defaultBill) return;

  await apiFetch(
    `/groups/${societyId}/treasury-bill`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ treasuryBillId: defaultBill.id }) },
    true
  );
}

export async function startInvestmentCycle(
  societyId: string,
  allocationPercentage: number
) {
  if (allocationPercentage < 5) {
    return {
      success: false,
      message: 'Minimum Treasury Bill allocation percentage is 5%.',
    };
  }

  await ensureTreasuryBillConnected(societyId);

  const res = await apiFetch(`/groups/${societyId}/treasury/invest`, { method: 'POST' }, true);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { success: false, message: data.message || 'Failed to start investment cycle' };
  }

  revalidatePath(`/dashboard/societies/${societyId}`);
  revalidatePath(`/dashboard/societies/${societyId}/wealth`);

  return {
    success: true,
    message: `Investment cycle launched: ₦${Number(data.principal).toLocaleString()} swept into a ${data.tenorDays}-day treasury bill at ${data.interestRate}% p.a.`,
    data: {
      allocation_percentage: 5,
      principal_amount: Number(data.principal),
      expected_returns: Math.round(Number(data.principal) * (Number(data.interestRate) / 100) * (data.tenorDays / 365)),
    },
  };
}

// Intentionally still mock: this backend has a fixed 5%-per-contribution
// skim rate, not a per-cycle configurable percentage — there's no setting to
// PATCH. Changing this for real would mean reworking how contributions are
// split at payment time, not just wiring an endpoint.
export async function updateTBillAllocationPercentage(
  societyId: string,
  allocationPercentage: number
) {
  if (allocationPercentage < 5) {
    return {
      success: false,
      message: 'Minimum Treasury Bill allocation percentage is 5%.',
    };
  }

  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  revalidatePath(`/dashboard/societies/${societyId}/wealth`);

  return {
    success: true,
    message: `This backend allocates a fixed 5% automatically — the percentage above is not yet configurable.`,
  };
}
