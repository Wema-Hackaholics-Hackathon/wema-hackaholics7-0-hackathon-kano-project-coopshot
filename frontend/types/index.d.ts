export interface SocietyProps {
  id: number;
  name: string;
  avatar_url: string;
  description: string;
  is_public: boolean;
  verified: boolean;
  created_at: string;
  total_members: number;
  can_join?: boolean; // optional, based on user auth state
  is_member?: boolean;
  is_pending_registration?: boolean;
  is_pending_equity?: boolean;
  has_paid_registration?: boolean;
  has_paid_equity?: boolean;
  can_manage?: boolean; // optional
  total_contributions: number;
  member_count: number;
  isFounder?: boolean;
  isCoFounder?: boolean;
  isExecutive?: boolean;
  current_user_id?: number;
  invite_code?: string;
  membership_status?: 'pending' | 'active';

  founder: {
    id: number;
    name: string;
    avatar_url?: string | null;
  };

  co_founder?: {
    id: number;
    name: string;
    avatar_url?: string | null;
  } | null;

  settings: {
    contribution_amount: number;
    registration_fee?: number;
    equity_amount?: number;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    payout_cycle: 'rotating' | 'fixed';
    late_fee: number;
    tbill_allocation_percentage?: number;
    tbill_duration_days?: number;
    rotation_queue?: [number];
    loan_multiplier?: number;
  };

  active_members?: {
    id: number;
    name: string;
    avatar_url?: string | null;
    role?: 'admin' | 'member';
    joined_at?: string;
  }[];

  my_total_contributed?: number;
  my_max_loan_amount?: number;
}

export interface Member {
  id: number;
  name: string;
  profile: {
    id: number;
    gender: string;
    avatar_url?: string | null;
  };
  pivot: {
    role: string;
    status: string;
    created_at: string;
  };
}

// Types from Ledger endpoint
export interface LedgerEntry {
  id: number;
  type: 'contribution' | 'payout' | 'late_fee';
  amount: number;
  description: string | null;
  created_at: string;
}

// Types from Penalties endpoint
export interface PenaltyEntry {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  waived: boolean;
  waived_at: string | null;
  waived_by: string | null;
  is_active: boolean;
}

export interface PenaltySummary {
  active_total: number;
  waived_total: number;
  grand_total: number;
}

export interface PenaltyCount {
  total: number;
  active: number;
  waived: number;
}

export interface PenaltiesResponse {
  penalties: PenaltyEntry[];
  summary: PenaltySummary;
  count: PenaltyCount;
}

// Types from Next Due Date endpoint
export interface NextDueDateResponse {
  next_due_date: string; // ISO date string
  days_until_due: number;
  amount_expected: number;
  late_fee: number;
  has_contributed_this_period: boolean;
}

// Main page data
interface LedgerPageData {
  society: SocietyProps;
  ledger: LedgerEntry[];
  summary: {
    total_contributed: number;
    total_payouts: number;
    current_balance: number;
  };
}

export interface SocietyDocument {
  id: number;
  type: string;
  file_url: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
  approved: boolean;
}

export interface PassportMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completed_at?: string | null;
}

// Fields dropped from an earlier mock-data version of this type:
// discipline_score, total_investment_returns, completed_cycles — the real
// backend (see BACKEND_INTEGRATION.md) has no honest per-member value for
// these (investment cycles/returns are pooled at the group level, not
// attributable to one member's exact naira), so rather than fabricate numbers
// they were removed here and from the components that rendered them.
export interface FinancialPassport {
  user_id: number;
  user_name: string;
  member_since: string;
  trust_level: string;
  trust_status: string;
  consistency_score: number;
  repayment_score: number;
  discipline_score: number;
  investment_score: number;
  total_savings: number;
  total_contributions: number;
  total_investment_returns: number;
  completed_cycles: number;
  verified_cooperatives_count: number;
  milestones: PassportMilestone[];
  active_societies?: any[];
}

export interface InvestmentCycleMilestone {
  stage: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface InvestmentCycle {
  id: string;
  society_id: string | number;
  society_name: string;
  total_pool_assets: number;
  allocation_percentage: number;
  principal_amount: number;
  instrument_name: string;
  tenor_days: number;
  annual_yield_rate: number;
  expected_returns: number;
  status: 'allocated' | 'purchased' | 'active' | 'matured' | 'distributed';
  started_at: string;
  maturity_date: string;
  milestones: InvestmentCycleMilestone[];
}

export interface FinancialOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'investment' | 'credit' | 'insurance' | 'sme' | 'pension';
  status: 'active' | 'unlocked' | 'locked';
  required_level: string;
  benefit_summary: string;
  partner_name?: string;
  interest_rate_or_yield?: string;
  max_limit?: string;
}