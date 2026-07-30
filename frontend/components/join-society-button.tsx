'use client';

import { JoinSocietyModal } from './join-society-modal';
import { SocietyProps } from '@/types';

interface JoinSocietyButtonProps {
  societyId?: string;
  society?: SocietyProps;
  className?: string;
}

export function JoinSocietyButton({ societyId, society, className }: JoinSocietyButtonProps) {
  const targetSociety: SocietyProps = society || {
    id: Number(societyId || 0),
    name: 'Cooperative Society',
    avatar_url: '',
    description: '',
    is_public: true,
    verified: false,
    created_at: new Date().toISOString(),
    total_members: 1,
    total_contributions: 0,
    member_count: 1,
    founder: { id: 0, name: 'Founder' },
    settings: {
      contribution_amount: 100000,
      frequency: 'monthly',
      payout_cycle: 'fixed',
      late_fee: 1000,
    },
  };

  return <JoinSocietyModal society={targetSociety} className={className} />;
}
