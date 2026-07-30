// app/dashboard/societies/[id]/loans/page.tsx

import SocietyHeader from '@/components/society-header';
import RightAside from '@/components/right-aside';
import LoanRequestsPanel from '@/components/loan-requests-panel';
import { getSociety } from '@/app/actions/societies';
import { getMyLoanRequests, getGroupLoanRequests } from '@/app/actions/loans';
import { GatedAccessScreen } from '@/components/gated-access-screen';

export default async function SocietyLoansPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const society = await getSociety(id);
  if (!society || society.can_join) {
    return <GatedAccessScreen society={society} featureName="Loans" />;
  }

  const [myLoans, groupLoans] = await Promise.all([
    getMyLoanRequests(id),
    society.can_manage ? getGroupLoanRequests(id) : Promise.resolve([]),
  ]);

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />

      <div className='container max-w-7xl mx-auto px-6 py-6 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-7 xl:col-span-8 space-y-8'>
            <div className='rounded-lg border bg-muted/30 p-4'>
              <p className='text-sm text-muted-foreground'>Available to Borrow</p>
              <p className='text-2xl font-bold text-foreground'>
                ₦{(society.my_max_loan_amount ?? 0).toLocaleString()}
              </p>
              <p className='text-[11px] text-muted-foreground mt-1'>
                x{society.settings.loan_multiplier ?? 1} of your ₦
                {(society.my_total_contributed ?? 0).toLocaleString()} in total contributions
                (equity + monthly savings).
              </p>
            </div>

            <LoanRequestsPanel
              societyId={society.id.toString()}
              canManage={!!society.can_manage}
              maxLoanAmount={society.my_max_loan_amount ?? 0}
              initialMyLoans={myLoans}
              initialGroupLoans={groupLoans}
            />
          </div>

          <RightAside society={society} />
        </div>
      </div>
    </div>
  );
}
