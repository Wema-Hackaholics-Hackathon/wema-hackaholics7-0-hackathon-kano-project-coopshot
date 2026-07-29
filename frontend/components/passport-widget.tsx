'use client';

import { FinancialPassport } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconIdBadge2, IconAward, IconArrowRight, IconTrendingUp } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PassportWidgetProps {
  passport: FinancialPassport;
}

export function PassportWidget({ passport }: PassportWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      whileHover={{ y: -2 }}
    >
      <Card className='border bg-card shadow-xs transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div className='flex items-center gap-2.5'>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className='p-2 rounded-lg bg-primary/10 text-primary shrink-0'
            >
              <IconIdBadge2 className='h-5 w-5' />
            </motion.div>
            <div>
              <CardTitle className='text-base font-bold tracking-tight'>Financial Passport</CardTitle>
              <p className='text-xs text-muted-foreground'>Portable Reputation</p>
            </div>
          </div>
          <Badge variant='outline' className='font-medium text-xs py-0.5 px-2 bg-primary/5 text-primary border-primary/20'>
            {passport.trust_level.split('—')[0].trim()}
          </Badge>
        </CardHeader>

        <CardContent className='space-y-4 pt-2'>
          <div className='grid grid-cols-2 gap-4 border-y py-3.5 text-sm'>
            <div>
              <span className='text-xs text-muted-foreground block mb-1'>Consistency Score</span>
              <span className='text-lg font-bold text-primary flex items-center gap-1'>
                <IconTrendingUp className='h-4 w-4' />
                {passport.consistency_score}%
              </span>
            </div>
            <div>
              <span className='text-xs text-muted-foreground block mb-1'>Repayment Record</span>
              <span className='text-lg font-bold text-foreground'>
                {passport.repayment_score}%
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between gap-2 pt-1'>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <IconAward className='h-4 w-4 text-primary shrink-0' />
              <span>Verified in {passport.verified_cooperatives_count} Societies</span>
            </div>

            <Button asChild size='sm' className='gap-1 font-medium cursor-pointer transition-transform active:scale-95'>
              <Link href='/dashboard/passport'>
                View Passport <IconArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
