import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconCalendar,
  IconFlag,
  IconShare2,
  IconIdBadge2,
  IconEye,
} from '@tabler/icons-react';
import { SocietyProps } from '@/types';
import { MakeContributionModal } from './make-contribution-modal';

const RightAside: React.FC<{ society: SocietyProps }> = ({ society }) => {
  return (
    <>
      {/* Right Sidebar - ~40% */}
      <aside className='lg:col-span-5 xl:col-span-4'>
        <div className='space-y-6 sticky top-28'>
          {/* Primary Actions */}
          <Card>
            <CardContent className='pt-6 space-y-4'>
              {society.can_join ? (
                <Button
                  className='w-full'
                  size='lg'
                >
                  Join Society
                </Button>
              ) : (
                <MakeContributionModal society={society} />
              )}

              {!society.is_public && society.can_join !== false && (
                <Button
                  variant='outline'
                  className='w-full'
                  size='lg'
                >
                  Request to Join
                </Button>
              )}

              {society.can_manage && (
                <Button
                  variant='outline'
                  className='w-full'
                  size='lg'
                >
                  Manage Society
                </Button>
              )}

              <div className='pt-4 border-t flex gap-3 justify-center'>
                <Button
                  variant='outline'
                  size='icon'
                >
                  <IconShare2 className='h-5 w-5' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                >
                  <IconFlag className='h-5 w-5' />
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
                    {society.founder?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{society.founder?.name}</p>
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
                      {society.co_founder?.name.charAt(0).toUpperCase()}
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

          {/* Active Members - GitHub-style overlapping avatars */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center -space-x-4'>
                {society.active_members?.map((member) => (
                  <Avatar
                    key={member.id}
                    className='h-12 w-12 border-4 border-background hover:z-10 transition-all hover:scale-110'
                  >
                    <AvatarImage
                      src={member.avatar_url ?? undefined}
                      alt={member.name}
                    />
                    <AvatarFallback className='bg-muted-foreground/20 text-foreground text-lg font-medium'>
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
        </div>
      </aside>
    </>
  );
};

export default RightAside;
