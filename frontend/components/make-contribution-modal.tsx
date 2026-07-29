'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SocietyProps } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  IconBuildingBank,
  IconPhoneCall,
  IconBuildingStore,
  IconCash,
  IconCopy,
  IconCheck,
  IconIdBadge2,
  IconInfoCircle,
  IconBuildingCommunity,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { submitContribution } from '@/app/actions/contribution';

export interface CooperativeOption {
  id: string | number;
  name: string;
  settings?: {
    contribution_amount?: number;
    frequency?: string;
  };
}

const DEFAULT_COOPERATIVES: CooperativeOption[] = [
  {
    id: '1',
    name: 'Victoria Island Savers Guild',
    settings: {
      contribution_amount: 300000,
      frequency: 'monthly',
    },
  },
  {
    id: '2',
    name: 'Tech Founders Investment Circle',
    settings: {
      contribution_amount: 500000,
      frequency: 'quarterly',
    },
  },
  {
    id: 'treasury',
    name: 'CoopShot Platform Treasury',
    settings: {
      contribution_amount: 100000,
      frequency: 'flexible',
    },
  },
];

interface MakeContributionModalProps {
  society?: Partial<SocietyProps>;
  societyName?: string;
  cooperatives?: CooperativeOption[];
  trigger?: React.ReactNode;
}

const USSD_BANKS = [
  { name: 'Wema Bank', code: '*945*' },
  { name: 'Access Bank', code: '*901*' },
  { name: 'GTBank', code: '*737*' },
  { name: 'Zenith Bank', code: '*966*' },
  { name: 'UBA', code: '*919*' },
  { name: 'First Bank', code: '*894*' },
  { name: 'Kuda Microfinance', code: '*5573*' },
];

export function MakeContributionModal({
  society,
  societyName,
  cooperatives,
  trigger,
}: MakeContributionModalProps) {
  const availableCoops = cooperatives || DEFAULT_COOPERATIVES;

  const initialCoop = society?.name
    ? {
        id: society.id || '1',
        name: society.name,
        settings: society.settings,
      }
    : availableCoops[0];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<CooperativeOption>(initialCoop);
  const [selectedChannel, setSelectedChannel] = useState<
    'bank_transfer' | 'ussd' | 'agent' | 'cash'
  >('bank_transfer');
  const [selectedUssdBank, setSelectedUssdBank] = useState(USSD_BANKS[0]);
  const [selectedOfficer, setSelectedOfficer] = useState('Adaora Nwosu (Treasurer)');
  const [cashReceiptNote, setCashReceiptNote] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const targetSocietyName = selectedCoop.name;
  const amount = selectedCoop.settings?.contribution_amount || 300000;
  const frequency = selectedCoop.settings?.frequency || 'monthly';
  const accountNumber = '0123984710';
  const generatedUssdCode = `${selectedUssdBank.code}000*${accountNumber}*${amount}#`;

  const handleCopyAccount = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(`${label} Copied`, {
        description: `${text} copied to clipboard.`,
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleConfirmPayment = async (
    channel: 'bank_transfer' | 'ussd' | 'agent' | 'cash'
  ) => {
    setLoading(true);
    try {
      const res = await submitContribution(String(society?.id || 1), channel, amount, {
        bank_name: channel === 'bank_transfer' ? 'Sterling Bank' : undefined,
        reference_code: channel === 'ussd' ? generatedUssdCode : undefined,
        agent_code: channel === 'agent' ? 'AGENT-LAGOS-092' : undefined,
        officer_name: channel === 'cash' ? selectedOfficer : undefined,
      });

      if (res.success) {
        toast.success('Contribution Recorded!', {
          description: res.message,
        });
        setIsOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record contribution';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className='w-full cursor-pointer font-semibold' size='lg'>
            <IconBuildingBank className='mr-2 h-5 w-5' />
            Make Contribution (₦{amount.toLocaleString()})
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='flex flex-col items-center text-center space-y-3 pt-2'>
          <Image
            src='/illustrations/undraw_enter-payment-info_k1yw.svg'
            alt='Make Contribution'
            width={160}
            height={120}
            className='h-28 w-auto mx-auto mb-1'
          />
          <div className='inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mx-auto'>
            Financial Inclusion Channels
          </div>
          <DialogTitle className='text-xl font-bold text-center'>
            Contribute to {targetSocietyName}
          </DialogTitle>
          <DialogDescription className='text-center text-xs sm:text-sm max-w-md mx-auto'>
            Choose your preferred contribution method. Minimum required amount for this cycle is{' '}
            <strong className='text-foreground font-semibold'>
              ₦{amount.toLocaleString()} ({frequency})
            </strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Cooperative Selector Dropdown */}
        {availableCoops.length > 1 && (
          <div className='space-y-1.5 text-left w-full bg-muted/40 p-3 rounded-xl border my-1'>
            <div className='flex items-center justify-between text-xs text-muted-foreground font-medium'>
              <label htmlFor='coop-selector' className='font-semibold text-foreground flex items-center gap-1.5'>
                <IconBuildingCommunity className='h-4 w-4 text-primary' /> Select Target Cooperative
              </label>
              <Badge variant='outline' className='text-[11px] font-normal'>
                {availableCoops.length} Co-ops Available
              </Badge>
            </div>
            <select
              id='coop-selector'
              value={String(selectedCoop.id)}
              onChange={(e) => {
                const chosen = availableCoops.find((c) => String(c.id) === e.target.value);
                if (chosen) setSelectedCoop(chosen);
              }}
              className='w-full rounded-lg border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer'
            >
              {availableCoops.map((coop) => (
                <option key={coop.id} value={String(coop.id)}>
                  {coop.name} — ₦{(coop.settings?.contribution_amount || 300000).toLocaleString()} ({coop.settings?.frequency || 'monthly'})
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs
          defaultValue='bank_transfer'
          onValueChange={(val) =>
            setSelectedChannel(val as 'bank_transfer' | 'ussd' | 'agent' | 'cash')
          }
          className='w-full space-y-4 py-2'
        >
          {/* Channel Selector Tabs */}
          <TabsList className='grid grid-cols-4 w-full group-data-horizontal/tabs:h-auto! h-auto! p-1.5 bg-muted/80 rounded-xl gap-1'>
            <TabsTrigger
              value='bank_transfer'
              className='flex flex-col items-center justify-center gap-1.5 h-auto! py-2.5 text-xs font-medium cursor-pointer rounded-lg'
            >
              <IconBuildingBank className='h-4 w-4 shrink-0' />
              <span>Bank</span>
            </TabsTrigger>

            <TabsTrigger
              value='ussd'
              className='flex flex-col items-center justify-center gap-1.5 h-auto! py-2.5 text-xs font-medium cursor-pointer rounded-lg'
            >
              <IconPhoneCall className='h-4 w-4 shrink-0' />
              <span>USSD Code</span>
            </TabsTrigger>

            <TabsTrigger
              value='agent'
              className='flex flex-col items-center justify-center gap-1.5 h-auto! py-2.5 text-xs font-medium cursor-pointer rounded-lg'
            >
              <IconBuildingStore className='h-4 w-4 shrink-0' />
              <span>Agent / POS</span>
            </TabsTrigger>

            <TabsTrigger
              value='cash'
              className='flex flex-col items-center justify-center gap-1.5 h-auto! py-2.5 text-xs font-medium cursor-pointer rounded-lg'
            >
              <IconCash className='h-4 w-4 shrink-0' />
              <span>Cash</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. Bank Transfer Channel */}
          <TabsContent value='bank_transfer' className='space-y-4 pt-2'>
            <div className='rounded-xl border bg-card p-5 space-y-4 shadow-2xs'>
              <div className='flex justify-between items-center border-b pb-3'>
                <div>
                  <span className='text-xs text-muted-foreground block'>Bank Name</span>
                  <span className='font-bold text-foreground text-sm'>
                    Sterling Bank / CoopShot Dedicated Pool
                  </span>
                </div>
                <Badge variant='secondary' className='text-xs'>
                  Instant Auto-Match
                </Badge>
              </div>

              <div className='flex justify-between items-center border-b pb-3'>
                <div>
                  <span className='text-xs text-muted-foreground block'>Account Name</span>
                  <span className='font-bold text-foreground text-sm'>
                    {targetSocietyName} - Savings Pool
                  </span>
                </div>
              </div>

              <div className='flex justify-between items-center pt-1'>
                <div>
                  <span className='text-xs text-muted-foreground block'>Account Number</span>
                  <span className='font-mono font-extrabold text-xl text-primary'>
                    {accountNumber}
                  </span>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleCopyAccount(accountNumber, 'Account Number')}
                  className='cursor-pointer'
                >
                  {isCopied ? (
                    <IconCheck className='h-4 w-4 text-emerald-600' />
                  ) : (
                    <IconCopy className='h-4 w-4' />
                  )}
                  {isCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className='rounded-lg bg-muted/50 p-3.5 flex items-start gap-3 text-xs text-muted-foreground'>
              <IconInfoCircle className='h-4 w-4 text-primary shrink-0 mt-0.5' />
              <p>
                Transfer exact amount <strong>₦{amount.toLocaleString()}</strong>. Your payment will automatically reconcile with the society ledger in under 2 minutes.
              </p>
            </div>

            <Button
              onClick={() => handleConfirmPayment('bank_transfer')}
              disabled={loading}
              className='w-full cursor-pointer font-semibold'
            >
              {loading ? 'Confirming...' : 'I Have Completed Bank Transfer'}
            </Button>
          </TabsContent>

          {/* 2. USSD Code Channel */}
          <TabsContent value='ussd' className='space-y-4 pt-2'>
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Select Your Bank</Label>
              <div className='grid grid-cols-3 gap-2'>
                {USSD_BANKS.map((b) => (
                  <Button
                    key={b.name}
                    type='button'
                    variant={selectedUssdBank.name === b.name ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedUssdBank(b)}
                    className='text-xs cursor-pointer justify-start'
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className='rounded-xl border bg-card p-5 space-y-3 text-center shadow-2xs'>
              <span className='text-xs text-muted-foreground block'>
                Dial this code on your mobile phone (No Internet Required):
              </span>
              <div className='p-3 bg-muted rounded-lg font-mono font-bold text-lg text-primary tracking-wide break-all select-all'>
                {generatedUssdCode}
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleCopyAccount(generatedUssdCode, 'USSD Code')}
                className='cursor-pointer mx-auto'
              >
                <IconCopy className='mr-2 h-4 w-4' />
                Copy USSD String
              </Button>
            </div>

            <div className='rounded-lg bg-muted/50 p-3.5 flex items-start gap-3 text-xs text-muted-foreground'>
              <IconInfoCircle className='h-4 w-4 text-primary shrink-0 mt-0.5' />
              <p>
                USSD allows offline members to pay directly using feature phones or basic mobile networks.
              </p>
            </div>

            <Button
              onClick={() => handleConfirmPayment('ussd')}
              disabled={loading}
              className='w-full cursor-pointer font-semibold'
            >
              {loading ? 'Confirming...' : 'I Have Dialed & Paid via USSD'}
            </Button>
          </TabsContent>

          {/* 3. Agent / POS Deposit Channel */}
          <TabsContent value='agent' className='space-y-4 pt-2'>
            <div className='rounded-xl border bg-card p-5 space-y-4 shadow-2xs'>
              <div className='flex justify-between items-center border-b pb-3'>
                <div>
                  <span className='text-xs text-muted-foreground block'>Nearest Registered Agent</span>
                  <span className='font-bold text-foreground text-sm'>
                    Victoria Island Thrift Hub (14 Adeola Odeku St)
                  </span>
                </div>
              </div>

              <div className='flex justify-between items-center border-b pb-3'>
                <div>
                  <span className='text-xs text-muted-foreground block'>Agent Deposit Code</span>
                  <span className='font-mono font-bold text-base text-primary'>
                    AGENT-LAGOS-092
                  </span>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleCopyAccount('AGENT-LAGOS-092', 'Agent Code')}
                  className='cursor-pointer'
                >
                  <IconCopy className='h-4 w-4' />
                </Button>
              </div>

              <div className='text-xs text-muted-foreground space-y-1'>
                <p>1. Visit any registered CoopShot POS Agent in your community.</p>
                <p>2. Give them cash <strong>₦{amount.toLocaleString()}</strong> and Agent Code <strong>AGENT-LAGOS-092</strong>.</p>
                <p>3. Agent prints a physical receipt with digital SMS confirmation.</p>
              </div>
            </div>

            <Button
              onClick={() => handleConfirmPayment('agent')}
              disabled={loading}
              className='w-full cursor-pointer font-semibold'
            >
              {loading ? 'Confirming...' : 'Simulate POS Agent Deposit'}
            </Button>
          </TabsContent>

          {/* 4. Cash to Cooperative Officer Channel */}
          <TabsContent value='cash' className='space-y-4 pt-2'>
            <div className='space-y-4 rounded-xl border bg-card p-5 shadow-2xs'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Select Receiving Executive Officer</Label>
                <div className='space-y-2'>
                  {['Adaora Nwosu (Treasurer)', 'Emeka Okonkwo (Secretary)'].map((off) => (
                    <div
                      key={off}
                      onClick={() => setSelectedOfficer(off)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer text-sm font-medium transition-colors ${
                        selectedOfficer === off
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-background'
                      }`}
                    >
                      <span>{off}</span>
                      {selectedOfficer === off && <IconCheck className='h-4 w-4 text-primary' />}
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='receipt_note' className='text-sm font-medium'>
                  Optional Physical Receipt / Note
                </Label>
                <Input
                  id='receipt_note'
                  placeholder='e.g. Handed cash during monthly meeting #04'
                  value={cashReceiptNote}
                  onChange={(e) => setCashReceiptNote(e.target.value)}
                />
              </div>
            </div>

            <div className='rounded-lg bg-muted/50 p-3.5 flex items-start gap-3 text-xs text-muted-foreground'>
              <IconIdBadge2 className='h-4 w-4 text-primary shrink-0 mt-0.5' />
              <p>
                Physical cash handed over to officers requires digital sign-off from the receiving treasurer to update your Financial Passport rating.
              </p>
            </div>

            <Button
              onClick={() => handleConfirmPayment('cash')}
              disabled={loading}
              className='w-full cursor-pointer font-semibold'
            >
              {loading ? 'Submitting...' : 'Record Cash Payment to Officer'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
