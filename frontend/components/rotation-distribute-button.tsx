'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { distributeRotationPayout } from '@/app/actions/societies';
import { toast } from 'sonner';

export function RotationDistributeButton({ societyId }: { societyId: string }) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Distribute this month's pooled contributions to whoever is next in the queue? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await distributeRotationPayout(societyId);
        toast.success('Payout distributed!', { description: result.message });
      } catch (err: any) {
        toast.error(err.message || 'Failed to distribute payout');
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={pending} className='cursor-pointer font-semibold'>
      {pending ? 'Distributing...' : 'Distribute This Month’s Payout'}
    </Button>
  );
}
