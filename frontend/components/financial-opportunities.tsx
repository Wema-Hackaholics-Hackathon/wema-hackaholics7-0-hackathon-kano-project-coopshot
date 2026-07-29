'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FinancialOpportunity } from '@/types';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  IconBuildingBank,
  IconLock,
  IconCheck,
  IconSparkles,
  IconBuildingStore,
  IconIdBadge2,
  IconPigMoney,
  IconArrowUpRight,
  IconInfoCircle,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface FinancialOpportunitiesProps {
  opportunities: FinancialOpportunity[];
}

export function FinancialOpportunities({
  opportunities,
}: FinancialOpportunitiesProps) {
  const [selectedOpp, setSelectedOpp] = useState<FinancialOpportunity | null>(
    null
  );

  const handleApply = (opp: FinancialOpportunity) => {
    if (opp.status === 'locked') {
      toast.error('Opportunity Locked', {
        description: `This product requires ${opp.required_level}. Keep building your Financial Passport consistency to unlock!`,
      });
      return;
    }

    toast.success('Access Request Initiated', {
      description: `Your application for ${opp.title} has been routed to your cooperative executive board.`,
    });
    setSelectedOpp(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'investment':
        return <IconBuildingBank className='h-5 w-5 text-primary' />;
      case 'credit':
        return <IconSparkles className='h-5 w-5 text-primary' />;
      case 'insurance':
        return <IconIdBadge2 className='h-5 w-5 text-primary' />;
      case 'sme':
        return <IconBuildingStore className='h-5 w-5 text-primary' />;
      case 'pension':
        return <IconPigMoney className='h-5 w-5 text-primary' />;
      default:
        return <IconSparkles className='h-5 w-5 text-primary' />;
    }
  };

  return (
    <div className='space-y-8 max-w-5xl mx-auto'>
      {/* Header Banner - Clean Minimalist Style */}
      <div className='rounded-xl border bg-card p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='space-y-3 max-w-2xl'>
          <div className='inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary'>
            <IconSparkles className='h-3.5 w-3.5' />
            Financial Opportunities Marketplace
          </div>
          <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
            Unlocked Products & Services
          </h1>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            Your participation in CoopShot cooperative societies builds a verifiable Financial Passport. As your reputation grows, formal financial products automatically unlock.
          </p>
        </div>
        <Image
          src='/illustrations/undraw_budgeting_klon.svg'
          alt='Financial Marketplace'
          width={180}
          height={140}
          className='h-32 w-auto shrink-0 hidden sm:block'
        />
      </div>

      {/* Opportunities Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {opportunities.map((opp, idx) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            whileHover={{ y: -3 }}
            className='flex flex-col'
          >
            <Card
              className={`flex flex-col justify-between h-full transition-all hover:border-primary/50 shadow-xs ${
                opp.status === 'locked' ? 'bg-muted/30 opacity-90' : 'bg-card'
              }`}
            >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between gap-3'>
                <div className='p-2.5 rounded-lg bg-primary/10 shrink-0'>
                  {getCategoryIcon(opp.category)}
                </div>
                <div className='flex items-center gap-2'>
                  {opp.status === 'active' && (
                    <Badge variant='default' className='text-xs font-medium'>
                      ✓ Active
                    </Badge>
                  )}
                  {opp.status === 'unlocked' && (
                    <Badge variant='secondary' className='text-xs font-medium'>
                      Unlocked
                    </Badge>
                  )}
                  {opp.status === 'locked' && (
                    <Badge variant='outline' className='text-xs font-medium gap-1 text-muted-foreground'>
                      <IconLock className='h-3 w-3' />
                      Locked
                    </Badge>
                  )}
                </div>
              </div>

              <CardTitle className='text-lg font-bold text-foreground mt-3'>
                {opp.title}
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                {opp.description}
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4 pt-0 flex-1 flex flex-col justify-end'>
              <div className='space-y-2 pt-3 border-t text-xs'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Requirement:</span>
                  <span className='font-semibold text-foreground'>
                    {opp.required_level}
                  </span>
                </div>

                {opp.interest_rate_or_yield && (
                  <div className='flex justify-between text-muted-foreground'>
                    <span>Yield / Interest:</span>
                    <span className='font-semibold text-primary'>
                      {opp.interest_rate_or_yield}
                    </span>
                  </div>
                )}

                {opp.max_limit && (
                  <div className='flex justify-between text-muted-foreground'>
                    <span>Capacity Limit:</span>
                    <span className='font-semibold text-foreground'>
                      {opp.max_limit}
                    </span>
                  </div>
                )}
              </div>

              <div className='pt-2 flex items-center justify-between gap-2'>
                <span className='text-xs text-muted-foreground truncate max-w-50'>
                  Partner: {opp.partner_name || 'CoopShot Network'}
                </span>
                <Button
                  size='sm'
                  variant={opp.status === 'locked' ? 'outline' : 'default'}
                  onClick={() => setSelectedOpp(opp)}
                  className='cursor-pointer text-xs font-medium shrink-0'
                >
                  View Details <IconArrowUpRight className='ml-1 h-3.5 w-3.5' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

      {/* Opportunity Detail Dialog */}
      {selectedOpp && (
        <Dialog open={Boolean(selectedOpp)} onOpenChange={() => setSelectedOpp(null)}>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={selectedOpp.status === 'locked' ? 'outline' : 'default'}
                  className='text-xs'
                >
                  {selectedOpp.status.toUpperCase()}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {selectedOpp.required_level}
                </span>
              </div>
              <DialogTitle className='text-xl font-bold mt-2'>
                {selectedOpp.title}
              </DialogTitle>
              <DialogDescription className='text-sm mt-1'>
                {selectedOpp.description}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4 text-sm'>
              <div className='rounded-lg border bg-muted/40 p-4 space-y-2.5'>
                <div className='flex justify-between text-muted-foreground text-xs'>
                  <span>Institutional Partner:</span>
                  <span className='font-semibold text-foreground'>
                    {selectedOpp.partner_name}
                  </span>
                </div>
                {selectedOpp.interest_rate_or_yield && (
                  <div className='flex justify-between text-muted-foreground text-xs'>
                    <span>Interest / Return Rate:</span>
                    <span className='font-semibold text-primary'>
                      {selectedOpp.interest_rate_or_yield}
                    </span>
                  </div>
                )}
                {selectedOpp.max_limit && (
                  <div className='flex justify-between text-muted-foreground text-xs'>
                    <span>Maximum Available Limit:</span>
                    <span className='font-semibold text-foreground'>
                      {selectedOpp.max_limit}
                    </span>
                  </div>
                )}
              </div>

              <div className='space-y-1.5'>
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Member Benefit Summary
                </span>
                <p className='text-sm text-foreground bg-card p-3 rounded-lg border'>
                  {selectedOpp.benefit_summary}
                </p>
              </div>

              {selectedOpp.status === 'locked' && (
                <div className='rounded-lg bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300'>
                  <IconInfoCircle className='h-4 w-4 shrink-0 mt-0.5' />
                  <p>
                    This opportunity is currently locked. To unlock it, maintain 90%+ monthly savings consistency and reach <strong>{selectedOpp.required_level}</strong>.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                onClick={() => setSelectedOpp(null)}
                className='cursor-pointer'
              >
                Close
              </Button>

              <Button
                onClick={() => handleApply(selectedOpp)}
                disabled={selectedOpp.status === 'locked'}
                className='cursor-pointer font-medium'
              >
                {selectedOpp.status === 'active'
                  ? 'Manage Active Investment'
                  : selectedOpp.status === 'unlocked'
                  ? 'Access Product'
                  : 'Locked'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
