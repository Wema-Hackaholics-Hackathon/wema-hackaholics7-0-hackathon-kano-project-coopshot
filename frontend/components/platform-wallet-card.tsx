'use client';

import { useState } from 'react';
import { FinancialPassport } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconWallet,
  IconEye,
  IconEyeOff,
  IconTrendingUp,
  IconBuildingBank,
  IconArrowUpRight,
} from '@tabler/icons-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PlatformWalletCardProps {
  passport: FinancialPassport;
}

export function PlatformWalletCard({ passport }: PlatformWalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const totalSavings = passport.total_savings || 750000;
  const investmentReturns = passport.total_investment_returns || 14500;
  const activeContributions = passport.total_contributions || 920000;
  const totalNetAssets = totalSavings + investmentReturns;

  const formatAmount = (amount: number) => {
    if (!showBalance) return '₦ ••••••••';
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className='border bg-card shadow-xs overflow-hidden space-y-4 p-6'>
        {/* Top Header Row */}
        <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
          <div className='flex items-center gap-3'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='p-2.5 rounded-xl bg-primary/10 text-primary shrink-0'
            >
              <IconWallet className='h-6 w-6' />
            </motion.div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
                  Total Aggregated Platform Assets
                </h2>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowBalance(!showBalance)}
                  className='text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer'
                  title={showBalance ? 'Hide Balance' : 'Show Balance'}
                >
                  {showBalance ? (
                    <IconEyeOff className='h-4 w-4' />
                  ) : (
                    <IconEye className='h-4 w-4' />
                  )}
                </motion.button>
              </div>

              <AnimatePresence mode='wait'>
                <motion.div
                  key={showBalance ? 'visible' : 'hidden'}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className='text-3xl font-extrabold tracking-tight text-foreground mt-0.5'
                >
                  {formatAmount(totalNetAssets)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='text-xs font-normal gap-1.5 py-1 px-3'
            >
              <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
              {passport.verified_cooperatives_count} Active Societies
            </Badge>

            <Button
              asChild
              size='sm'
              className='font-medium cursor-pointer transition-transform active:scale-95'
            >
              <Link href='/dashboard/passport'>
                View Passport <IconArrowUpRight className='ml-1 h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>

        {/* Asset Breakdown Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1'>
          {/* Cooperative Savings */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className='rounded-lg border bg-muted/30 p-3.5 space-y-1'
          >
            <div className='flex justify-between items-center text-xs text-muted-foreground'>
              <span>Cooperative Savings</span>
              <IconBuildingBank className='h-3.5 w-3.5 text-primary' />
            </div>
            <div className='text-lg font-bold text-foreground'>
              {formatAmount(totalSavings)}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Verified across societies
            </p>
          </motion.div>

          {/* Treasury Bill Yield */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className='rounded-lg border bg-muted/30 p-3.5 space-y-1'
          >
            <div className='flex justify-between items-center text-xs text-muted-foreground'>
              <span>T-Bill Investment Returns</span>
              <IconTrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
              {showBalance
                ? `+₦${investmentReturns.toLocaleString()}`
                : '₦ ••••••••'}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              5%+ Community Wealth Yield
            </p>
          </motion.div>

          {/* Total Lifetime Contributions */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className='rounded-lg border bg-muted/30 p-3.5 space-y-1'
          >
            <div className='flex justify-between items-center text-xs text-muted-foreground'>
              <span>Total Lifetime Pool History</span>
              <IconWallet className='h-3.5 w-3.5 text-primary' />
            </div>
            <div className='text-lg font-bold text-foreground'>
              {formatAmount(activeContributions)}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Processed & verified
            </p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
