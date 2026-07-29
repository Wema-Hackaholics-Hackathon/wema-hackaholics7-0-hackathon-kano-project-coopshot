// app/dashboard/societies/[id]/rotation/page.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconTrophy, IconClock, IconUserCheck } from '@tabler/icons-react';
import SocietyHeader from '@/components/society-header';
import RightAside from '@/components/right-aside';
import { getSocietyRotationQueue } from '@/app/actions/societies';
import { SocietyProps } from '@/types';

interface QueueMember {
  user_id: number;
  name: string;
  avatar_url?: string | null;
}

interface RotationData {
  queue: QueueMember[];
  my_position: number | null;
  next_up: QueueMember | null;
  cycle: string;
}

interface PageData {
  society: SocietyProps;
  rotation: RotationData;
}

export default async function SocietyRotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { society, rotation }: PageData = await getSocietyRotationQueue(id);

  const { queue, my_position, next_up, cycle } = rotation;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />

      <div className='container max-w-7xl mx-auto px-6 py-6 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-7 xl:col-span-8 space-y-8'>
            {/* Current Status */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Next to Receive
                  </CardTitle>
                  <IconTrophy className='h-5 w-5 text-yellow-600' />
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={next_up?.avatar_url ?? undefined} />
                      <AvatarFallback>{next_up?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className='font-semibold'>{next_up?.name || '—'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Your Position
                  </CardTitle>
                  <IconUserCheck className='h-5 w-5 text-primary' />
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {my_position ? `#${my_position}` : 'Not in queue'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {my_position ? 'in the rotation' : 'Join to enter queue'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Payout Cycle
                  </CardTitle>
                  <IconClock className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold capitalize'>{cycle}</p>
                  <p className='text-xs text-muted-foreground'>
                    ₦{society.settings.contribution_amount.toLocaleString()} per
                    cycle
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Full Rotation Queue */}
            <Card>
              <CardHeader>
                <CardTitle>Full Rotation Queue</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Members receive payout in this order
                </p>
              </CardHeader>
              <CardContent>
                {queue.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-muted-foreground'>
                      No rotation queue set yet.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {queue.map((member, index) => (
                      <div
                        key={member.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index === 0
                            ? 'bg-primary/5 border-primary'
                            : 'bg-card'
                        }`}
                      >
                        <div className='flex items-center gap-4'>
                          <div className='flex items-center justify-center w-10 h-10 rounded-full bg-muted font-semibold text-lg'>
                            {index + 1}
                          </div>
                          <Avatar className='h-12 w-12'>
                            <AvatarImage src={member.avatar_url ?? undefined} />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium'>{member.name}</p>
                            {index === 0 && (
                              <Badge
                                variant='default'
                                className='mt-1'
                              >
                                Next payout
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <RightAside society={society} />
        </div>
      </div>
    </div>
  );
}
