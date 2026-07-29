'use server';

import { apiFetch } from '@/lib/api';
import { MOCK_FINANCIAL_OPPORTUNITIES } from '@/lib/mock-data';
import { FinancialOpportunity } from '@/types';

// These products (credit line, insurance, SME financing) are intentionally
// aspirational — this backend only actually fulfills the treasury bill
// investment product. Rather than serve a fully static catalog, the unlock
// *status* of each is computed for real against the member's actual trust
// score from /api/passport, so at least "are you eligible" reflects genuine
// behavior instead of a fixed mock value.
export async function getFinancialOpportunities(): Promise<FinancialOpportunity[]> {
  let overallScore = 0;
  let hasInvestmentHistory = false;

  try {
    const res = await apiFetch('/passport', { method: 'GET', cache: 'no-store' }, true);
    if (res.ok) {
      const passport = await res.json();
      overallScore = passport.trustProfile?.overallScore ?? 0;
      hasInvestmentHistory = Number(passport.totalInvestmentAllocated) > 0;
    }
  } catch {
    // fall through with defaults — an unreachable backend shouldn't break this page
  }

  return MOCK_FINANCIAL_OPPORTUNITIES.map((opp) => {
    if (opp.category === 'investment') {
      return { ...opp, status: hasInvestmentHistory ? 'active' : 'unlocked' };
    }
    if (opp.category === 'credit') {
      return { ...opp, status: overallScore >= 85 ? 'unlocked' : 'locked' };
    }
    // insurance / sme / pension: not built at all in this backend, always locked
    return { ...opp, status: 'locked' };
  });
}
