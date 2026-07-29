// components/recommended-societies-client.tsx
'use client';

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
          <div className='text-center py-10 text-muted-foreground'>
            <p>{error}</p>
            <p className='text-sm mt-2'>Try refreshing the page.</p>
          </div>
        ) : result?.data.length === 0 ? (
          <div className='text-center py-10 text-muted-foreground'>
            <p>No recommended societies available right now.</p>
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
