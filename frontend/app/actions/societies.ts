//actions/societies.ts
'use server';

import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './getCurrentUser';
import { SocietyDocument, SocietyProps } from '@/types';
import { MOCK_MEMBERS, MOCK_SOCIETIES } from '@/lib/mock-data';

function serializeDiscoveredGroup(g: any): SocietyProps {
  return {
    id: g.id,
    name: g.name,
    avatar_url: g.avatarUrl || '',
    description: g.description || '',
    is_public: true,
    verified: false,
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
  const res = await apiFetch(`/groups/recommended?page=${page}`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) {
    throw new Error('Failed to fetch recommended societies');
  }
  const data = await res.json();
  return {
    data: data.data.map(serializeDiscoveredGroup),
    current_page: data.current_page,
    last_page: data.last_page,
    total: data.total,
  };
}

export async function getPublicSocieties({
  search = '',
  page = 1,
}: { search?: string; page?: number } = {}) {
  let endpoint = `/groups/public?page=${page}`;
  if (search.trim()) {
    endpoint += `&search=${encodeURIComponent(search.trim())}`;
  }

  const res = await apiFetch(endpoint, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) {
    throw new Error('Failed to fetch public societies');
  }
  const data = await res.json();
  return {
    data: data.data.map(serializeDiscoveredGroup),
    current_page: data.current_page,
    last_page: data.last_page,
    total: data.total,
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

// Real backend call. Note: this backend's groups have concepts asusu's mock
// SocietyProps doesn't (a pending-registration-fee gate, forming/active
// lifecycle) and asusu has concepts this backend doesn't (co-founder,
// public/private visibility, verification) — the mapping below is best-effort;
// see asusu/BACKEND_INTEGRATION.md for the exact list of what's real vs mock.
export async function getSociety(id: string): Promise<SocietyProps> {
  const res = await apiFetch(`/groups/${id}`, { method: 'GET', cache: 'no-store' }, true);

  if (!res.ok) {
    throw new Error('Failed to fetch society');
  }
  const group = await res.json();

  if (group.membershipStatus === 'pending') {
    // This backend gates monthly contributions behind a one-time registration
    // fee that asusu's UI has no concept of yet — surfaced here as best-effort
    // placeholders rather than crashing the page.
    return {
      id: group.id,
      name: group.name,
      avatar_url: '',
      description: group.description || '',
      is_public: false,
      verified: false,
      created_at: new Date().toISOString(),
      total_members: 0,
      total_contributions: 0,
      member_count: 0,
      can_join: false,
      can_manage: false,
      founder: { id: 0, name: 'Unknown' },
      co_founder: null,
      settings: {
        contribution_amount: Number(group.monthlyAmount),
        frequency: 'monthly',
        payout_cycle: 'fixed',
        late_fee: 0,
      },
    };
  }

  return {
    id: group.id,
    name: group.name,
    avatar_url: '',
    description: group.description || '',
    is_public: false,
    verified: false,
    created_at: group.createdAt,
    total_members: group.members?.length || 0,
    total_contributions: Number(group.totalCollected || 0),
    member_count: group.members?.length || 0,
    can_join: false,
    can_manage: group.myRole === 'admin',
    isFounder: group.myRole === 'admin',
    isCoFounder: false,
    isExecutive: false,
    founder: {
      id: group.creator?.id ?? 0,
      name: group.creator?.name ?? 'Unknown',
      avatar_url: null,
    },
    co_founder: null,
    settings: {
      contribution_amount: Number(group.monthlyAmount),
      frequency: 'monthly',
      payout_cycle: 'fixed',
      late_fee: 0,
    },
    active_members: (group.members || []).map((m: any) => ({
      id: m.userId,
      name: m.name,
      avatar_url: null,
    })),
  };
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

  const society = (await getSociety(id)) || MOCK_SOCIETIES[0];
  const userId = user?.id ? Number(user.id) : undefined;
  const isFounder = society.founder?.id === userId;
  const isCoFounder = society.co_founder?.id === userId;
  const isExecutive = false;

  return {
    society: {
      ...society,
      current_user_id: userId,
      isFounder,
      isCoFounder,
      isExecutive,
      can_manage: isFounder || isCoFounder || isExecutive,
    },
    members: MOCK_MEMBERS,
  };
}

export async function getSocietyLedger(id: string) {
  const [society, res] = await Promise.all([
    getSociety(id),
    apiFetch(`/groups/${id}/ledger`, { method: 'GET', cache: 'no-store' }, true),
  ]);

  if (!res.ok) throw new Error('Failed to fetch ledger');
  const data = await res.json();

  return {
    society,
    ledger: data.ledger,
    summary: data.summary,
  };
}

// Intentionally still mock: this backend has no rotating-payout concept at
// all. Contributions fund a pooled treasury bill investment (5% of each
// monthly contribution), not a rotating "whose turn is it" payout — building
// a real rotation queue would mean inventing a different product mechanic,
// not just wiring an endpoint. See asusu/BACKEND_INTEGRATION.md.
export async function getSocietyRotationQueue(id: string) {
  const user = await getCurrentUser();

  /* ORIGINAL BACKEND CALL:
  const res = await apiFetch(
    `/societies/${id}/rotation`,
    {
      method: 'GET',
      next: { revalidate: 60 },
    },
    true
  );

  if (!res.ok) throw new Error('Failed to fetch rotation queue');
  const data = await res.json();

  const isFounder = data.society.founder?.id === user?.id;
  const isCoFounder = data.society.co_founder?.id === user?.id;

  const canManage = isFounder || isCoFounder;

  return {
    society: {
      ...data.society,
      current_user_id: user?.id,
      isFounder,
      isCoFounder,
      can_manage: canManage,
    },
    members: data.members,
    rotation: data.rotation,
  };
  */

  const society = await getSociety(id);
  const userId = user?.id ? Number(user.id) : undefined;
  const isFounder = society.founder?.id === userId;
  const isCoFounder = society.co_founder?.id === userId;

  const queue = MOCK_MEMBERS.map((m) => ({
    user_id: m.id,
    name: m.name,
    avatar_url: m.profile?.avatar_url || null,
  }));

  return {
    society: {
      ...society,
      current_user_id: userId,
      isFounder,
      isCoFounder,
      can_manage: isFounder || isCoFounder,
    },
    members: MOCK_MEMBERS,
    rotation: {
      queue,
      my_position: 1,
      next_up: queue[0] || null,
      cycle: society.settings?.frequency || 'monthly',
    },
  };
}

// Derived from real contribution history: one entry per past month (since
// this member's registration was activated) with no successful monthly
// contribution — only meaningful once the group admin sets a non-zero late
// fee in settings; otherwise this is honestly an empty list, not mock data.
export async function getMyPenalties(id: string) {
  const res = await apiFetch(`/groups/${id}/penalties`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) throw new Error('Failed to fetch penalties');
  return res.json();
}

// This backend has no per-day due date — "due" is the end of the current
// calendar month once the group has been started by its admin.
export async function getNextDueDate(id: string) {
  const res = await apiFetch(`/groups/${id}/next-due`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) throw new Error('Failed to fetch next due date');
  return res.json();
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
    is_public: false,
    verified: false,
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
  const res = await apiFetch(`/groups/${societyId}/documents`, { method: 'GET', cache: 'no-store' }, true);
  if (!res.ok) {
    throw new Error('Failed to load society documents');
  }
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
    is_public: false,
    verified: false,
    // asusu has no concept of the one-time registration fee this backend
    // gates monthly contributions behind — a "pending" membership just shows
    // as a normal member card here rather than the real payment-due state.
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
