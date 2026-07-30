// components/society-header.tsx (or wherever it lives)
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconCalendar,
  IconCurrencyDollar,
  IconIdBadge2,
  IconUsers,
  IconCode,
  IconGitBranch,
  IconCash,
  IconRefresh,
  IconAlertCircle,
  IconChevronRight,
  IconSettings,
  IconBuildingBank,
  IconLock,
  IconInfoCircle,
} from '@tabler/icons-react';
import { SocietyProps } from '@/types';
import { JoinSocietyButton } from './join-society-button';

const SocietyHeader: React.FC<{ society: SocietyProps }> = ({ society }) => {
  const pathname = usePathname();
  const id = society.id;

  const foundedDate = new Date(society.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const isActive = (path: string) => pathname === path;
  const isNonMember = !society.is_member;

  return (
    <div className='flex flex-col space-y-4'>
      <div className='border-b bg-background'>
        <div className='container max-w-7xl mx-auto px-6 py-8 overflow-hidden'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full'>
            <div className='flex items-start gap-4 sm:gap-6 flex-1 min-w-0 w-full'>
              <Avatar className='h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg shrink-0'>
                <AvatarImage
                  src={society.avatar_url || undefined}
                  alt={society.name}
                />
                <AvatarFallback className='text-3xl sm:text-4xl font-bold bg-primary text-primary-foreground'>
                  {society.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0 space-y-2'>
                <div className='space-y-1.5'>
                  <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground wrap-break-word max-w-full'>
                    {society.name}
                  </h1>
                  <div className='flex items-center gap-2 shrink-0 flex-wrap pt-0.5'>
                    {society.verified ? (
                      <Badge
                        variant='default'
                        className='flex items-center gap-1 text-xs'
                      >
                        <IconIdBadge2 className='h-3 w-3' />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='text-xs'>Forming</Badge>
                    )}
                    <Badge variant={society.is_public ? 'outline' : 'secondary'} className='text-xs'>
                      {society.is_public ? 'Public' : 'Private'}
                    </Badge>
                    {society.is_pending_registration && (
                      <Badge variant='outline' className='text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 font-semibold'>
                        Pending Registration Fee
                      </Badge>
                    )}
                    {society.is_pending_equity && (
                      <Badge variant='outline' className='text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 font-semibold'>
                        Pending Member Equity Share
                      </Badge>
                    )}
                    {isNonMember && !society.can_join && (
                      <Badge variant='secondary' className='text-xs bg-muted text-muted-foreground font-medium'>
                        Closed to New Members
                      </Badge>
                    )}
                  </div>
                </div>

                <p className='text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed wrap-break-word'>
                  {society.description ||
                    'A thriving community built on trust, contribution, and shared prosperity.'}
                </p>

                <div className='pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <IconUsers className='h-4 w-4 min-w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {society.total_members} members
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IconCurrencyDollar className='h-4 w-4 min-w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      ₦{society.settings.contribution_amount.toLocaleString()}{' '}
                      {society.settings.frequency}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IconCalendar className='h-4 w-4 min-w-4 text-muted-foreground' />
                    <span>Founded {foundedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Society Action for Non-Members */}
            {isNonMember && society.can_join && (
              <div className='shrink-0 self-start md:self-center w-full md:w-auto pt-2 md:pt-0'>
                <JoinSocietyButton societyId={id.toString()} className='w-full md:w-auto px-6 py-2.5 text-sm' />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-30 w-full overflow-hidden'>
          <div className='container max-w-7xl mx-auto px-6'>
            <div className='overflow-x-auto overflow-y-hidden scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center h-14'>
              <nav className='flex items-center gap-6 sm:gap-8 min-w-max h-14'>
                <Link
                  href={`/dashboard/societies/${id}`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconCode className='h-4 w-4 min-w-4' />
                  <span>Overview</span>
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/members`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/members`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconUsers className='h-4 w-4 min-w-4' />
                  <span>Members</span>
                  {isNonMember && <IconLock className='h-3.5 w-3.5 text-amber-500' />}
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/ledger`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/ledger`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconGitBranch className='h-4 w-4 min-w-4' />
                  <span>Ledger</span>
                  {isNonMember && <IconLock className='h-3.5 w-3.5 text-amber-500' />}
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/rotation`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/rotation`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconRefresh className='h-4 w-4 min-w-4' />
                  <span>Rotation Queue</span>
                  {isNonMember && <IconLock className='h-3.5 w-3.5 text-amber-500' />}
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/loans`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/loans`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconCash className='h-4 w-4 min-w-4' />
                  <span>Loans</span>
                  {isNonMember && <IconLock className='h-3.5 w-3.5 text-amber-500' />}
                </Link>

                {/* Community Wealth Tab */}
                <Link
                  href={`/dashboard/societies/${id}/wealth`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/wealth`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconBuildingBank className='h-4 w-4 min-w-4' />
                  <span>Community Wealth</span>
                  {isNonMember && <IconLock className='h-3.5 w-3.5 text-amber-500' />}
                </Link>

                {/* Settings / Info Tab */}
                <Link
                  href={`/dashboard/societies/${id}/settings`}
                  className={`flex items-center gap-2 h-14 border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/settings`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {society.can_manage ? (
                    <>
                      <IconSettings className='h-4 w-4 min-w-4' />
                      <span>Settings</span>
                    </>
                  ) : (
                    <>
                      <IconInfoCircle className='h-4 w-4 min-w-4' />
                      <span>Info</span>
                    </>
                  )}
                  {isNonMember && <IconLock className='h-3.5 w-3.5 text-amber-500' />}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Unverified Alert — Links to Settings */}
      {!society.verified && society.can_manage && (
        <div className='container max-w-7xl mx-auto px-6 pt-4'>
          <Link href={`/dashboard/societies/${id}/settings`}>
            <Alert className='border border-amber-300/80 dark:border-amber-800/70 border-l-4 border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/40 py-3.5 px-5 rounded-xl flex items-center justify-between hover:bg-amber-100/70 dark:hover:bg-amber-900/50 transition-all shadow-2xs cursor-pointer'>
              <div className='flex items-center gap-3'>
                <IconAlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0' />
                <AlertDescription className='text-foreground font-medium text-sm'>
                  This society hasn&apos;t started yet — monthly contributions
                  won&apos;t open until you start it. Go to Settings?
                </AlertDescription>
              </div>
              <IconChevronRight className='h-5 w-5 text-muted-foreground' />
            </Alert>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SocietyHeader;
