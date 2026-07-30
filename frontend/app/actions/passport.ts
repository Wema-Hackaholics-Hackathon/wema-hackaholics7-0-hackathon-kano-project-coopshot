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
  try {
    const [res, groupsRes] = await Promise.all([
      apiFetch('/passport', { method: 'GET', cache: 'no-store' }, true),
      apiFetch('/groups', { method: 'GET', cache: 'no-store' }, true).catch(() => null),
    ]);

    let active_societies: any[] = [];
    if (groupsRes && groupsRes.ok) {
      const groups = await groupsRes.json();
      active_societies = groups.map((g: any) => ({
        id: String(g.id),
        name: g.name,
        description: g.description || '',
        avatar_url: g.avatarUrl || '',
        role: g.myRole === 'admin' ? 'Founder' : 'Member',
        total_members: g.memberCount ?? 0,
        settings: {
          contribution_amount: Number(g.monthlyAmount),
          registration_fee: Number(g.registrationFee || 0),
          equity_amount: Number(g.equityAmount || 25000),
          frequency: 'monthly',
        },
      }));
    }

    if (res.ok) {
      const data = await res.json();
      const user = await getCurrentUser();

      return {
        user_id: Number(user?.id) || 0,
        user_name: data.identity?.name || user?.name || 'Member',
        member_since: data.memberSince
          ? new Date(data.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : 'New Member',
        trust_level: data.trustProfile?.label || 'Bronze',
        trust_status: `Verified across ${data.cooperativesJoined || active_societies.length} societ${(data.cooperativesJoined || active_societies.length) === 1 ? 'y' : 'ies'}`,
        consistency_score: data.trustProfile?.consistency || 0,
        repayment_score: data.trustProfile?.paymentReliability || 0,
        discipline_score: data.trustProfile?.discipline || 0,
        investment_score: data.trustProfile?.investmentParticipation || 0,
        total_savings: data.totalContributed || 0,
        total_contributions: data.totalContributed || 0,
        total_investment_returns: Math.round(data.totalInvestmentReturns || 0),
        completed_cycles: data.completedCycles || 0,
        verified_cooperatives_count: data.cooperativesJoined || active_societies.length,
        milestones: (data.journey || []).map((step: any) => ({
          id: step.key,
          title: step.label,
          description: MILESTONE_DESCRIPTIONS[step.key] || '',
          completed: step.achieved,
          completed_at: null,
        })),
        active_societies,
      };
    }
  } catch (error) {
    console.error('Error fetching financial passport:', error);
  }

  const user = await getCurrentUser();
  return {
    user_id: Number(user?.id) || 1,
    user_name: user?.name || 'Member',
    member_since: 'New Member',
    trust_level: 'Bronze',
    trust_status: 'Verified across 0 societies',
    consistency_score: 0,
    repayment_score: 0,
    discipline_score: 0,
    investment_score: 0,
    total_savings: 0,
    total_contributions: 0,
    total_investment_returns: 0,
    completed_cycles: 0,
    verified_cooperatives_count: 0,
    milestones: [],
    active_societies: [],
  };
}

