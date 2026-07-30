'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconCash, IconCheck, IconX, IconLoader } from '@tabler/icons-react';
import { decideLoanRequest, LoanRequest } from '@/app/actions/loans';
import RequestLoanModal from './request-loan-modal';
import { toast } from 'sonner';

function statusBadge(status: LoanRequest['status']) {
  if (status === 'approved') return <Badge className='bg-emerald-600 hover:bg-emerald-600'>Approved</Badge>;
  if (status === 'rejected') return <Badge variant='destructive'>Rejected</Badge>;
  return <Badge variant='secondary'>Pending</Badge>;
}

interface LoanRequestsPanelProps {
  societyId: string;
  canManage: boolean;
  maxLoanAmount: number;
  initialMyLoans: LoanRequest[];
  initialGroupLoans: LoanRequest[];
}

export default function LoanRequestsPanel({
  societyId,
  canManage,
  maxLoanAmount,
  initialMyLoans,
  initialGroupLoans,
}: LoanRequestsPanelProps) {
  const [myLoans, setMyLoans] = useState(initialMyLoans);
  const [groupLoans, setGroupLoans] = useState(initialGroupLoans);
  const [decidingId, setDecidingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const hasPendingRequest = myLoans.some((l) => l.status === 'pending');

  const handleNewLoan = (loan: LoanRequest) => {
    setMyLoans([loan, ...myLoans]);
    if (canManage) setGroupLoans([loan, ...groupLoans]);
  };

  const handleDecision = (loanId: number, status: 'approved' | 'rejected') => {
    setDecidingId(loanId);
    startTransition(async () => {
      try {
        const updated = await decideLoanRequest(societyId, loanId, status);
        setGroupLoans(groupLoans.map((l) => (l.id === loanId ? updated : l)));
        setMyLoans(myLoans.map((l) => (l.id === loanId ? updated : l)));
        toast.success(`Loan request ${status}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to record decision';
        toast.error(msg);
      } finally {
        setDecidingId(null);
      }
    });
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <IconCash className='h-5 w-5 text-primary' />
              Loans
            </CardTitle>
            <CardDescription>
              Borrow against your contributions to this cooperative.
            </CardDescription>
          </div>
          <RequestLoanModal
            societyId={societyId}
            maxLoanAmount={maxLoanAmount}
            hasPendingRequest={hasPendingRequest}
            onSuccess={handleNewLoan}
          />
        </CardHeader>
        <CardContent>
          {myLoans.length === 0 ? (
            <p className='text-sm text-muted-foreground'>You haven&apos;t requested a loan yet.</p>
          ) : (
            <div className='space-y-3'>
              {myLoans.map((loan) => (
                <div
                  key={loan.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div>
                    <p className='font-semibold text-foreground'>₦{Number(loan.amount).toLocaleString()}</p>
                    <p className='text-xs text-muted-foreground'>
                      Requested {new Date(loan.createdAt).toLocaleDateString()}
                      {loan.decisionNote ? ` — ${loan.decisionNote}` : ''}
                    </p>
                  </div>
                  {statusBadge(loan.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconCash className='h-5 w-5 text-primary' />
              Loan Requests to Review
            </CardTitle>
            <CardDescription>
              Approve or reject member loan requests for this cooperative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupLoans.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No loan requests yet.</p>
            ) : (
              <div className='space-y-3'>
                {groupLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className='flex items-center justify-between rounded-lg border p-3 gap-3'
                  >
                    <div>
                      <p className='font-semibold text-foreground'>
                        ₦{Number(loan.amount).toLocaleString()}{' '}
                        <span className='font-normal text-muted-foreground'>
                          — {loan.requester?.name || `Member #${loan.userId}`}
                        </span>
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Eligible up to ₦{Number(loan.eligibleAmount).toLocaleString()} • Requested{' '}
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {loan.status === 'pending' ? (
                      <div className='flex items-center gap-2 shrink-0'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='cursor-pointer text-destructive hover:text-destructive'
                          disabled={pending && decidingId === loan.id}
                          onClick={() => handleDecision(loan.id, 'rejected')}
                        >
                          {pending && decidingId === loan.id ? (
                            <IconLoader className='h-4 w-4 animate-spin' />
                          ) : (
                            <IconX className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          size='sm'
                          className='cursor-pointer'
                          disabled={pending && decidingId === loan.id}
                          onClick={() => handleDecision(loan.id, 'approved')}
                        >
                          {pending && decidingId === loan.id ? (
                            <IconLoader className='h-4 w-4 animate-spin' />
                          ) : (
                            <IconCheck className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    ) : (
                      statusBadge(loan.status)
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
