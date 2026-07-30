'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconUserPlus,
  IconLoader,
  IconCheck,
  IconCurrencyDollar,
  IconBuildingBank,
  IconAlertCircle,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react';
import { joinPublicSociety } from '@/app/actions/societies';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SocietyProps } from '@/types';

interface JoinSocietyModalProps {
  society: SocietyProps;
  trigger?: React.ReactNode;
  className?: string;
}

export function JoinSocietyModal({ society, trigger, className }: JoinSocietyModalProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [joined, setJoined] = useState(false);
  const router = useRouter();

  const handleJoin = () => {
    startTransition(async () => {
      try {
        await joinPublicSociety(society.id.toString());
        setJoined(true);
        toast.success(`Successfully joined ${society.name}!`);
        setOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'Failed to join society');
      }
    });
  };

  if (joined) {
    return (
      <Button disabled variant='outline' className={className}>
        <IconCheck className='mr-2 h-4 w-4 text-emerald-600' />
        Joined
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={`font-semibold cursor-pointer shadow-xs ${className}`}>
            <IconUserPlus className='mr-2 h-4 w-4' />
            Join Society
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 rounded-full bg-primary/10 text-primary shrink-0'>
              <IconUserPlus className='h-6 w-6' />
            </div>
            <div>
              <DialogTitle className='text-xl font-bold'>
                Join {society.name}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Review cooperative terms and financial commitments before joining.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4 py-2 text-sm'>
          {/* Key Financial Terms Grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='p-3.5 rounded-xl border bg-muted/30 space-y-1'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <IconCurrencyDollar className='h-4 w-4 text-emerald-600' />
                <span>Monthly Payout & Contribution</span>
              </div>
              <p className='text-lg font-bold text-foreground'>
                ₦{society.settings.contribution_amount.toLocaleString()}
              </p>
              <p className='text-[11px] text-muted-foreground capitalize'>
                Frequency: {society.settings.frequency}
              </p>
            </div>

            <div className='p-3.5 rounded-xl border bg-muted/30 space-y-1'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <IconBuildingBank className='h-4 w-4 text-blue-600' />
                <span>T-Bill Investment Strategy</span>
              </div>
              <p className='text-lg font-bold text-foreground'>
                5% Allocation
              </p>
              <p className='text-[11px] text-muted-foreground'>
                FGN Treasury Bills (18.5% p.a.)
              </p>
            </div>
          </div>

          {/* Details Breakdown List */}
          <div className='rounded-xl border p-4 space-y-3 bg-card'>
            <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Cooperative Information
            </h4>

            <div className='space-y-2.5 text-xs'>
              <div className='flex justify-between items-center py-1 border-b border-border/50'>
                <span className='text-muted-foreground flex items-center gap-1.5'>
                  <IconBuildingBank className='h-3.5 w-3.5 text-primary' /> One-Time Member Equity (Share Capital)
                </span>
                <span className='font-semibold text-foreground'>
                  ₦{(society.settings.equity_amount || 25000).toLocaleString()}
                </span>
              </div>

              <div className='flex justify-between items-center py-1 border-b border-border/50'>
                <span className='text-muted-foreground flex items-center gap-1.5'>
                  <IconUsers className='h-3.5 w-3.5' /> Total Active Members
                </span>
                <span className='font-semibold text-foreground'>
                  {society.total_members} members
                </span>
              </div>

              <div className='flex justify-between items-center py-1 border-b border-border/50'>
                <span className='text-muted-foreground flex items-center gap-1.5'>
                  <IconShieldCheck className='h-3.5 w-3.5' /> Verification & Visibility
                </span>
                <div className='flex gap-1.5'>
                  <Badge variant='outline' className='text-[10px] py-0 px-1.5'>
                    {society.is_public ? 'Public' : 'Private'}
                  </Badge>
                  {society.verified && (
                    <Badge variant='default' className='text-[10px] py-0 px-1.5'>
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className='flex justify-between items-center py-1'>
                <span className='text-muted-foreground flex items-center gap-1.5'>
                  <IconAlertCircle className='h-3.5 w-3.5 text-amber-500' /> Late Contribution Penalty
                </span>
                <span className='font-semibold text-foreground'>
                  {society.settings.late_fee
                    ? `₦${society.settings.late_fee.toLocaleString()}`
                    : 'Standard Discipline Policy'}
                </span>
              </div>
            </div>
          </div>

          {/* Notice Alert */}
          <div className='p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2.5'>
            <IconAlertCircle className='h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
            <span>
              By joining, you agree to fulfill monthly contributions of <strong>₦{society.settings.contribution_amount.toLocaleString()}</strong> on time to maintain your financial reputation and trust score.
            </span>
          </div>
        </div>

        <DialogFooter className='gap-2 pt-2'>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={pending}
            className='font-semibold cursor-pointer'
          >
            {pending ? (
              <>
                <IconLoader className='mr-2 h-4 w-4 animate-spin' />
                Confirming...
              </>
            ) : (
              <>
                <IconCheck className='mr-2 h-4 w-4' />
                Confirm & Join Society
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
