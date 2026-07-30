// components/skeleton-cards.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardsProps {
  count?: number; // Optional, defaults to 8
}

export function SkeletonCards({ count = 8 }: SkeletonCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className='overflow-hidden'
        >
          <CardHeader className='pb-3'>
            <Skeleton className='h-5 w-3/4 rounded' />
            <Skeleton className='mt-2 h-3 w-full rounded' />
            <Skeleton className='mt-1 h-3 w-4/5 rounded' />
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-20 rounded' />
              <Skeleton className='h-8 w-16 rounded' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
