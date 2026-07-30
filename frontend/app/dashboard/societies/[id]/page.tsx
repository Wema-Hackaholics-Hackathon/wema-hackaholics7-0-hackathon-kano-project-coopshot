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
  IconAlertCircle,
} from '@tabler/icons-react';
import { Textarea } from '@/components/ui/textarea';
import { getSociety } from '../../../actions/societies';
import { getSocietyInvestmentCycle } from '../../../actions/investment';
import { SocietyProps } from '@/types';
import RightAside from '@/components/right-aside';
import { notFound } from 'next/navigation';
import SocietyHeader from '@/components/society-header';
import { CommunityWealthWidget } from '@/components/community-wealth-widget';

import { JoinSocietyButton } from '@/components/join-society-button';
import { MakeContributionModal } from '@/components/make-contribution-modal';

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

  // Non-member Public Preview State with full financial & T-bill breakdown
  if (!society.is_member) {
    return (
      <div className='min-h-screen bg-background flex flex-col'>
        <SocietyHeader society={society} />
        <div className='container max-w-7xl mx-auto px-6 py-8 flex-1'>
          <div className='grid lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-7 xl:col-span-8 space-y-6'>
              {/* Highlight Cards Grid for Outsiders */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card className='p-5 space-y-2 border shadow-2xs'>
                  <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    <IconCoin className='h-4 w-4 text-emerald-600' />
                    <span>Monthly Contribution</span>
                  </div>
                  <div className='text-2xl font-bold text-foreground'>
                    ₦{society.settings.contribution_amount.toLocaleString()}
                  </div>
                  <p className='text-xs text-muted-foreground capitalize'>
                    Frequency: {society.settings.frequency} • Payout: {society.settings.payout_cycle}
                  </p>
                </Card>

                <Card className='p-5 space-y-2 border shadow-2xs'>
                  <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    <IconUsers className='h-4 w-4 text-blue-600' />
                    <span>Active Community</span>
                  </div>
                  <div className='text-2xl font-bold text-foreground'>
                    {society.total_members} Members
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Founded by {society.founder?.name || 'Admin'}
                  </p>
                </Card>
              </div>

              {/* T-Bill Investment Pooling Card */}
              <Card className='p-6 space-y-4 border bg-linear-to-r from-primary/5 via-background to-background shadow-2xs'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-2xl bg-primary/10 text-primary shrink-0'>
                    <IconWorld className='h-6 w-6' />
                  </div>
                  <div className='space-y-1'>
                    <h3 className='text-base font-bold text-foreground'>
                      5% Treasury Bill Investment Pooling
                    </h3>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      This cooperative automatically pools 5% of all monthly member contributions into high-yield Central Bank of Nigeria FGN Treasury Bills (yielding 18.50% - 20.50% p.a.). Earnings mature quarterly and distribute back to members.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Main Join CTA Banner */}
              <div className='flex flex-col items-center justify-center text-center py-10 px-6 border rounded-2xl bg-card/60 shadow-2xs space-y-5'>
                <Image
                  src='/illustrations/undraw_join_niai.svg'
                  alt='Join Society'
                  width={220}
                  height={160}
                  className='h-36 w-auto opacity-90'
                />
                <div className='space-y-2 max-w-lg'>
                  <h3 className='text-xl font-bold tracking-tight text-foreground'>
                    {society.can_join ? `Ready to join ${society.name}?` : society.name}
                  </h3>
                  <p className='text-xs text-muted-foreground leading-relaxed max-w-md mx-auto'>
                    {society.can_join
                      ? 'Click below to review cooperative terms, contribution schedules, and confirm your membership.'
                      : 'This cooperative has already launched its active savings cycle and is currently closed to new members.'}
                  </p>
                </div>
                {society.can_join && (
                  <div className='pt-1'>
                    <JoinSocietyButton society={society} className='px-8 py-2.5 text-base font-semibold' />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <RightAside society={society} />
          </div>
        </div>
      </div>
    );
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
            {society.is_pending_registration && (
              <div className='p-5 rounded-2xl border border-amber-300 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5'>
                    <IconAlertCircle className='h-5 w-5' />
                  </div>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-bold text-foreground'>
                      Complete Registration Fee Payment
                    </h3>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Your membership in <strong>{society.name}</strong> is currently pending. Please pay the one-time registration fee of <strong>₦{(society.settings.registration_fee || 0).toLocaleString()}</strong> to activate your full membership.
                    </p>
                  </div>
                </div>
                <MakeContributionModal
                  society={society}
                  mode='registration'
                  trigger={
                    <Button size='sm' className='font-semibold px-5 shrink-0 cursor-pointer shadow-2xs'>
                      Pay Registration Fee (₦{(society.settings.registration_fee || 0).toLocaleString()})
                    </Button>
                  }
                />
              </div>
            )}

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
