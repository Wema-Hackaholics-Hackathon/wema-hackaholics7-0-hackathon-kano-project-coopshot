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
  IconHistory,
  IconGitBranch,
  IconRefresh,
  IconAlertCircle,
  IconChevronRight,
  IconSettings,
  IconBuildingBank,
} from '@tabler/icons-react';
import { SocietyProps } from '@/types';

const SocietyHeader: React.FC<{ society: SocietyProps }> = ({ society }) => {
  const pathname = usePathname();
  const id = society.id;

  const foundedDate = new Date(society.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const isActive = (path: string) => pathname === path;

  return (
    <div className='flex flex-col space-y-4'>
      <div className='border-b bg-background'>
        <div className='container max-w-7xl mx-auto px-6 py-8'>
          <div className='flex items-start gap-6'>
            <Avatar className='h-24 w-24 border-4 border-background shadow-lg shrink-0'>
              <AvatarImage
                src={society.avatar_url || undefined}
                alt={society.name}
              />
              <AvatarFallback className='text-5xl font-bold bg-primary text-primary-foreground'>
                {society.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-3 flex-wrap'>
                <h1 className='text-3xl font-bold tracking-tight'>
                  {society.name}
                </h1>
                {society.verified ? (
                  <Badge
                    variant='default'
                    className='flex items-center gap-1'
                  >
                    <IconIdBadge2 className='h-3 w-3' />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant='secondary'>Unverified</Badge>
                )}
                <Badge variant={society.is_public ? 'outline' : 'secondary'}>
                  {society.is_public ? 'Public' : 'Private'}
                </Badge>
              </div>

              <p className='mt-3 text-muted-foreground max-w-3xl'>
                {society.description ||
                  'A thriving community built on trust, contribution, and shared prosperity.'}
              </p>

              <div className='mt-6 flex flex-wrap items-center gap-6 text-sm'>
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
        </div>

        {/* Navigation Tabs — Now with Settings */}
        <div className='border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-30'>
          <ScrollArea className='w-full'>
            <div className='container max-w-7xl mx-auto px-6'>
              <nav className='flex h-12 items-center gap-8'>
                <Link
                  href={`/dashboard/societies/${id}`}
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
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
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/members`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconUsers className='h-4 w-4 min-w-4' />
                  <span>Members</span>
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/activity`}
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/activity`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconHistory className='h-4 w-4 min-w-4' />
                  <span>Activity</span>
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/ledger`}
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/ledger`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconGitBranch className='h-4 w-4 min-w-4' />
                  <span>Ledger</span>
                </Link>

                <Link
                  href={`/dashboard/societies/${id}/rotation`}
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/rotation`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconRefresh className='h-4 w-4 min-w-4' />
                  <span>Rotation Queue</span>
                </Link>

                {/* Community Wealth Tab */}
                <Link
                  href={`/dashboard/societies/${id}/wealth`}
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/wealth`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconBuildingBank className='h-4 w-4 min-w-4' />
                  <span>Community Wealth</span>
                </Link>

                {/* Settings Tab */}
                <Link
                  href={`/dashboard/societies/${id}/settings`}
                  className={`flex items-center gap-2 h-full border-b-2 text-sm min-w-max transition-colors ${
                    isActive(`/dashboard/societies/${id}/settings`)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconSettings className='h-4 w-4 min-w-4' />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </div>

      {/* Unverified Alert — Links to Settings */}
      <div className='px-6'>
        {!society.verified && society.can_manage && (
          <Link href={`/dashboard/societies/${id}/settings`}>
            <Alert className='border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 py-4 px-5 rounded-lg flex items-center justify-between hover:bg-amber-50/80 dark:hover:bg-amber-950/50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <IconAlertCircle className='h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0' />
                <AlertDescription className='text-foreground font-medium'>
                  Your society is not verified yet. Would you like to verify it
                  now?
                </AlertDescription>
              </div>
              <IconChevronRight className='h-5 w-5 text-muted-foreground' />
            </Alert>
          </Link>
        )}
      </div>
    </div>
  );
};

export default SocietyHeader;
