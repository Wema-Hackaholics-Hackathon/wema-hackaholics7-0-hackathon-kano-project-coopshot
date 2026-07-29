import { Suspense } from 'react';
import { getMyActiveSocieties } from '@/app/actions/societies';
import { QuickCreateSociety } from '@/components/quick-create-society';
import { MySocietiesView } from '@/components/my-societies-view';
import { SkeletonCards } from '@/components/skeleton-cards';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconUsers } from '@tabler/icons-react';

async function SocietiesContent() {
  const { active_societies } = await getMyActiveSocieties();

  if (active_societies.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border p-8 shadow-xs'>
        <div className='rounded-full bg-primary/10 p-6 mb-4 text-primary'>
          <IconUsers className='h-12 w-12' />
        </div>
        <h2 className='text-2xl font-bold mb-2 tracking-tight'>No societies yet</h2>
        <p className='text-muted-foreground mb-6 max-w-md text-sm leading-relaxed'>
          Join or create a society to start saving together with friends,
          family, or colleagues.
        </p>
        <QuickCreateSociety from='sidebar' />
      </div>
    );
  }

  return <MySocietiesView societies={active_societies} />;
}

export default function SocietiesPage() {
  return (
    <div className='p-6 md:p-8 space-y-6'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
            My Societies
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage, track, and participate in your active rotating savings groups.
          </p>
        </div>

        <QuickCreateSociety from='page' />
      </div>

      <Suspense
        fallback={
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className='p-4 space-y-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-12 w-12 rounded-lg' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                  </div>
                </div>
                <Skeleton className='h-20 w-full rounded-lg' />
                <Skeleton className='h-9 w-full rounded-lg' />
              </Card>
            ))}
          </div>
        }
      >
        <SocietiesContent />
      </Suspense>
    </div>
  );
}
