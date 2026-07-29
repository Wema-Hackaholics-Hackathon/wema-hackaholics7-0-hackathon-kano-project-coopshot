'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconCheck,
  IconClock,
  IconCrown,
  IconLoader,
  IconX,
  IconLayoutGrid,
  IconTable,
  IconUserPlus,
  IconGlobe,
  IconLock,
  IconArrowUpRight,
  IconAlertCircle,
} from '@tabler/icons-react';
import { acceptInvite, declineInvite } from '@/app/actions/societies';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface PendingInvite {
  id: string | number;
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  is_public?: boolean;
  invited_by: string;
  invited_at: string;
  invite_type: 'co-founder' | 'member' | string;
  role: string;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 30)
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInviteBadge(inviteType: string, role: string) {
  if (inviteType === 'co-founder' || role.toLowerCase().includes('co-founder')) {
    return (
      <Badge variant='default' className='bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shrink-0 whitespace-nowrap gap-1'>
        <IconCrown className='h-3 w-3' />
        Co-Founder
      </Badge>
    );
  }
  return (
    <Badge variant='secondary' className='font-medium text-xs shrink-0 whitespace-nowrap'>
      {role || 'Member'}
    </Badge>
  );
}

export default function InviteCardsList({ invites: initialInvites }: { invites: PendingInvite[] }) {
  const [invites, setInvites] = useState<PendingInvite[]>(initialInvites);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loadingState, setLoadingState] = useState<Record<string, 'accept' | 'decline' | null>>({});

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'decline';
    invite: PendingInvite | null;
  }>({
    isOpen: false,
    type: 'accept',
    invite: null,
  });

  const openConfirmation = (type: 'accept' | 'decline', invite: PendingInvite) => {
    setConfirmModal({
      isOpen: true,
      type,
      invite,
    });
  };

  const closeConfirmation = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    const { invite, type } = confirmModal;
    if (!invite) return;

    setLoadingState((prev) => ({ ...prev, [invite.id]: type }));
    closeConfirmation();

    try {
      if (type === 'accept') {
        await acceptInvite(String(invite.id), invite.invite_type as 'member' | 'co-founder');
        toast.success(`Successfully joined ${invite.name}!`);
      } else {
        await declineInvite(String(invite.id));
        toast.success(`Declined invitation to ${invite.name}`);
      }
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err: any) {
      toast.error(err.message || `Failed to ${type} invitation`);
    } finally {
      setLoadingState((prev) => ({ ...prev, [invite.id]: null }));
    }
  };

  if (invites.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border p-8 shadow-xs'>
        <Image
          src='/illustrations/undraw_happy-news_6lg3.svg'
          alt='No pending invites'
          width={220}
          height={160}
          className='mb-6 h-36 w-auto'
        />
        <h2 className='text-2xl font-bold mb-2 tracking-tight'>No pending invites</h2>
        <p className='text-muted-foreground mb-6 max-w-md text-sm leading-relaxed'>
          When someone invites you to join a cooperative society or become a co-founder,
          you&apos;ll see the invitation right here.
        </p>
        <div className='flex items-center gap-3'>
          <Button asChild variant='default' className='cursor-pointer font-semibold'>
            <Link href='/dashboard/societies'>
              Explore Societies <IconArrowUpRight className='ml-1.5 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* View Switcher Header */}
      <div className='flex items-center justify-between gap-4 border-b pb-4'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span className='font-semibold text-foreground text-base'>
            Pending Invitations ({invites.length})
          </span>
        </div>

        <div className='inline-flex items-center rounded-lg border bg-muted/40 p-1 gap-1'>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconLayoutGrid className='h-3.5 w-3.5' />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconTable className='h-3.5 w-3.5' />
            Table
          </button>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {viewMode === 'grid' ? (
          /* Cards View Grid */
          <motion.div
            key='grid'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
          >
            {invites.map((invite, idx) => {
              const status = loadingState[invite.id];
              return (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className='flex flex-col'
                >
                  <Card className='group flex flex-col justify-between h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md bg-card border'>
                    <div className='p-5 pb-3.5 min-w-0 w-full overflow-hidden'>
                      <div className='flex items-start justify-between gap-3 w-full min-w-0'>
                        <div className='flex items-center gap-3 min-w-0 flex-1 overflow-hidden'>
                          <Avatar className='h-11 w-11 border shrink-0 transition-transform group-hover:scale-105'>
                            <AvatarImage src={invite.avatar_url || undefined} />
                            <AvatarFallback className='bg-primary/10 text-primary text-sm font-bold'>
                              {invite.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className='min-w-0 flex-1 overflow-hidden space-y-0.5'>
                            <h3
                              className='text-base font-semibold text-foreground truncate block w-0 min-w-full group-hover:text-primary transition-colors'
                              title={invite.name}
                            >
                              {invite.name}
                            </h3>
                            <p
                              className='text-xs text-muted-foreground truncate block w-0 min-w-full'
                              title={invite.description || ''}
                            >
                              {invite.description || 'Rotating savings group'}
                            </p>
                          </div>
                        </div>

                        <div className='shrink-0 pt-0.5'>
                          {getInviteBadge(invite.invite_type, invite.role)}
                        </div>
                      </div>
                    </div>

                    <CardContent className='space-y-3 py-3 flex-1 border-t border-b bg-muted/20 text-xs'>
                      <div className='flex items-center justify-between gap-2 text-muted-foreground'>
                        <span className='font-medium text-foreground'>Invited by:</span>
                        <span className='font-semibold text-foreground truncate max-w-40'>
                          {invite.invited_by}
                        </span>
                      </div>

                      <div className='flex items-center justify-between gap-2 text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                          <IconClock className='h-3.5 w-3.5 text-muted-foreground' />
                          Received:
                        </span>
                        <span className='font-medium text-foreground'>
                          {formatTimeAgo(invite.invited_at)}
                        </span>
                      </div>

                      <div className='flex items-center justify-between gap-2 pt-1 border-t border-border/50'>
                        <span className='text-muted-foreground font-medium'>Access:</span>
                        <Badge variant='outline' className='text-[11px] gap-1 px-2 py-0.5 font-normal'>
                          {invite.is_public ? (
                            <>
                              <IconGlobe className='h-3 w-3 text-emerald-600' /> Public Group
                            </>
                          ) : (
                            <>
                              <IconLock className='h-3 w-3 text-amber-600' /> Private Invite
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardContent>

                    <CardFooter className='pt-3 pb-3 bg-card gap-2.5'>
                      <Button
                        size='sm'
                        className='flex-1 cursor-pointer font-semibold'
                        onClick={() => openConfirmation('accept', invite)}
                        disabled={!!status}
                      >
                        {status === 'accept' ? (
                          <>
                            <IconLoader className='mr-1.5 h-3.5 w-3.5 animate-spin' /> Joining...
                          </>
                        ) : (
                          <>
                            <IconCheck className='mr-1.5 h-4 w-4' /> Accept
                          </>
                        )}
                      </Button>

                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors'
                        onClick={() => openConfirmation('decline', invite)}
                        disabled={!!status}
                      >
                        {status === 'decline' ? (
                          <>
                            <IconLoader className='mr-1.5 h-3.5 w-3.5 animate-spin' /> Declining...
                          </>
                        ) : (
                          <>
                            <IconX className='mr-1.5 h-4 w-4' /> Decline
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Table View */
          <motion.div
            key='table'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className='w-full overflow-x-auto border bg-card rounded-xl shadow-xs'
          >
            <Table className='min-w-175'>
              <TableHeader className='bg-muted/40'>
                <TableRow>
                  <TableHead className='font-semibold min-w-50 sm:min-w-62.5'>Society Name</TableHead>
                  <TableHead className='font-semibold min-w-36'>Invited By</TableHead>
                  <TableHead className='font-semibold min-w-32'>Role Type</TableHead>
                  <TableHead className='font-semibold min-w-32'>Received</TableHead>
                  <TableHead className='text-right font-semibold min-w-44'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const status = loadingState[invite.id];
                  return (
                    <TableRow key={invite.id} className='hover:bg-muted/30 transition-colors'>
                      <TableCell className='font-medium max-w-50 sm:max-w-62.5 overflow-hidden'>
                        <div className='flex items-center gap-3 min-w-0 w-full overflow-hidden'>
                          <Avatar className='h-9 w-9 border shrink-0'>
                            <AvatarImage src={invite.avatar_url || undefined} />
                            <AvatarFallback className='text-xs font-bold bg-primary/10 text-primary'>
                              {invite.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1 overflow-hidden space-y-0.5'>
                            <span
                              className='font-semibold text-foreground text-sm truncate block w-0 min-w-full'
                              title={invite.name}
                            >
                              {invite.name}
                            </span>
                            <p
                              className='text-xs text-muted-foreground truncate block w-0 min-w-full'
                              title={invite.description || ''}
                            >
                              {invite.description || 'Rotating savings group'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm font-medium text-foreground whitespace-nowrap'>
                        {invite.invited_by}
                      </TableCell>
                      <TableCell className='whitespace-nowrap'>
                        {getInviteBadge(invite.invite_type, invite.role)}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground whitespace-nowrap'>
                        {formatTimeAgo(invite.invited_at)}
                      </TableCell>
                      <TableCell className='text-right whitespace-nowrap'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            size='sm'
                            className='cursor-pointer font-semibold h-8 px-3 text-xs'
                            onClick={() => openConfirmation('accept', invite)}
                            disabled={!!status}
                          >
                            {status === 'accept' ? (
                              <IconLoader className='h-3.5 w-3.5 animate-spin' />
                            ) : (
                              <>
                                <IconCheck className='mr-1 h-3.5 w-3.5' /> Accept
                              </>
                            )}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='cursor-pointer h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive'
                            onClick={() => openConfirmation('decline', invite)}
                            disabled={!!status}
                          >
                            {status === 'decline' ? (
                              <IconLoader className='h-3.5 w-3.5 animate-spin' />
                            ) : (
                              <>
                                <IconX className='mr-1 h-3.5 w-3.5' /> Decline
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && closeConfirmation()}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader className='space-y-2'>
            <div className='flex items-center gap-3'>
              <div
                className={`p-2.5 rounded-full ${
                  confirmModal.type === 'accept'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {confirmModal.type === 'accept' ? (
                  <IconCheck className='h-5 w-5' />
                ) : (
                  <IconAlertCircle className='h-5 w-5' />
                )}
              </div>
              <div>
                <DialogTitle className='text-lg font-bold'>
                  {confirmModal.type === 'accept'
                    ? `Accept Invitation?`
                    : `Decline Invitation?`}
                </DialogTitle>
                <DialogDescription className='text-xs mt-0.5'>
                  {confirmModal.type === 'accept'
                    ? `Join ${confirmModal.invite?.name}`
                    : `Decline invitation from ${confirmModal.invite?.invited_by}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='py-3 text-sm text-muted-foreground leading-relaxed border-t border-b bg-muted/20 p-4 rounded-lg my-1'>
            {confirmModal.type === 'accept' ? (
              <p>
                You are about to accept the invitation to join{' '}
                <strong className='text-foreground'>{confirmModal.invite?.name}</strong> as a{' '}
                <strong className='text-foreground capitalize'>{confirmModal.invite?.role || 'Member'}</strong>, sent by{' '}
                <strong className='text-foreground'>{confirmModal.invite?.invited_by}</strong>.
              </p>
            ) : (
              <p>
                Are you sure you want to decline the invitation to join{' '}
                <strong className='text-foreground'>{confirmModal.invite?.name}</strong>? This action cannot be undone.
              </p>
            )}
          </div>

          <DialogFooter className='gap-2 pt-2'>
            <Button variant='outline' onClick={closeConfirmation} className='cursor-pointer'>
              Cancel
            </Button>
            <Button
              variant={confirmModal.type === 'accept' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              className='cursor-pointer font-semibold'
            >
              {confirmModal.type === 'accept' ? (
                <>
                  <IconCheck className='mr-1.5 h-4 w-4' /> Confirm & Join
                </>
              ) : (
                <>
                  <IconX className='mr-1.5 h-4 w-4' /> Decline Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
