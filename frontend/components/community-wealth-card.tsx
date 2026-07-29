'use client';

import { useState } from 'react';
import { InvestmentCycle, SocietyProps } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  IconBuildingBank,
  IconTrendingUp,
  IconCheck,
  IconClock,
  IconPlus,
  IconInfoCircle,
  IconIdBadge2,
  IconAlertCircle,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { startInvestmentCycle } from '@/app/actions/investment';

interface CommunityWealthCardProps {
  society: SocietyProps;
  cycle: InvestmentCycle;
}

export function CommunityWealthCard({
  society,
  cycle: initialCycle,
}: CommunityWealthCardProps) {
  const [cycle, setCycle] = useState<InvestmentCycle>(initialCycle);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocationPercentage, setAllocationPercentage] = useState<number>(
    cycle.allocation_percentage || 5
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canManage = society.can_manage ?? false;

  // Calculate dynamic preview stats based on percentage input
  const totalAssets = cycle.total_pool_assets ?? 0;
  const previewPrincipal = (totalAssets * Math.max(0, allocationPercentage)) / 100;
  const previewExpectedYield = Math.round((previewPrincipal * 0.175 * 91) / 365);

  const handlePercentageChange = (val: number) => {
    setAllocationPercentage(val);
    if (val < 5) {
      setErrorMsg('Minimum Treasury Bill allocation is 5%');
    } else {
      setErrorMsg(null);
    }
  };

  const handleStartCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allocationPercentage < 5) {
      setErrorMsg('Minimum Treasury Bill allocation is 5%');
      return;
    }

    setLoading(true);
    try {
      const res = await startInvestmentCycle(
        String(society.id),
        allocationPercentage
      );

      if (!res.success) {
        toast.error(res.message);
        setErrorMsg(res.message);
        return;
      }

      toast.success('Investment Cycle Started', {
        description: res.message,
      });

      setCycle((prev) => ({
        ...prev,
        allocation_percentage: allocationPercentage,
        principal_amount: previewPrincipal,
        expected_returns: previewExpectedYield,
        status: 'active',
      }));

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start investment cycle';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-8 max-w-5xl mx-auto'>
      {/* Header Banner - Clean Minimalist Style */}
      <div className='rounded-xl border bg-card p-6 sm:p-8 shadow-sm space-y-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='space-y-2'>
            <div className='inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary'>
              <IconBuildingBank className='h-3.5 w-3.5' />
              Community Wealth & 5%+ Investment Pool
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              National Treasury Bill Engine
            </h1>
            <p className='text-sm text-muted-foreground max-w-xl'>
              Automating the allocation of executive-configured group liquidity ({cycle.allocation_percentage}% min requirement) into risk-free government securities.
            </p>
          </div>

          {canManage && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className='font-medium shadow-xs cursor-pointer'>
                  <IconPlus className='mr-2 h-4 w-4' />
                  Start Investment Cycle
                </Button>
              </DialogTrigger>

              <DialogContent className='sm:max-w-md'>
                <form onSubmit={handleStartCycle}>
                  <DialogHeader>
                    <DialogTitle>Launch Treasury Bill Cycle</DialogTitle>
                    <DialogDescription>
                      Allocate a portion of society assets into a 91-Day National Treasury Bill. Minimum allocation requirement is <strong>5%</strong>.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-5 py-4'>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center text-sm'>
                        <Label htmlFor='percentage'>Allocation Percentage (%)</Label>
                        <span className='text-xs text-muted-foreground font-medium'>
                          Minimum: 5%
                        </span>
                      </div>
                      <Input
                        id='percentage'
                        type='number'
                        min={5}
                        max={50}
                        step={1}
                        value={allocationPercentage}
                        onChange={(e) => handlePercentageChange(Number(e.target.value))}
                        className={errorMsg ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {errorMsg && (
                        <p className='text-xs text-destructive font-medium flex items-center gap-1 mt-1'>
                          <IconAlertCircle className='h-3.5 w-3.5' />
                          {errorMsg}
                        </p>
                      )}
                    </div>

                    {/* Calculation Preview Box */}
                    <div className='rounded-lg border bg-muted/40 p-4 space-y-2.5 text-sm'>
                      <div className='flex justify-between text-muted-foreground'>
                        <span>Total Society Liquidity:</span>
                        <span className='font-semibold text-foreground'>
                          ₦{totalAssets.toLocaleString()}
                        </span>
                      </div>
                      <div className='flex justify-between text-muted-foreground'>
                        <span>Calculated Capital ({allocationPercentage}%):</span>
                        <span className='font-semibold text-primary'>
                          ₦{previewPrincipal.toLocaleString()}
                        </span>
                      </div>
                      <div className='flex justify-between text-muted-foreground pt-2 border-t'>
                        <span>Annualized Yield Rate:</span>
                        <span className='font-semibold text-foreground'>17.5% p.a.</span>
                      </div>
                      <div className='flex justify-between text-muted-foreground'>
                        <span>Projected 91-Day Return:</span>
                        <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                          +₦{previewExpectedYield.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsModalOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={loading || Boolean(errorMsg)}
                      className='cursor-pointer'
                    >
                      {loading ? 'Launching...' : 'Confirm & Launch Cycle'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Pool Assets */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Total Society Assets</CardDescription>
            <CardTitle className='text-2xl font-bold text-foreground'>
              ₦{totalAssets.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Combined contributions pool
            </p>
          </CardContent>
        </Card>

        {/* Executive Allocation % */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Executive Allocation</CardDescription>
            <CardTitle className='text-2xl font-bold text-primary flex items-center justify-between'>
              <span>{cycle.allocation_percentage}%</span>
              <Badge variant='outline' className='text-xs font-normal'>
                Min 5% Enforced
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              ₦{cycle.principal_amount.toLocaleString()} invested
            </p>
          </CardContent>
        </Card>

        {/* Annual Yield */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Annual Yield Rate</CardDescription>
            <CardTitle className='text-2xl font-bold text-foreground flex items-center gap-1'>
              <IconTrendingUp className='h-5 w-5 text-primary' />
              {cycle.annual_yield_rate}% p.a.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              {cycle.tenor_days}-Day Govt Treasury Bill
            </p>
          </CardContent>
        </Card>

        {/* Projected Returns */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Projected Yield Returns</CardDescription>
            <CardTitle className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
              +₦{cycle.expected_returns.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-xs text-muted-foreground'>
              Maturity: {cycle.maturity_date}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Investment Cycle Timeline */}
      <Card className='shadow-sm'>
        <CardHeader>
          <div className='flex items-center justify-between flex-wrap gap-2'>
            <div>
              <CardTitle className='text-lg font-bold flex items-center gap-2'>
                <IconClock className='h-5 w-5 text-primary' />
                Active Investment Cycle Timeline
              </CardTitle>
              <CardDescription>
                Progress tracking from pool reservation to final maturity and yield credit.
              </CardDescription>
            </div>
            <Badge variant='secondary' className='px-3 py-1 font-medium capitalize'>
              Status: {cycle.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border'>
            {cycle.milestones.map((milestone) => (
              <div key={milestone.stage} className='relative flex items-start gap-4 group'>
                {/* Node */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                    milestone.completed
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-muted-foreground/40'
                  }`}
                >
                  {milestone.completed ? (
                    <IconCheck className='h-3.5 w-3.5' />
                  ) : (
                    milestone.stage
                  )}
                </div>

                {/* Card Content */}
                <div className='flex-1 space-y-1 bg-card p-4 rounded-lg border shadow-2xs'>
                  <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <h5 className='font-semibold text-sm text-foreground flex items-center gap-2'>
                      {milestone.title}
                    </h5>
                    <Badge variant='outline' className='text-xs text-muted-foreground'>
                      {milestone.date}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Callout */}
      <div className='rounded-xl border bg-muted/50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4'>
        <div className='p-2.5 rounded-lg bg-background border text-primary shrink-0'>
          <IconIdBadge2 className='h-5 w-5' />
        </div>
        <div>
          <h4 className='font-semibold text-foreground text-base'>
            Zero Disturbance to Core Cooperative Liquidity
          </h4>
          <p className='text-sm text-muted-foreground mt-1'>
            The remaining 95% (or executive-configured balance) of pool funds remains 100% liquid for monthly member rotations, emergency loans, and member payouts.
          </p>
        </div>
      </div>
    </div>
  );
}
