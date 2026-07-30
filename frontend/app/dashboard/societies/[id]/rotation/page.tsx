// app/dashboard/societies/[id]/rotation/page.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconTrophy, IconClock, IconUserCheck, IconHistory } from '@tabler/icons-react';
import SocietyHeader from '@/components/society-header';
import RightAside from '@/components/right-aside';
import { RotationDistributeButton } from '@/components/rotation-distribute-button';
import { getSocietyRotationQueue } from '@/app/actions/societies';
import { SocietyProps } from '@/types';

interface QueueMember {
  user_id: number;
  name: string;
  avatar_url?: string | null;
  position?: number;
}

interface PayoutHistoryEntry {
  month: string;
  amount: number;
  user_id: number;
  name: string;
  distributed_at: string;
}

interface RotationData {
  queue: QueueMember[];
  my_position: number | null;
  next_up: QueueMember | null;
  cycle: string;
  started: boolean;
  history: PayoutHistoryEntry[];
}

interface PageData {
  society: SocietyProps;
  rotation: RotationData;
}

import { GatedAccessScreen } from '@/components/gated-access-screen';

export default async function SocietyRotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { society, rotation }: PageData = await getSocietyRotationQueue(id);

  if (!society || society.can_join) {
    return <GatedAccessScreen society={society} featureName="Rotation Queue Order" />;
  }

  const { queue, my_position, next_up, cycle, started, history } = rotation;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />

      <div className='container max-w-7xl mx-auto px-6 py-6 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-7 xl:col-span-8 space-y-8'>
            {!started ? (
              <Card>
                <CardContent className='py-12 text-center space-y-2'>
                  <p className='text-muted-foreground'>
                    This society hasn&apos;t started yet — the rotation order
                    is assigned once it starts (see Settings).
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
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
                        {my_position ? 'in the rotation' : 'Not an active member'}
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
                        member, per cycle
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Full Rotation Queue */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between gap-4'>
                    <div>
                      <CardTitle>Full Rotation Queue</CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Members receive this month&apos;s pooled contributions in this order
                      </p>
                    </div>
                    {society.can_manage && <RotationDistributeButton societyId={String(society.id)} />}
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
                        {queue.map((member) => {
                          const isNext = member.user_id === next_up?.user_id;
                          return (
                            <div
                              key={member.user_id}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                isNext ? 'bg-primary/5 border-primary' : 'bg-card'
                              }`}
                            >
                              <div className='flex items-center gap-4'>
                                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-muted font-semibold text-lg'>
                                  {member.position}
                                </div>
                                <Avatar className='h-12 w-12'>
                                  <AvatarImage src={member.avatar_url ?? undefined} />
                                  <AvatarFallback>
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='font-medium'>{member.name}</p>
                                  {isNext && (
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
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payout History */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <IconHistory className='h-5 w-5 text-primary' />
                      Payout History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history.length === 0 ? (
                      <p className='text-sm text-muted-foreground py-4 text-center'>
                        No payouts distributed yet.
                      </p>
                    ) : (
                      <div className='space-y-3'>
                        {history.map((entry) => (
                          <div
                            key={entry.month}
                            className='flex items-center justify-between p-3 rounded-lg border text-sm'
                          >
                            <div>
                              <p className='font-medium'>{entry.name}</p>
                              <p className='text-xs text-muted-foreground'>{entry.month}</p>
                            </div>
                            <p className='font-bold text-foreground'>
                              ₦{entry.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <RightAside society={society} />
        </div>
      </div>
    </div>
  );
}
