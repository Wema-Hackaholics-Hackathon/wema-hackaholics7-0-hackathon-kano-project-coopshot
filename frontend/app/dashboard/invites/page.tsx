import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPendingInvites } from '@/app/actions/societies';
import InviteCardsList from '@/components/invite-cards-list';
import { QuickCreateSociety } from '@/components/quick-create-society';

async function InvitesListServer() {
  const { pending_invites } = await getPendingInvites();
  return <InviteCardsList invites={pending_invites} />;
}

export default function InvitesPage() {
  return (
    <div className='p-6 md:p-8 space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
            Pending Invites
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Review and manage invitations to join savings societies or co-found new groups.
          </p>
        </div>

        <QuickCreateSociety from='page' />
      </div>

      <Suspense
        fallback={
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className='p-4 space-y-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-11 w-11 rounded-full' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                  </div>
                </div>
                <Skeleton className='h-16 w-full rounded-lg' />
                <div className='flex gap-2 pt-2'>
                  <Skeleton className='h-9 flex-1 rounded-lg' />
                  <Skeleton className='h-9 flex-1 rounded-lg' />
                </div>
              </Card>
            ))}
          </div>
        }
      >
        <InvitesListServer />
      </Suspense>
    </div>
  );
}
