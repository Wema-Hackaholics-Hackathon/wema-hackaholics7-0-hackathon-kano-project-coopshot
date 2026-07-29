'use client';

import { FinancialPassport } from '@/types';
import { MOCK_ACTIVE_SOCIETIES } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconBuildingBank,
  IconTrendingUp,
  IconIdBadge2,
  IconPlus,
  IconShoppingBag,
} from '@tabler/icons-react';
import { MakeContributionModal } from '@/components/make-contribution-modal';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardActivityWidgetProps {
  passport: FinancialPassport;
}

export function DashboardActivityWidget({ passport }: DashboardActivityWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <Card className='border bg-card p-6 shadow-xs transition-shadow hover:shadow-md space-y-5'>
        <div className='flex items-center justify-between'>
          <h3 className='text-base font-bold tracking-tight text-foreground'>
            Your Activity Summary
          </h3>
          <Badge variant='outline' className='text-[11px] font-normal text-muted-foreground'>
            Real-time Sync
          </Badge>
        </div>

        <div className='space-y-3.5 text-sm'>
          <motion.div
            whileHover={{ x: 3 }}
            className='flex items-center justify-between p-2.5 rounded-lg bg-muted/40 transition-colors'
          >
            <div className='flex items-center gap-2.5'>
              <div className='p-1.5 rounded-md bg-primary/10 text-primary'>
                <IconBuildingBank className='h-4 w-4' />
              </div>
              <span className='text-muted-foreground text-xs font-medium'>
                Active Societies
              </span>
            </div>
            <span className='font-bold text-foreground'>
              {passport.verified_cooperatives_count} Joined
            </span>
          </motion.div>

          <motion.div
            whileHover={{ x: 3 }}
            className='flex items-center justify-between p-2.5 rounded-lg bg-muted/40 transition-colors'
          >
            <div className='flex items-center gap-2.5'>
              <div className='p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                <IconTrendingUp className='h-4 w-4' />
              </div>
              <span className='text-muted-foreground text-xs font-medium'>
                Total Savings Pool
              </span>
            </div>
            <span className='font-bold text-emerald-600 dark:text-emerald-400'>
              ₦{passport.total_savings.toLocaleString()}
            </span>
          </motion.div>

          <motion.div
            whileHover={{ x: 3 }}
            className='flex items-center justify-between p-2.5 rounded-lg bg-muted/40 transition-colors'
          >
            <div className='flex items-center gap-2.5'>
              <div className='p-1.5 rounded-md bg-primary/10 text-primary'>
                <IconIdBadge2 className='h-4 w-4' />
              </div>
              <span className='text-muted-foreground text-xs font-medium'>
                Trust Rank
              </span>
            </div>
            <span className='font-bold text-primary'>
              {passport.trust_level.split('—')[0]}
            </span>
          </motion.div>
        </div>

        {/* Quick Deposit Trigger & Opportunities Button */}
        <div className='pt-2 border-t flex flex-col gap-2'>
          <MakeContributionModal
            cooperatives={MOCK_ACTIVE_SOCIETIES}
            trigger={
              <Button className='w-full cursor-pointer gap-2 font-medium shadow-2xs transition-transform active:scale-95'>
                <IconPlus className='h-4 w-4' /> Make Fast Deposit
              </Button>
            }
          />

          <Button
            asChild
            variant='outline'
            className='w-full cursor-pointer gap-2 text-xs font-medium'
          >
            <Link href='/dashboard/opportunities'>
              <IconShoppingBag className='h-3.5 w-3.5 text-primary' /> Explore Opportunities Marketplace
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
