// components/quick-create-society.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCirclePlusFilled,
  IconLoader,
  IconUserPlus,
  IconX,
  IconCheck,
  IconUpload,
  IconPlus,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Progress } from '@/components/ui/progress';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import { createSociety, inviteCoFounder } from '@/app/actions/societies';
import { SidebarMenuButton } from './ui/sidebar';
import { cn } from '@/lib/utils'; // assuming you have this helper
import confetti from 'canvas-confetti';

// Simple two-step progress bar
function StepProgress({ step }: { step: 'create' | 'invite' }) {
  const progress = step === 'create' ? 50 : 100;

  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              step === 'create'
                ? 'bg-primary text-primary-foreground'
                : 'bg-green-500 text-white'
            )}
          >
            <IconCheck className='h-5 w-5' />
          </div>
          <span className='text-sm font-medium'>Create Society</span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              step === 'invite'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            2
          </div>
          <span
            className={cn(
              'text-sm font-medium',
              step === 'invite' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Invite Co-founder
          </span>
        </div>
      </div>
      <Progress
        value={progress}
        className='h-2'
      />
    </div>
  );
}

export function QuickCreateSociety({ from }: { from: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'create' | 'invite'>('create');
  const [pending, startTransition] = useTransition();
  const [invitePending, startInviteTransition] = useTransition();
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [societyName, setSocietyName] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coFounderEmail, setCoFounderEmail] = useState('');

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();

  // Trigger confetti when we move to invite step (success!)
  useEffect(() => {
    if (step === 'invite') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
      });
    }
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Society name is required');
      return;
    }
    if (!monthlyAmount || Number(monthlyAmount) <= 0) {
      toast.error('Monthly contribution amount must be greater than 0');
      return;
    }
    if (registrationFee === '' || Number(registrationFee) < 0) {
      toast.error('Registration fee cannot be negative');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', name.trim());
        if (description.trim())
          formData.append('description', description.trim());
        formData.append('monthlyAmount', monthlyAmount);
        formData.append('registrationFee', registrationFee);
        if (avatarFile) formData.append('avatar', avatarFile);

        const society = await createSociety(formData);
        setSocietyId(String(society.id));
        setSocietyName(name.trim());
        toast.success('Society created successfully!');
        setStep('invite');
      } catch (err: any) {
        toast.error('Error creating society', {
          description: err.message || 'Something went wrong',
        });
      }
    });
  };

  const handleInvite = () => {
    if (!coFounderEmail.trim()) {
      handleComplete();
      return;
    }

    startInviteTransition(async () => {
      try {
        await inviteCoFounder(societyId!, coFounderEmail.trim());
        toast.success('Co-founder invitation sent!');
        handleComplete();
      } catch (err: any) {
        toast.error('Failed to send invitation', { description: err.message });
      }
    });
  };

  const handleComplete = () => {
    setOpen(false);
    setStep('create');
    setSocietyId(null);
    setSocietyName('');
    setCoFounderEmail('');
    setName('');
    setDescription('');
    setMonthlyAmount('');
    setRegistrationFee('');
    setAvatarFile(null);
    setAvatarPreview(null);
    if (societyId) {
      router.push(`/dashboard/societies/${societyId}`);
    }
  };

  const Content = (
    <div className='max-w-full mx-auto px-4'>
      <StepProgress step={step} />

      {step === 'create' ? (
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Society Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Unity Thrift Group'
              className='text-base'
              autoFocus
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description (optional)</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Tell us about your savings community...'
              rows={4}
              className='resize-none'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='monthlyAmount'>Monthly amount (₦)</Label>
              <Input
                id='monthlyAmount'
                type='number'
                min='1'
                step='0.01'
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='registrationFee'>Registration fee (₦)</Label>
              <Input
                id='registrationFee'
                type='number'
                min='0'
                step='0.01'
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-3'>
            <Label>Avatar (optional)</Label>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <div className='relative'>
                {avatarPreview ? (
                  <div className='relative'>
                    <img
                      src={avatarPreview}
                      alt='Society avatar preview'
                      className='h-28 w-28 rounded-full object-cover border-4 border-background shadow-lg'
                    />
                    <button
                      onClick={removeAvatar}
                      className='absolute -top-2 -right-2 rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90 shadow-md'
                      aria-label='Remove avatar'
                    >
                      <IconX className='h-4 w-4' />
                    </button>
                  </div>
                ) : (
                  <div className='flex h-28 w-28 items-center justify-center rounded-full bg-muted'>
                    <IconUpload className='h-10 w-10 text-muted-foreground' />
                  </div>
                )}
              </div>

              <div className='flex-1 w-full'>
                <Input
                  id='avatar'
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='cursor-pointer'
                />
                <p className='text-xs text-muted-foreground mt-2'>
                  Recommended: square image, max 2MB
                </p>
              </div>
            </div>
          </div>

          <div className='flex justify-between pt-4'>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={pending || !name.trim()}
              size='lg'
            >
              {pending ? (
                <>
                  <IconLoader className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Society'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className='space-y-8 py-6'>
          <div className='text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
              <IconCheck className='h-12 w-12 text-green-600' />
            </div>
            <h3 className='text-2xl font-bold'>Society Created!</h3>
            <p className='text-lg text-muted-foreground mt-3'>
              <span className='font-semibold text-foreground'>
                "{societyName}"
              </span>{' '}
              is now live
            </p>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='co-founder'>Invite Co-founder (optional)</Label>
              <Input
                id='co-founder'
                type='email'
                value={coFounderEmail}
                onChange={(e) => setCoFounderEmail(e.target.value)}
                placeholder='co-founder@example.com'
                className='text-base'
              />
              <p className='text-sm text-muted-foreground'>
                They must be registered on the platform to accept the
                invitation.
              </p>
            </div>
          </div>

          <div className='flex flex-col-reverse sm:flex-row gap-3 sm:justify-end'>
            <Button
              variant='outline'
              onClick={handleComplete}
              size='lg'
              disabled={invitePending}
            >
              Skip & View Society
            </Button>
            <Button
              onClick={handleInvite}
              size='lg'
              disabled={invitePending}
              className='sm:ml-3'
            >
              {invitePending ? (
                <>
                  <IconLoader className='mr-2 h-5 w-5 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <IconUserPlus className='mr-2 h-5 w-5' />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const triggerButton = (
    <SidebarMenuButton
      tooltip='Quick Create'
      className='bg-primary text-primary-foreground hover:bg-primary/90 min-w-8 duration-200 ease-linear'
      onClick={() => setOpen(true)}
    >
      <IconCirclePlusFilled className='mr-2 h-4 w-4' />
      Quick Create
    </SidebarMenuButton>
  );

  const triggerButtonPage = (
    <Button
      onClick={() => setOpen(true)}
      className='cursor-pointer font-semibold shadow-2xs px-5'
    >
      <IconPlus className='mr-1.5 h-4 w-4' /> Create Society
    </Button>
  );

  if (isDesktop) {
    return (
      <>
        {from === 'sidebar' ? triggerButton : triggerButtonPage}
        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
            <DialogHeader className='text-left shrink-0'>
              <DialogTitle className='text-2xl font-bold'>
                Create New Society
              </DialogTitle>
              <DialogDescription className='text-base'>
                {step === 'create'
                  ? 'Set up your new Adashi community in seconds'
                  : 'Almost done! Invite a co-founder or finish now.'}
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable body */}
            <div className='overflow-y-auto flex-1 w-full px-1'>
              <div className='py-4'>{Content}</div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {from === 'sidebar' ? triggerButton : triggerButtonPage}
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerContent className='max-h-[96vh]'>
          <div className='mx-auto w-full max-w-md'>
            {/* Drawer handle */}
            <div className='mx-auto w-12 h-1.5 shrink-0 rounded-full bg-muted mt-4 mb-6' />

            <div className='overflow-y-auto px-6 pb-6'>
              <DrawerHeader className='text-left pb-6'>
                <DrawerTitle className='text-2xl font-bold'>
                  Create New Society
                </DrawerTitle>
                <DrawerDescription className='text-base'>
                  {step === 'create'
                    ? 'Set up your new Adashi community in seconds'
                    : 'Almost done! Invite a co-founder or finish now.'}
                </DrawerDescription>
              </DrawerHeader>
              {Content}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
