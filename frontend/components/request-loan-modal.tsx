'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconCash, IconLoader } from '@tabler/icons-react';
import { requestLoan, LoanRequest } from '@/app/actions/loans';
import { toast } from 'sonner';

interface RequestLoanModalProps {
  societyId: string;
  maxLoanAmount: number;
  hasPendingRequest?: boolean;
  onSuccess?: (loan: LoanRequest) => void;
  trigger?: ReactNode;
}

export default function RequestLoanModal({
  societyId,
  maxLoanAmount,
  hasPendingRequest = false,
  onSuccess,
  trigger,
}: RequestLoanModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [pending, startTransition] = useTransition();

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= maxLoanAmount;

  const handleSubmit = () => {
    if (!isValid) return;

    startTransition(async () => {
      try {
        const loan = await requestLoan(societyId, parsedAmount);
        toast.success('Loan request submitted!', {
          description: 'A cooperative executive will review your request.',
        });
        onSuccess?.(loan);
        setAmount('');
        setOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to submit loan request';
        toast.error(msg);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className='cursor-pointer font-semibold'
            disabled={hasPendingRequest || maxLoanAmount <= 0}
          >
            <IconCash className='mr-2 h-4 w-4' />
            {hasPendingRequest ? 'Loan Request Pending' : 'Request Loan'}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Request a Loan</DialogTitle>
          <DialogDescription>
            Borrow against your contributions to this cooperative.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='rounded-lg border bg-muted/30 p-4'>
            <p className='text-sm text-muted-foreground'>Available to Borrow</p>
            <p className='text-2xl font-bold text-foreground'>
              ₦{maxLoanAmount.toLocaleString()}
            </p>
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='loan-amount' className='text-xs font-medium'>
              Amount to Request (₦)
            </Label>
            <Input
              id='loan-amount'
              type='number'
              placeholder='0.00'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min='1'
              max={maxLoanAmount}
              disabled={pending}
            />
            {amount !== '' && !isValid && (
              <p className='text-[11px] text-destructive'>
                {parsedAmount > maxLoanAmount
                  ? `Amount cannot exceed your ₦${maxLoanAmount.toLocaleString()} eligibility`
                  : 'Enter a valid amount greater than 0'}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || pending} className='cursor-pointer'>
            {pending ? (
              <>
                <IconLoader className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
