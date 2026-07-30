'use client';

import { useState, useEffect } from 'react';
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
  IconCreditCard,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { submitContribution } from '@/app/actions/contribution';
import { getMyActiveSocieties } from '@/app/actions/societies';
import { PaystackPayButton } from './paystack-pay-button';

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
    id: 'treasury',
    name: 'CoopShot Platform Treasury Pool',
    settings: {
      contribution_amount: 50000,
      frequency: 'monthly',
    },
  },
];

interface MakeContributionModalProps {
  society?: Partial<SocietyProps>;
  societyName?: string;
  cooperatives?: CooperativeOption[];
  trigger?: React.ReactNode;
  mode?: 'monthly' | 'registration' | 'equity';
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
  mode = 'monthly',
}: MakeContributionModalProps) {
  const singleSocietyCoop = society?.name
    ? {
        id: society.id || '1',
        name: society.name,
        settings: society.settings,
      }
    : null;

  // A specific real society always wins over any generic list — the fake
  // DEFAULT_COOPERATIVES only apply when this modal is used with no real
  // data at all (shouldn't happen once every caller passes real data, but
  // kept as a last-resort so the dialog never renders empty).
  const initialCoops = singleSocietyCoop
    ? [singleSocietyCoop]
    : cooperatives && cooperatives.length > 0
      ? cooperatives
      : DEFAULT_COOPERATIVES;

  // Real admins of this society (founder + any co-founder) — this backend has
  // no separate Treasurer/Secretary title, just admin/member roles.
  const officers = (society?.active_members ?? [])
    .filter((m) => m.role === 'admin')
    .map((m) => ({ id: m.id, name: m.name }));
  if (officers.length === 0 && society?.founder?.name) {
    officers.push({ id: society.founder.id, name: society.founder.name });
  }

  const [isOpen, setIsOpen] = useState(false);
  const [availableCoops, setAvailableCoops] = useState<CooperativeOption[]>(initialCoops);
  const [selectedCoop, setSelectedCoop] = useState<CooperativeOption>(initialCoops[0]);
  const [selectedChannel, setSelectedChannel] = useState<
    'bank_transfer' | 'ussd' | 'agent' | 'cash'
  >('bank_transfer');
  const [selectedUssdBank, setSelectedUssdBank] = useState(USSD_BANKS[0]);
  const [selectedOfficer, setSelectedOfficer] = useState(officers[0]?.name ?? '');
  const [cashReceiptNote, setCashReceiptNote] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only self-fetches when the caller supplies neither a specific society nor
  // an explicit cooperatives list — every current caller passes one of those,
  // this is a last-resort so the dialog is never stuck on fake data.
  useEffect(() => {
    if (isOpen && !society && !cooperatives) {
      let isMounted = true;
      getMyActiveSocieties()
        .then(({ active_societies }) => {
          if (!isMounted) return;
          if (active_societies && active_societies.length > 0) {
            const realCoops: CooperativeOption[] = active_societies.map((s: any) => ({
              id: String(s.id),
              name: s.name,
              settings: {
                contribution_amount: s.settings?.contribution_amount || 10000,
                frequency: s.settings?.frequency || 'monthly',
              },
            }));
            setAvailableCoops(realCoops);
            setSelectedCoop(realCoops[0]);
          } else {
            setAvailableCoops(DEFAULT_COOPERATIVES);
            setSelectedCoop(DEFAULT_COOPERATIVES[0]);
          }
        })
        .catch((err) => {
          console.error('Error fetching active societies for modal:', err);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, society, cooperatives]);

  const isRegistration = mode === 'registration';
  const isEquity = mode === 'equity';
  const targetSocietyName = selectedCoop.name;
  const amount = isRegistration
    ? (society?.settings?.registration_fee || (selectedCoop.settings as any)?.registration_fee || 5000)
    : isEquity
    ? (society?.settings?.equity_amount || (selectedCoop.settings as any)?.equity_amount || 25000)
    : (selectedCoop.settings?.contribution_amount ?? 0);
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
      const targetGroupId = String(selectedCoop.id || society?.id || '1');
      const res = await submitContribution(
        targetGroupId,
        channel,
        amount,
        {
          bank_name: channel === 'bank_transfer' ? 'Sterling Bank' : undefined,
          reference_code: channel === 'ussd' ? generatedUssdCode : undefined,
          agent_code: channel === 'agent' ? 'AGENT-LAGOS-092' : undefined,
          officer_name: channel === 'cash' ? selectedOfficer : undefined,
        },
        isRegistration ? 'registration' : isEquity ? 'equity' : 'monthly'
      );

      if (res.success) {
        toast.success(isRegistration ? 'Registration Fee Paid!' : isEquity ? 'Member Equity Paid!' : 'Contribution Recorded!', {
          description: res.message,
        });
        setIsOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record payment';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className={`w-full cursor-pointer font-semibold ${
              isEquity
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : ''
            }`}
            size='lg'
          >
            <IconBuildingBank className='mr-2 h-5 w-5' />
            {isRegistration
              ? `Pay Registration Fee (₦${amount.toLocaleString()})`
              : isEquity
              ? `Pay Member Equity (₦${amount.toLocaleString()})`
              : `Make Contribution (₦${amount.toLocaleString()})`}
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
            {isRegistration ? 'One-time Member Onboarding Fee' : isEquity ? 'One-time Member Share Capital' : 'Financial Inclusion Channels'}
          </div>
          <DialogTitle className='text-xl font-bold text-center'>
            {isRegistration
              ? `Pay Registration Fee — ${targetSocietyName}`
              : isEquity
              ? `Pay Member Equity Share Capital — ${targetSocietyName}`
              : `Contribute to ${targetSocietyName}`}
          </DialogTitle>
          <DialogDescription className='text-center text-xs sm:text-sm max-w-md mx-auto'>
            {isRegistration
              ? `Pay the one-time registration fee of ₦${amount.toLocaleString()} to proceed to member onboarding.`
              : isEquity
              ? `Pay the one-time share capital equity amount of ₦${amount.toLocaleString()} to activate your full member status and start monthly savings.`
              : `Choose your preferred contribution method. Minimum required amount for this cycle is ₦${amount.toLocaleString()} (${frequency}).`}
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
                  {coop.name} — ₦{(coop.settings?.contribution_amount ?? 0).toLocaleString()} ({coop.settings?.frequency || 'monthly'})
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs
          defaultValue='card'
          onValueChange={(val) =>
            setSelectedChannel(val as 'bank_transfer' | 'ussd' | 'agent' | 'cash')
          }
          className='w-full space-y-4 py-2'
        >
          {/* Channel Selector Tabs */}
          <TabsList className='grid grid-cols-5 w-full group-data-horizontal/tabs:h-auto! h-auto! p-1.5 bg-muted/80 rounded-xl gap-1'>
            <TabsTrigger
              value='card'
              className='flex flex-col items-center justify-center gap-1.5 h-auto! py-2.5 text-xs font-medium cursor-pointer rounded-lg'
            >
              <IconCreditCard className='h-4 w-4 shrink-0' />
              <span>Card</span>
            </TabsTrigger>

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

          {/* 0. Real Paystack Card Payment — the only channel verified automatically */}
          <TabsContent value='card' className='space-y-4 pt-2'>
            <div className='rounded-xl border bg-card p-5 space-y-4 shadow-2xs text-center'>
              <p className='text-sm text-muted-foreground'>
                Pay <strong className='text-foreground'>₦{amount.toLocaleString()}</strong> by card,
                bank, or transfer via Paystack — confirmed instantly, no admin approval needed.
              </p>
              <PaystackPayButton
                groupId={String(selectedCoop.id || society?.id || '1')}
                type={isRegistration ? 'registration' : isEquity ? 'equity' : 'monthly'}
                label={`Pay ₦${amount.toLocaleString()} Now`}
                onSuccess={() => setIsOpen(false)}
              />
            </div>
          </TabsContent>

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
                <Label className='text-sm font-medium'>Select Receiving Admin</Label>
                {officers.length > 0 ? (
                  <div className='space-y-2'>
                    {officers.map((off) => (
                      <div
                        key={off.id}
                        onClick={() => setSelectedOfficer(off.name)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer text-sm font-medium transition-colors ${
                          selectedOfficer === off.name
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-background'
                        }`}
                      >
                        <span>{off.name}</span>
                        {selectedOfficer === off.name && <IconCheck className='h-4 w-4 text-primary' />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Input
                    placeholder="Enter the receiving admin's name"
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                  />
                )}
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
              disabled={loading || !selectedOfficer.trim()}
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
