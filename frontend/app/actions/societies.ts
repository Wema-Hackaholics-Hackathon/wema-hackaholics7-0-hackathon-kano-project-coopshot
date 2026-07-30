//actions/societies.ts
'use server';

import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './getCurrentUser';
import { Member, SocietyDocument, SocietyProps } from '@/types';

function serializeDiscoveredGroup(g: any): SocietyProps {
  return {
    id: g.id,
    name: g.name,
    avatar_url: g.avatarUrl || '',
    description: g.description || '',
    is_public: true,
    verified: g.status === 'active',
    created_at: g.createdAt,
    total_members: g.memberCount ?? 0,
    member_count: g.memberCount ?? 0,
    total_contributions: 0,
    can_join: g.status === 'forming',
    can_manage: false,
    founder: { id: 0, name: '' },
    settings: {
      contribution_amount: Number(g.monthlyAmount),
      frequency: 'monthly',
      payout_cycle: 'fixed',
      late_fee: 0,
    },
  };
}

export async function getRecommendedSocieties({
  page = 1,
}: { page?: number } = {}) {
  try {
    const res = await apiFetch(`/groups/recommended?page=${page}`, { method: 'GET', cache: 'no-store' }, true);
    if (res.ok) {
      const data = await res.json();
      return {
        data: (data.data || []).map(serializeDiscoveredGroup),
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      };
    }
  } catch (err) {
    console.error('Error fetching recommended societies:', err);
  }

  return {
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  };
}

export async function getPublicSocieties({
  search = '',
  page = 1,
}: { search?: string; page?: number } = {}) {
  try {
    let endpoint = `/groups/public?page=${page}`;
    if (search.trim()) {
      endpoint += `&search=${encodeURIComponent(search.trim())}`;
    }

    const res = await apiFetch(endpoint, { method: 'GET', cache: 'no-store' }, true);
    if (res.ok) {
      const data = await res.json();
      return {
        data: (data.data || []).map(serializeDiscoveredGroup),
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      };
    }
  } catch (err) {
    console.error('Error fetching public societies:', err);
  }

  return {
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  };
}


// Join a public society directly — no invite code required. Asusu's original
// UI has no "join public society" button wired anywhere yet (society-cards.tsx
// only links to "View Society"), but the action is here for when it does.
export async function joinPublicSociety(societyId: string) {
  const res = await apiFetch(`/groups/${societyId}/join-public`, { method: 'POST' }, true);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to join society');
  }
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/societies');
  return res.json();
}

// Join a private society using its invite code — real POST /groups/join.
// Never wired anywhere in the UI (no form existed to call it), even though
// it's this backend's primary join mechanism for non-public societies.
export async function joinSocietyWithCode(inviteCode: string) {
  const res = await apiFetch(
    '/groups/join',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
    },
    true
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to join society');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/societies');
  return data;
}

// Real backend call. Note: this backend's groups have concepts asusu's mock
// SocietyProps doesn't (a pending-registration-fee gate, forming/active
// lifecycle) and asusu has concepts this backend doesn't (co-founder,
// public/private visibility, verification) — the mapping below is best-effort;
// see asusu/BACKEND_INTEGRATION.md for the exact list of what's real vs mock.
export async function getSociety(id: string): Promise<SocietyProps> {
  try {
    const res = await apiFetch(`/groups/${id}`, { method: 'GET', cache: 'no-store' }, true);

    if (!res.ok) {
      return null as any;
    }
    const group = await res.json();

    const isMember = group.membershipStatus === 'active' || group.membershipStatus === 'pending';

    const hasPaidRegistration = group.hasPaidRegistration !== undefined
      ? !!group.hasPaidRegistration
      : (Number(group.registrationFee || 0) === 0);

    const hasPaidEquity = group.hasPaidEquity !== undefined
      ? !!group.hasPaidEquity
      : (Number(group.equityAmount || 0) === 0);

    const isPendingRegistration = !hasPaidRegistration;
    const isPendingEquity = hasPaidRegistration && !hasPaidEquity;

    if (!isMember) {
      return {
        id: group.id,
        name: group.name,
        avatar_url: group.avatarUrl || '',
        description: group.description || '',
        is_public: !!group.isPublic,
        verified: group.status === 'active',
        created_at: group.createdAt || new Date().toISOString(),
        total_members: group.memberCount ?? 0,
        total_contributions: 0,
        member_count: group.memberCount ?? 0,
        can_join: !!group.isPublic && (group.membershipStatus === 'none' || !group.membershipStatus),
        is_member: false,
        is_pending_registration: false,
        is_pending_equity: false,
        has_paid_registration: false,
        has_paid_equity: false,
        can_manage: false,
        isFounder: false,
        isCoFounder: false,
        isExecutive: false,
        founder: { id: group.creator?.id || 0, name: group.creator?.name || 'Founder' },
        co_founder: null,
        settings: {
          contribution_amount: Number(group.monthlyAmount),
          registration_fee: Number(group.registrationFee || 0),
          equity_amount: Number(group.equityAmount || 25000),
          frequency: 'monthly',
          payout_cycle: 'fixed',
          late_fee: 0,
          loan_multiplier: Number(group.loanMultiplier || 1),
        },
      };
    }

    return {
      id: group.id,
      name: group.name,
      avatar_url: group.avatarUrl || '',
      description: group.description || '',
      is_public: !!group.isPublic,
      verified: group.status === 'active',
      invite_code: group.inviteCode,
      created_at: group.createdAt || new Date().toISOString(),
      total_members: group.members?.length || group.memberCount || 0,
      total_contributions: Number(group.totalCollected || 0),
      member_count: group.members?.length || group.memberCount || 0,
      can_join: false,
      is_member: true,
      is_pending_registration: isPendingRegistration,
      is_pending_equity: isPendingEquity,
      has_paid_registration: hasPaidRegistration,
      has_paid_equity: hasPaidEquity,
      can_manage: group.myRole === 'admin',
      isFounder: group.myRole === 'admin',
      isCoFounder: false,
      isExecutive: false,
      founder: {
        id: group.creator?.id || 0,
        name: group.creator?.name || 'Founder',
        avatar_url: null,
      },
      co_founder: null,
      settings: {
        contribution_amount: Number(group.monthlyAmount),
        registration_fee: Number(group.registrationFee || 0),
        equity_amount: Number(group.equityAmount || 25000),
        frequency: 'monthly',
        payout_cycle: 'fixed',
        late_fee: Number(group.lateFeeAmount || 0),
        loan_multiplier: Number(group.loanMultiplier || 1),
      },
      active_members: (group.members || []).map((m: any) => ({
        id: m.userId,
        name: m.name,
        avatar_url: null,
        role: m.role,
        joined_at: m.joinedAt,
      })),
      my_total_contributed: group.myTotalContributed !== undefined ? Number(group.myTotalContributed) : undefined,
      my_max_loan_amount: group.myMaxLoanAmount !== undefined ? Number(group.myMaxLoanAmount) : undefined,
    };
  } catch (err) {
    console.error('Error fetching society:', err);
    return null as any;
  }
}

export async function getSocietyMembers(id: string) {
  const user = await getCurrentUser();

  /* ORIGINAL BACKEND CALL:
  const res = await apiFetch(
    `/societies/${id}/members`,
    {
      method: 'GET',
      cache: 'no-store',
    },
    true
  );

  if (!res.ok) throw new Error('Failed to fetch members');
  const data = await res.json();

  const currentMember = data.members.find((m: any) => m.id === user?.id);

  const isFounder = data.society.founder?.id === user?.id;
  const isCoFounder = data.society.co_founder?.id === user?.id;
  const isExecutive = currentMember?.pivot?.role === 'executive';

  const canManage = isFounder || isCoFounder || isExecutive;

  return {
    society: {
      ...data.society,
      current_user_id: user?.id,
      isFounder,
      isCoFounder,
      isExecutive,
      can_manage: canManage,
    },
    members: data.members,
  };
  */

  const society = await getSociety(id);
  const userId = user?.id ? Number(user.id) : undefined;
  const isFounder = society.founder?.id === userId;
  const isCoFounder = society.co_founder?.id === userId;
  const isExecutive = false;

  const members: Member[] = (society.active_members || []).map((m) => ({
    id: m.id,
    name: m.name,
    profile: {
      id: m.id,
      gender: '',
      avatar_url: m.avatar_url,
    },
    pivot: {
      role: m.id === society.founder?.id ? 'founder' : m.role === 'admin' ? 'co-founder' : 'member',
      status: 'active',
      created_at: m.joined_at || society.created_at,
    },
  }));

  return {
    society: {
      ...society,
      current_user_id: userId,
      isFounder,
      isCoFounder,
      isExecutive,
      can_manage: isFounder || isCoFounder || isExecutive,
    },
    members,
  };
}

export async function getSocietyLedger(id: string) {
  try {
    const [society, res] = await Promise.all([
      getSociety(id),
      apiFetch(`/groups/${id}/ledger`, { method: 'GET', cache: 'no-store' }, true),
    ]);

    if (res.ok) {
      const data = await res.json();
      return {
        society,
        ledger: data.ledger || [],
        summary: data.summary || { total_contributed: 0, total_payouts: 0, current_balance: 0 },
      };
    }
  } catch (err) {
    console.error('Error fetching ledger:', err);
  }

  const society = await getSociety(id);
  return {
    society,
    ledger: [],
    summary: { total_contributed: 0, total_payouts: 0, current_balance: 0 },
  };
}

// Real: this backend has an actual rotation mechanic (see
// backend/src/controllers/rotationController.js) — a permanent payout order
// assigned once when the group starts, cycling through members monthly,
// paid out from that month's real collected contributions by an admin
// action. GET /groups/:id/rotation returns an honest empty queue for a
// group that hasn't started yet, rather than an error.
export async function getSocietyRotationQueue(id: string) {
  const [society, res] = await Promise.all([
    getSociety(id),
    apiFetch(`/groups/${id}/rotation`, { method: 'GET', cache: 'no-store' }, true),
  ]);

  if (!res.ok) throw new Error('Failed to fetch rotation queue');
  const data = await res.json();

  return {
    society,
    rotation: {
      queue: data.queue,
      my_position: data.my_position,
      next_up: data.next_up,
      cycle: data.cycle,
      started: data.started,
      history: data.history,
    },
  };
}

export async function distributeRotationPayout(societyId: string) {
  const res = await apiFetch(`/groups/${societyId}/rotation/distribute`, { method: 'POST' }, true);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to distribute rotation payout');
  }

  revalidatePath(`/dashboard/societies/${societyId}/rotation`);
  revalidatePath(`/dashboard/societies/${societyId}/ledger`);

  return {
    success: true,
    message: `₦${Number(data.amount).toLocaleString()} distributed to this month's recipient.`,
  };
}

// Derived from real contribution history: one entry per past month (since
// this member's registration was activated) with no successful monthly
// contribution — only meaningful once the group admin sets a non-zero late
// fee in settings; otherwise this is honestly an empty list, not mock data.
export async function getMyPenalties(id: string) {
  try {
    const res = await apiFetch(`/groups/${id}/penalties`, { method: 'GET', cache: 'no-store' }, true);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching penalties:', err);
  }

  return {
    penalties: [],
    summary: { active_total: 0, waived_total: 0, grand_total: 0 },
    count: { total: 0, active: 0, waived: 0 },
  };
}

// This backend has no per-day due date — "due" is the end of the current
// calendar month once the group has been started by its admin.
export async function getNextDueDate(id: string) {
  try {
    const res = await apiFetch(`/groups/${id}/next-due`, { method: 'GET', cache: 'no-store' }, true);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching next due date:', err);
  }

  return {
    next_due_date: new Date().toISOString(),
    days_until_due: 30,
    amount_expected: 0,
    late_fee: 0,
    has_contributed_this_period: false,
  };
}

export async function createSociety(formData: FormData) {
  // This backend has no image upload endpoint, so an avatar picked in the
  // dialog is silently dropped — everything else (name, description, the two
  // required money fields) goes through as real JSON, since this backend
  // takes application/json, not multipart form data.
  const name = (formData.get('name') as string) || '';
  const description = (formData.get('description') as string) || undefined;
  const monthlyAmount = formData.get('monthlyAmount') as string;
  const registrationFee = formData.get('registrationFee') as string;

  const res = await apiFetch(
    '/groups',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, monthlyAmount, registrationFee }),
    },
    true
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create society');
  }

  const group = await res.json();

  const newSociety: SocietyProps = {
    id: group.id,
    name: group.name,
    description: group.description || '',
    avatar_url: '',
    is_public: !!group.isPublic,
    verified: group.status === 'active',
    invite_code: group.inviteCode,
    created_at: group.createdAt,
    total_members: 1,
    member_count: 1,
    total_contributions: 0,
    can_join: false,
    can_manage: true,
    isFounder: true,
    founder: { id: 0, name: '' },
    settings: {
      contribution_amount: Number(group.monthlyAmount),
      frequency: 'monthly',
      payout_cycle: 'fixed',
      late_fee: 0,
    },
  };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/societies');

  return newSociety;
}

export async function inviteMember(societyId: string, email: string) {
  const res = await apiFetch(
    `/groups/${societyId}/invites`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'member' }),
    },
    true
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to invite member');
  }

  const data = await res.json();
  revalidatePath(`/dashboard/societies/${societyId}/members`);
  return { message: `Invitation sent to ${email}`, invite: data };
}

export async function getSocietySettings(societyId: string) {
  return await getSocietyMembers(societyId);
}

// "Co-founder" reuses this backend's existing admin/member role split — an
// accepted co-founder invite makes that person a second admin on the group,
// rather than adding a distinct third role tier.
export async function inviteCoFounder(societyId: string, email: string) {
  const res = await apiFetch(
    `/groups/${societyId}/invites`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'admin' }),
    },
    true
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to invite co-founder');
  }

  const data = await res.json();
  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  revalidatePath(`/dashboard/societies/${societyId}`);
  return { message: `Co-founder invitation sent to ${email}`, invite: data };
}

// Admin-only, one-way: flips the group from "forming" to "active", closing
// the invite code to new members and opening up monthly contributions.
export async function startSociety(societyId: string) {
  const res = await apiFetch(`/groups/${societyId}/start`, { method: 'POST' }, true);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to start society');
  }

  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  revalidatePath(`/dashboard/societies/${societyId}`);
  return { success: true };
}

export async function toggleSocietyVisibility(
  societyId: string,
  isPublic: boolean
) {
  const res = await apiFetch(
    `/groups/${societyId}/visibility`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic }),
    },
    true
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update visibility');
  }

  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  revalidatePath(`/dashboard/societies/${societyId}`);
  return res.json();
}

// Note: this backend has no "frequency" or "payout_cycle" concept (every
// group is a fixed monthly amount, no rotating payouts) — only
// contribution_amount (-> monthlyAmount) and late_fee (-> lateFeeAmount) map
// to anything real. Monthly amount can only change while the group is still
// "forming" — this backend rejects the change otherwise.
export async function updateSocietySettings(
  societyId: string,
  data: {
    contribution_amount?: number;
    frequency?: 'weekly' | 'monthly' | 'quarterly';
    payout_cycle?: 'rotating' | 'fixed';
    late_fee?: number;
    loan_multiplier?: number;
  }
) {
  const res = await apiFetch(
    `/groups/${societyId}/settings`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyAmount: data.contribution_amount,
        lateFeeAmount: data.late_fee,
        loanMultiplier: data.loan_multiplier,
      }),
    },
    true
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update settings');
  }

  const result = await res.json();

  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  revalidatePath(`/dashboard/societies/${societyId}`);

  return { success: true, settings: result };
}

export async function getSocietyDocuments(
  societyId: string
): Promise<SocietyDocument[]> {
  try {
    const res = await apiFetch(`/groups/${societyId}/documents`, { method: 'GET', cache: 'no-store' }, true);
    if (res.ok) {
      const documents = await res.json();
      return documents.map((d: any) => ({
        id: d.id,
        type: d.type,
        file_url: d.fileUrl,
        description: d.description,
        uploaded_by: String(d.uploadedByUserId),
        uploaded_at: d.createdAt,
        approved: d.approved,
      }));
    }
  } catch (err) {
    console.error('Error loading society documents:', err);
  }
  return [];
}

// Upload a document (admin only). formData must contain "file", plus "type"
// and optionally "description" — matches this backend's multipart contract.
export async function uploadSocietyDocument(societyId: string, formData: FormData) {
  const res = await apiFetch(`/groups/${societyId}/documents`, { method: 'POST', body: formData }, true);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upload document');
  }
  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  return res.json();
}

export async function updateSocietyAvatar(
  societyId: string,
  formData: FormData
) {
  // This backend expects the file under the field name "avatar"
  const file = formData.get('avatar') || formData.get('file');
  const uploadData = new FormData();
  if (file) uploadData.append('avatar', file);

  const res = await apiFetch(`/groups/${societyId}/avatar`, { method: 'POST', body: uploadData }, true);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update avatar');
  }

  const data = await res.json();

  revalidatePath(`/dashboard/societies/${societyId}/settings`);
  revalidatePath(`/dashboard/societies/${societyId}`);

  return data.avatarUrl as string;
}

export async function getMyActiveSocieties() {
  const res = await apiFetch('/groups', { method: 'GET', cache: 'no-store' }, true);

  if (!res.ok) {
    throw new Error('Failed to fetch my active societies');
  }

  const groups = await res.json();

  const active_societies = groups.map((g: any) => ({
    id: String(g.id),
    name: g.name,
    description: g.description || '',
    avatar_url: '',
    is_public: !!g.isPublic,
    verified: g.status === 'active',
    membership_status: g.membershipStatus as 'pending' | 'active',
    role: g.myRole === 'admin' ? 'founder' : 'member',
    total_members: g.memberCount ?? 0,
    settings: {
      contribution_amount: Number(g.monthlyAmount),
      frequency: 'monthly' as const,
      payout_cycle: 'fixed' as const,
      late_fee: 0,
    },
    next_due: { date: null, days_until: null },
  }));

  return {
    active_societies,
    total: active_societies.length,
  };
}

// Asusu's UI treats "invite.id" as an opaque identifier for the invite entry
// itself (see components/invite-cards-list.tsx) — it maps 1:1 onto this
// backend's own GroupInvite.id, so no ID translation is needed anywhere else.
export async function getPendingInvites() {
  const res = await apiFetch('/invites', { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) {
    throw new Error('Failed to fetch pending invites');
  }
  const data = await res.json();

  const pending_invites = data.data.map((invite: any) => ({
    id: invite.id,
    name: invite.group.name,
    description: invite.group.description,
    avatar_url: invite.group.avatarUrl,
    is_public: invite.group.isPublic,
    invited_by: invite.invitedBy?.name || 'Unknown',
    invited_at: invite.createdAt,
    invite_type: invite.role === 'admin' ? 'co-founder' : 'member',
    role: invite.role === 'admin' ? 'Co-Founder' : 'Member',
  }));

  return { pending_invites, total: data.total };
}

export async function acceptInvite(
  inviteId: string,
  inviteType: 'member' | 'co-founder'
) {
  const res = await apiFetch(`/invites/${inviteId}/accept`, { method: 'POST' }, true);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to accept invite');
  }

  const data = await res.json();

  revalidatePath('/dashboard/invites');
  revalidatePath('/dashboard/societies');
  revalidatePath(`/dashboard/societies/${data.groupId}`);

  return { success: true, message: 'Invite accepted' };
}

export async function declineInvite(inviteId: string) {
  const res = await apiFetch(`/invites/${inviteId}/decline`, { method: 'POST' }, true);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to decline invite');
  }

  revalidatePath('/dashboard/invites');
  return { success: true, message: 'Invite declined' };
}

// NOTE: the real getFinancialPassport lives in app/actions/passport.ts — both
// dashboard pages import from there, so this file no longer duplicates it.
