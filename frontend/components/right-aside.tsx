'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconCalendar,
  IconFlag,
  IconShare2,
  IconIdBadge2,
  IconEye,
  IconSettings,
  IconCoin,
  IconInfoCircle,
  IconCash,
} from '@tabler/icons-react';
import { SocietyProps } from '@/types';
import { MakeContributionModal } from './make-contribution-modal';
import { JoinSocietyButton } from './join-society-button';
import RequestLoanModal from './request-loan-modal';
import { toast } from 'sonner';

const RightAside: React.FC<{ society: SocietyProps }> = ({ society }) => {
  const isMember = society.is_member;

  return (
    <>
      {/* Right Sidebar - ~40% */}
      <aside className='lg:col-span-5 xl:col-span-4'>
        <div className='space-y-6 sticky top-28'>
          {/* Primary Actions Card */}
          <Card className='shadow-xs'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base font-bold flex items-center justify-between'>
                <span>Cooperative Actions</span>
                <Badge variant='outline' className='text-[10px] uppercase font-normal tracking-wider'>
                  {society.settings?.frequency || 'Monthly'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {society.can_join ? (
                <JoinSocietyButton society={society} className='w-full text-base py-3' />
              ) : isMember ? (
                society.is_pending_registration ? (
                  <MakeContributionModal
                    society={society}
                    mode='registration'
                    trigger={
                      <Button className='w-full cursor-pointer font-semibold shadow-xs' size='lg'>
                        Pay Registration Fee (₦{(society.settings?.registration_fee || 0).toLocaleString()})
                      </Button>
                    }
                  />
                ) : society.is_pending_equity ? (
                  <MakeContributionModal
                    society={society}
                    mode='equity'
                    trigger={
                      <Button className='w-full cursor-pointer font-semibold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white' size='lg'>
                        Pay Member Equity (₦{(society.settings?.equity_amount || 25000).toLocaleString()})
                      </Button>
                    }
                  />
                ) : (
                  <MakeContributionModal society={society} />
                )
              ) : (
                <Badge variant='outline' className='w-full justify-center py-2 text-xs text-muted-foreground font-semibold'>
                  Closed to New Members
                </Badge>
              )}

              {isMember &&
                !society.is_pending_registration &&
                !society.is_pending_equity &&
                (society.my_max_loan_amount ?? 0) > 0 && (
                  <RequestLoanModal
                    societyId={society.id.toString()}
                    maxLoanAmount={society.my_max_loan_amount ?? 0}
                    trigger={
                      <Button variant='outline' className='w-full cursor-pointer font-semibold' size='lg'>
                        <IconCash className='mr-2 h-4 w-4' />
                        Request Loan
                      </Button>
                    }
                  />
                )}

              {/* Quick Financial Summary */}
              <div className='rounded-xl border bg-muted/30 p-3 space-y-2 text-xs'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <IconCoin className='h-3.5 w-3.5 text-emerald-600' /> Monthly Contribution
                  </span>
                  <span className='font-bold text-foreground'>
                    ₦{(society.settings?.contribution_amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between items-center pt-1 border-t border-border/50'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <IconInfoCircle className='h-3.5 w-3.5 text-primary' /> Registration Fee
                  </span>
                  <span className='font-semibold text-foreground'>
                    {society.settings?.registration_fee
                      ? `₦${society.settings.registration_fee.toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>
                <div className='flex justify-between items-center pt-1 border-t border-border/50'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <IconIdBadge2 className='h-3.5 w-3.5 text-blue-600' /> One-Time Member Equity
                  </span>
                  <span className='font-semibold text-foreground'>
                    ₦{(society.settings?.equity_amount || 25000).toLocaleString()}
                  </span>
                </div>
              </div>

              {society.can_manage && (
                <Button
                  asChild
                  variant='outline'
                  className='w-full cursor-pointer font-semibold'
                  size='lg'
                >
                  <Link href={`/dashboard/societies/${society.id}/settings`}>
                    <IconSettings className='mr-2 h-4 w-4 text-primary' />
                    Manage Society
                  </Link>
                </Button>
              )}

              <div className='pt-3 border-t flex gap-3 justify-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Society link copied to clipboard!');
                    }
                  }}
                  className='cursor-pointer flex-1 text-xs'
                >
                  <IconShare2 className='mr-1.5 h-4 w-4 text-primary' />
                  Share Link
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    toast.info('Society reported to platform administrators for review.');
                  }}
                  className='cursor-pointer flex-1 text-xs text-muted-foreground'
                >
                  <IconFlag className='mr-1.5 h-4 w-4' />
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About & Description */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <p className='text-muted-foreground leading-relaxed'>
                {society.description
                  ? society.description
                  : 'A thriving community built on trust, contribution, and shared prosperity.'}
              </p>
              <div className='flex items-center gap-2'>
                <IconEye className='h-4 w-4 text-muted-foreground' />
                <span>{society.is_public ? 'Public' : 'Private'} society</span>
              </div>
              <div className='flex items-center gap-2'>
                <IconIdBadge2 className='h-4 w-4 text-muted-foreground' />
                <span>
                  {society.verified ? 'Verified' : 'Pending verification'}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <IconCalendar className='h-4 w-4 text-muted-foreground' />
                <span>
                  Founded{' '}
                  {new Date(society.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Leadership */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Leadership</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Founder */}
              <div className='flex items-center gap-4'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={society.founder?.avatar_url ?? undefined}
                    alt={society.founder?.name}
                  />
                  <AvatarFallback className='bg-primary/10 text-primary text-lg font-medium'>
                    {society.founder?.name?.charAt(0).toUpperCase() || 'F'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{society.founder?.name || 'Founder'}</p>
                  <p className='text-sm text-muted-foreground'>Founder</p>
                </div>
              </div>

              {/* Co-founder */}
              {society.co_founder && (
                <div className='flex items-center gap-4'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={society.co_founder?.avatar_url ?? undefined}
                      alt={society.co_founder?.name}
                    />
                    <AvatarFallback className='bg-primary/10 text-primary text-lg font-medium'>
                      {society.co_founder?.name?.charAt(0).toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{society.co_founder?.name}</p>
                    <p className='text-sm text-muted-foreground'>Co-founder</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Members Card */}
          {(society.total_members > 0 || (society.active_members && society.active_members.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Active Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center -space-x-4'>
                  {((society.active_members && society.active_members.length > 0)
                    ? society.active_members
                    : Array.from({ length: Math.min(society.total_members || 1, 4) }, (_, i) => ({
                        id: i + 1,
                        name: i === 0 ? (society.founder?.name || 'Member') : `Member ${i + 1}`,
                        avatar_url: null,
                      }))
                  ).slice(0, 5).map((member) => (
                    <Avatar
                      key={member.id}
                      className='h-12 w-12 border-4 border-background hover:z-10 transition-all hover:scale-110'
                    >
                      <AvatarImage
                        src={member.avatar_url ?? undefined}
                        alt={member.name}
                      />
                      <AvatarFallback className='bg-primary/10 text-primary text-base font-bold'>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {society.total_members > 5 && (
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium border-4 border-background'>
                      +{society.total_members - 5}
                    </div>
                  )}
                </div>
                <p className='mt-4 text-sm text-muted-foreground'>
                  {society.total_members} active contributor
                  {society.total_members !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </aside>
    </>
  );
};

export default RightAside;
