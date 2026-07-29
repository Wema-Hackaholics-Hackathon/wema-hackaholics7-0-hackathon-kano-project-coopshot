'use client';

import { useState, useTransition } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
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
  IconLoader,
  IconMail,
} from '@tabler/icons-react';
import { inviteCoFounder } from '@/app/actions/societies';
import { SocietyProps } from '@/types';
import { toast } from 'sonner';

function InviteCoFounderModal({
  society,
  open,
  onOpenChange,
}: {
  society: SocietyProps;
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
        await inviteCoFounder(society.id.toString(), email.trim());
        toast.success('Co-founder invitation sent successfully!');
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
        <Label htmlFor='co-founder-email'>Co-founder's Email</Label>
        <Input
          id='co-founder-email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='co-founder@example.com'
          disabled={pending}
          autoFocus
        />
        <p className='text-sm text-muted-foreground'>
          They must be registered on the platform to accept the invitation. Once
          accepted, they will have full admin rights.
        </p>
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          variant='outline'
          onClick={() => {
            onOpenChange(false);
            setEmail('');
          }}
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
            <DialogTitle>Invite Co-founder</DialogTitle>
            <DialogDescription>
              Invite someone to co-manage this society with full administrative
              privileges.
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
        <DrawerHeader className='text-left'>
          <DrawerTitle>Invite Co-founder</DrawerTitle>
          <DrawerDescription>
            Grant full admin rights to a trusted member.
          </DrawerDescription>
        </DrawerHeader>
        <div className='px-4 pb-6'>{Content}</div>
      </DrawerContent>
    </Drawer>
  );
}

export default InviteCoFounderModal;