// components/recommended-societies-client.tsx
'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { getRecommendedSocieties } from '@/app/actions/societies';
import { SocietyCards } from './society-cards';
import { SkeletonCards } from './skeleton-cards';
import { PaginationControls } from './pagination-controls';
import { useState } from 'react';

type RecommendedResult = {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
};

export function RecommendedSocietiesClient() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const page = Number(searchParams.get('rec_page')) || 1;

  const [result, setResult] = useState<RecommendedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        // Use your existing server action — automatically includes auth + caching
        const data = await getRecommendedSocieties({ page });

        setResult(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load recommended societies:', err);
        setError(err.message || 'Failed to load societies');
        setResult(null);
      }
    });
  }, [page]);

  const isLoading = isPending || result === null;

  return (
    <>
      <div className='mt-6'>
        {isLoading ? (
          <SkeletonCards count={4} />
        ) : error ? (
          <div className='flex flex-col items-center justify-center py-12 text-center bg-card/60 rounded-xl border p-8 shadow-2xs'>
            <Image
              src='/illustrations/undraw_refresh_szfn.svg'
              alt='Connection error'
              width={180}
              height={130}
              className='mb-4 h-28 w-auto opacity-85'
            />
            <p className='text-base font-semibold text-foreground mb-1'>{error}</p>
            <p className='text-xs text-muted-foreground'>Please ensure backend service is active and refresh.</p>
          </div>
        ) : result?.data.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center bg-card/60 rounded-xl border p-8 shadow-2xs'>
            <Image
              src='/illustrations/undraw_join_niai.svg'
              alt='No recommended societies'
              width={200}
              height={140}
              className='mb-4 h-32 w-auto opacity-90'
            />
            <h3 className='text-lg font-bold text-foreground mb-1'>No Recommended Societies</h3>
            <p className='text-muted-foreground text-sm max-w-sm leading-relaxed'>
              We couldn&apos;t find personalized recommendations right now. Explore public societies below or create your own!
            </p>
          </div>
        ) : (
          <SocietyCards societies={result.data} />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && result && result.last_page > 1 && (
        <PaginationControls
          currentPage={result.current_page}
          lastPage={result.last_page}
          total={result.total}
          pageParam='rec_page'
        />
      )}
    </>
  );
}
