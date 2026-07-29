'use client';

import { useState, useTransition } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  IconUsers,
  IconUserPlus,
  IconLoader,
  IconMail,
  IconSearch,
} from '@tabler/icons-react';
import { inviteMember } from '@/app/actions/societies';
import { Member, SocietyProps } from '@/types';
import { toast } from 'sonner';

interface SocietyMembersClientProps {
  society: SocietyProps;
  members: Member[];
  totalMembers: number;
  onlyFounder: boolean;
  founder: Member;
}

function InviteMemberDialog({
  societyId,
  open,
  onOpenChange,
}: {
  societyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [pending, startTransition] = useTransition();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleSubmit = () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    startTransition(async () => {
      try {
        await inviteMember(societyId, email.trim());
        toast.success('Invitation sent successfully!');
        setEmail('');
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || 'Failed to send invitation');
      }
    });
  };

  const Content = (
    <div className='grid gap-6 py-4'>
      <div className='grid gap-3'>
        <Label htmlFor='email'>Email Address</Label>
        <Input
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='member@example.com'
          disabled={pending}
          autoFocus
        />
        <p className='text-sm text-muted-foreground'>
          The user must be registered to accept the invitation.
        </p>
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          variant='outline'
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={pending || !email.trim()}
        >
          {pending ? (
            <>
              <IconLoader className='mr-2 h-4 w-4 animate-spin' />
              Sending...
            </>
          ) : (
            <>
              <IconMail className='mr-2 h-4 w-4' />
              Send Invitation
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join this society.
            </DialogDescription>
          </DialogHeader>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Invite Member</DrawerTitle>
          <DrawerDescription>
            Send an invitation to join the society.
          </DrawerDescription>
        </DrawerHeader>
        <div className='px-4 pb-6'>{Content}</div>
      </DrawerContent>
    </Drawer>
  );
}

export function SocietyMembersClient({
  society,
  members,
  totalMembers,
  onlyFounder,
  founder,
}: SocietyMembersClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const canInvite = society.can_manage && society.verified;

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteClick = () => {
    if (!society.verified) {
      toast.error('Society must be verified before inviting members.');
      return;
    }
    setInviteOpen(true);
  };

  // Empty state: No members at all
  if (members.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <div className='rounded-full bg-muted/40 p-12 mb-6'>
          <IconUsers className='h-24 w-24 text-muted-foreground/40' />
        </div>
        <h3 className='text-2xl font-bold mb-3'>No members yet</h3>
        <p className='text-muted-foreground max-w-md'>
          Start building your savings community by inviting members.
        </p>
      </div>
    );
  }

  // Only founder state
  if (onlyFounder) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <Avatar className='h-32 w-32 mb-8 ring-8 ring-background shadow-2xl'>
          <AvatarImage src={founder.profile.avatar_url || undefined} />
          <AvatarFallback className='text-5xl font-bold'>
            {founder.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h3 className='text-2xl font-bold mb-4'>You&apos;re the founder</h3>
        <p className='text-lg text-muted-foreground max-w-md mb-10'>
          Invite members to activate contributions and start saving together.
        </p>

        {canInvite && (
          <Button
            onClick={handleInviteClick}
            size='lg'
            className='gap-3 px-8'
          >
            <IconUserPlus className='h-6 w-6' />
            Invite Members
          </Button>
        )}
      </div>
    );
  }

  // Normal list
  return (
    <>
      <div className='space-y-6'>
        {/* Header with count, search, and invite */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h2 className='text-xl font-bold'>Members</h2>
            <p className='text-muted-foreground'>{totalMembers} total</p>
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search members...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10 w-full sm:w-64'
              />
            </div>

            {canInvite && (
              <Button
                onClick={handleInviteClick}
                className='gap-2'
              >
                <IconUserPlus className='h-4 w-4' />
                {isDesktop ? 'Invite' : ''}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop: Table layout */}
        {isDesktop ? (
          <div className='rounded-lg border bg-card'>
            <table className='w-full'>
              <thead>
                <tr className='border-b bg-muted/40'>
                  <th className='text-left p-4 font-medium'>Member</th>
                  <th className='text-left p-4 font-medium'>Role</th>
                  <th className='text-left p-4 font-medium'>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className='border-b hover:bg-muted/30 transition-colors'
                  >
                    <td className='p-4'>
                      <div className='flex items-center gap-4'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={member.profile?.avatar_url || undefined}
                          />
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className='p-4'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='secondary'
                          className='capitalize'
                        >
                          {member.pivot.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className='p-4 text-muted-foreground'>
                      {new Date(member.pivot.created_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Mobile: Compact cards */
          <div className='space-y-4'>
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className='flex items-center gap-4 rounded-lg border bg-card p-4'
              >
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className='flex-1 min-w-0'>
                  <p className='font-semibold truncate'>{member.name}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge
                      variant='secondary'
                      className='text-xs capitalize'
                    >
                      {member.pivot.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground mt-2'>
                    Joined{' '}
                    {new Date(member.pivot.created_at).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InviteMemberDialog
        societyId={society.id.toString()}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </>
  );
}
