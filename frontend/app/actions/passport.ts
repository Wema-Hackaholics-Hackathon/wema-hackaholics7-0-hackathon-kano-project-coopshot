'use server';

import { apiFetch } from '@/lib/api';
import { getCurrentUser } from './getCurrentUser';
import { FinancialPassport } from '@/types';

const MILESTONE_DESCRIPTIONS: Record<string, string> = {
  joined: 'Became a member of a cooperative society.',
  registered: 'Paid the one-time registration fee required to become an active member.',
  consistent: 'Made contributions in 3 or more distinct months.',
  invested: "Had a contribution land in a period when the group's treasury bill was connected.",
  credit: 'Not available yet.',
  protection: 'Not available yet.',
};

export async function getFinancialPassport(): Promise<FinancialPassport> {
  const res = await apiFetch('/passport', { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) throw new Error('Failed to fetch financial passport');
  const data = await res.json();
  const user = await getCurrentUser();

  return {
    user_id: Number(user?.id) || 0,
    user_name: data.identity.name,
    member_since: data.memberSince
      ? new Date(data.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'New Member',
    trust_level: data.trustProfile.label,
    trust_status: `Verified across ${data.cooperativesJoined} societ${data.cooperativesJoined === 1 ? 'y' : 'ies'}`,
    consistency_score: data.trustProfile.consistency,
    repayment_score: data.trustProfile.paymentReliability,
    discipline_score: data.trustProfile.discipline,
    investment_score: data.trustProfile.investmentParticipation,
    total_savings: data.totalContributed,
    total_contributions: data.totalContributed,
    total_investment_returns: Math.round(data.totalInvestmentReturns),
    completed_cycles: data.completedCycles,
    verified_cooperatives_count: data.cooperativesJoined,
    milestones: data.journey.map((step: any) => ({
      id: step.key,
      title: step.label,
      description: MILESTONE_DESCRIPTIONS[step.key] || '',
      completed: step.achieved,
      completed_at: null,
    })),
  };
}
