'use client';

import { InvestmentCycle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconBuildingBank, IconTrendingUp, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';

interface CommunityWealthWidgetProps {
  societyId: string | number;
  cycle: InvestmentCycle;
}

export function CommunityWealthWidget({
  societyId,
  cycle,
}: CommunityWealthWidgetProps) {
  return (
    <Card className='border bg-card shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-primary/10 text-primary'>
            <IconBuildingBank className='h-5 w-5' />
          </div>
          <div>
            <CardTitle className='text-base font-bold'>Community Wealth</CardTitle>
            <p className='text-xs text-muted-foreground'>5%+ T-Bill Investment Pool</p>
          </div>
        </div>
        <Badge variant='outline' className='font-medium'>
          {cycle.allocation_percentage}% Allocated
        </Badge>
      </CardHeader>

      <CardContent className='space-y-4 pt-2'>
        <div className='grid grid-cols-2 gap-4 border-y py-3 text-sm'>
          <div>
            <span className='text-xs text-muted-foreground block'>Invested Capital</span>
            <span className='text-lg font-bold text-foreground'>
              ₦{cycle.principal_amount.toLocaleString()}
            </span>
          </div>
          <div>
            <span className='text-xs text-muted-foreground block'>Projected Yield</span>
            <span className='text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
              <IconTrendingUp className='h-4 w-4' />
              +₦{cycle.expected_returns.toLocaleString()}
            </span>
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 pt-1'>
          <span className='text-xs text-muted-foreground'>
            Matures: {cycle.maturity_date}
          </span>

          <Button asChild size='sm' className='gap-1 font-medium'>
            <Link href={`/dashboard/societies/${societyId}/wealth`}>
              View Details <IconArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
