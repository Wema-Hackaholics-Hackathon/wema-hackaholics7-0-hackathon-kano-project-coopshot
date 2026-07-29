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
} from '@tabler/icons-react';
import { updateSocietySettings } from '@/app/actions/societies';
import { SocietyProps } from '@/types';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function EditSettingsModal({
  society,
  open,
  onOpenChange,
  onSuccess,
}: {
  society: SocietyProps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (settings: SocietyProps['settings']) => void;
}) {
  const [pending, startTransition] = useTransition();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [amount, setAmount] = useState(
    society.settings.contribution_amount.toString()
  );
  const [frequency, setFrequency] = useState(society.settings.frequency);
  const [payoutCycle, setPayoutCycle] = useState(society.settings.payout_cycle);
  const [lateFee, setLateFee] = useState(
    society.settings.late_fee?.toString() || '0'
  );
  const [tbillPercent, setTbillPercent] = useState(
    (society.settings.tbill_allocation_percentage ?? 5).toString()
  );
  const [tbillDuration, setTbillDuration] = useState(
    (society.settings.tbill_duration_days ?? 91).toString()
  );

  const handleSave = () => {
    const data: any = {};

    if (parseFloat(amount) !== society.settings.contribution_amount) {
      data.contribution_amount = parseFloat(amount);
    }
    if (frequency !== society.settings.frequency) data.frequency = frequency;
    if (payoutCycle !== society.settings.payout_cycle)
      data.payout_cycle = payoutCycle;
    if (parseFloat(lateFee) !== (society.settings.late_fee || 0)) {
      data.late_fee = parseFloat(lateFee);
    }
    if (parseFloat(tbillPercent) !== (society.settings.tbill_allocation_percentage ?? 5)) {
      data.tbill_allocation_percentage = parseFloat(tbillPercent);
    }
    if (parseInt(tbillDuration) !== (society.settings.tbill_duration_days ?? 91)) {
      data.tbill_duration_days = parseInt(tbillDuration);
    }

    if (Object.keys(data).length === 0) {
      onOpenChange(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateSocietySettings(society.id.toString(), data);
        toast.success('Contribution settings updated!');
        onSuccess({
          ...society.settings,
          ...data,
        });
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || 'Failed to update settings');
      }
    });
  };

  const Content = (
    <div className='space-y-4 py-2'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='grid gap-1.5'>
          <Label htmlFor='amount' className='text-xs font-medium'>Contribution Amount (₦)</Label>
          <Input
            id='amount'
            type='number'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min='100'
            disabled={pending}
          />
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='frequency' className='text-xs font-medium'>Frequency</Label>
          <Select
            value={frequency}
            onValueChange={(value) => {
              setFrequency(value as 'monthly' | 'quarterly' | 'yearly');
            }}
            disabled={pending}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='weekly'>Weekly</SelectItem>
              <SelectItem value='monthly'>Monthly</SelectItem>
              <SelectItem value='quarterly'>Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='payout' className='text-xs font-medium'>Payout Cycle</Label>
          <Select
            value={payoutCycle}
            onValueChange={(value) => {
              setPayoutCycle(value as 'rotating' | 'fixed');
            }}
            disabled={pending}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='rotating'>Rotating</SelectItem>
              <SelectItem value='fixed'>Fixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='late-fee' className='text-xs font-medium'>Late Fee (₦)</Label>
          <Input
            id='late-fee'
            type='number'
            value={lateFee}
            onChange={(e) => setLateFee(e.target.value)}
            min='0'
            disabled={pending}
          />
        </div>

        <div className='grid gap-1.5 sm:col-span-2 border-t pt-3 mt-1'>
          <Label htmlFor='tbill-percent' className='text-xs font-medium'>Default T-Bill Allocation (%)</Label>
          <Input
            id='tbill-percent'
            type='number'
            value={tbillPercent}
            onChange={(e) => setTbillPercent(e.target.value)}
            min='0'
            max='50'
            disabled={pending}
          />
          <p className='text-[11px] text-muted-foreground'>
            Percentage of pool contributions automatically swept into CBN Treasury Bills.
          </p>
        </div>

        <div className='grid gap-1.5 sm:col-span-2'>
          <Label htmlFor='tbill-duration' className='text-xs font-medium'>T-Bill Lock Duration</Label>
          <Select
            value={tbillDuration}
            onValueChange={(value) => setTbillDuration(value)}
            disabled={pending}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='30'>30 Days (1 Month)</SelectItem>
              <SelectItem value='91'>91 Days (3 Months — Recommended)</SelectItem>
              <SelectItem value='182'>182 Days (6 Months)</SelectItem>
              <SelectItem value='364'>364 Days (1 Year)</SelectItem>
            </SelectContent>
          </Select>
          <p className='text-[11px] text-muted-foreground'>
            Maturity duration for collective Treasury Bill investments.
          </p>
        </div>
      </div>

      <div className='flex justify-end gap-3 pt-3 border-t'>
        <Button
          variant='outline'
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? (
            <>
              <IconLoader className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            'Save Changes'
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
        <DialogContent className='sm:max-w-xl max-h-[85vh] overflow-y-auto p-6'>
          <DialogHeader>
            <DialogTitle>Edit Contribution & Treasury Settings</DialogTitle>
            <DialogDescription>
              Update contribution rules and Treasury Bill allocation policy.
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
          <DrawerTitle>Edit Contribution Settings</DrawerTitle>
          <DrawerDescription>Update contribution rules</DrawerDescription>
        </DrawerHeader>
        <div className='px-4 pb-6'>{Content}</div>
      </DrawerContent>
    </Drawer>
  );
}

export default EditSettingsModal;