// components/join-with-code.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconTicket, IconLoader } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import { joinSocietyWithCode } from '@/app/actions/societies';

export function JoinWithCode() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [pending, startTransition] = useTransition();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error('Enter an invite code');
      return;
    }

    startTransition(async () => {
      try {
        const result = await joinSocietyWithCode(code.trim());
        toast.success(
          result.membershipStatus === 'pending'
            ? 'Joined! Pay the one-time fees to activate your membership.'
            : 'Joined successfully!'
        );
        setOpen(false);
        setCode('');
        router.push(`/dashboard/societies/${result.id}`);
      } catch (err: any) {
        toast.error('Failed to join', { description: err.message });
      }
    });
  };

  const Content = (
    <div className='space-y-4 px-1'>
      <div className='space-y-2'>
        <Label htmlFor='invite-code'>Invite Code</Label>
        <Input
          id='invite-code'
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder='e.g. ABCD1234'
          className='text-base font-mono tracking-widest uppercase'
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <p className='text-sm text-muted-foreground'>
          Ask a society founder or admin for their invite code.
        </p>
      </div>

      <div className='flex justify-end gap-3 pt-2'>
        <Button variant='outline' onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleJoin} disabled={pending || !code.trim()}>
          {pending ? (
            <>
              <IconLoader className='mr-2 h-4 w-4 animate-spin' /> Joining...
            </>
          ) : (
            'Join Society'
          )}
        </Button>
      </div>
    </div>
  );

  const trigger = (
    <Button variant='outline' onClick={() => setOpen(true)}>
      <IconTicket className='mr-2 h-4 w-4' /> Join with Invite Code
    </Button>
  );

  if (isDesktop) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Join a Society</DialogTitle>
              <DialogDescription>
                Enter the invite code you were given to join a private society.
              </DialogDescription>
            </DialogHeader>
            {Content}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <div className='mx-auto w-full max-w-md'>
            <DrawerHeader className='text-left'>
              <DrawerTitle>Join a Society</DrawerTitle>
              <DrawerDescription>
                Enter the invite code you were given to join a private society.
              </DrawerDescription>
            </DrawerHeader>
            <div className='px-4 pb-6'>{Content}</div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
