// app/societies/[id]/page.tsx
// This is now the "Overview" page only

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconUsers,
  IconCoin,
  IconRepeat,
  IconPaperclip,
  IconWorld,
  IconArrowUp,
  IconAt,
} from '@tabler/icons-react';
import { Textarea } from '@/components/ui/textarea';
import { getSociety } from '../../../actions/societies';
import { getSocietyInvestmentCycle } from '../../../actions/investment';
import { SocietyProps } from '@/types';
import RightAside from '@/components/right-aside';
import { notFound } from 'next/navigation';
import SocietyHeader from '@/components/society-header';
import { CommunityWealthWidget } from '@/components/community-wealth-widget';

export default async function SocietyOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const society: SocietyProps = await getSociety(id);

  if (!society) {
    notFound();
  }

  const cycle = await getSocietyInvestmentCycle(id);

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header */}
      <SocietyHeader society={society} />

      {/* Main Content - Overview only */}
      <div className='container max-w-7xl mx-auto px-6 py-8 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Main Left Column - ~60% */}
          <div className='lg:col-span-7 xl:col-span-8 space-y-8'>
            {/* Analytics Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Members
                  </CardTitle>
                  <IconUsers className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {society.total_members}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Active contributors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Contribution
                  </CardTitle>
                  <IconCoin className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    ₦{society.settings.contribution_amount.toLocaleString()}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Per {society.settings.frequency}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Payout Cycle
                  </CardTitle>
                  <IconRepeat className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold capitalize'>
                    {society.settings.payout_cycle}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Distribution method
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Community Wealth Widget */}
            <CommunityWealthWidget societyId={id} cycle={cycle} />

            {/* Forum / Discussion Input */}
            <div className='rounded-3xl border bg-muted/30 px-4 py-4 focus-within:border-primary/50 transition-colors'>
              <div className='flex flex-col items-start gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-full bg-muted/50 hover:bg-muted/70 px-3 py-1 flex items-center text-sm mb-1'
                >
                  <IconAt className='mr-1' /> Add context
                </Button>
                <Textarea
                  placeholder='Ask, or post anything...'
                  className='min-h-6 max-h-48 resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0'
                  rows={1}
                />
              </div>

              <div className='mt-4 flex items-center justify-between'>
                <div className='flex items-center gap-4 text-muted-foreground'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                  >
                    <IconPaperclip className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1'
                  >
                    <IconWorld className='h-4 w-4' />
                    <span className='text-xs'>All Sources</span>
                  </Button>
                </div>

                <Button
                  size='icon'
                  className='h-9 w-9 rounded-full bg-primary hover:bg-primary/90'
                >
                  <IconArrowUp className='h-5 w-5' />
                </Button>
              </div>
            </div>

            {/* Placeholder */}
            <div className='flex flex-col items-center justify-center text-center py-10 px-4 border rounded-xl bg-card/60 shadow-2xs space-y-3'>
              <Image
                src='/illustrations/undraw_social-media-post_tg7l.svg'
                alt='No discussions yet'
                width={200}
                height={150}
                className='h-32 w-auto mb-1'
              />
              <h4 className='font-bold text-foreground text-base'>No discussions yet</h4>
              <p className='text-xs text-muted-foreground max-w-sm leading-relaxed'>
                Be the first to start a conversation, share community updates, or post a question in this society!
              </p>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightAside society={society} />
        </div>
      </div>
    </div>
  );
}
