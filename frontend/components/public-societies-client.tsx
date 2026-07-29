// components/public-societies-client.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { getPublicSocieties } from '@/app/actions/societies';
import { SocietyCards } from './society-cards';
import { SkeletonCards } from './skeleton-cards';
import { PaginationControls } from './pagination-controls';
import { SearchInput } from './search-input';
import { useState } from 'react';

type PublicSocietiesResult = {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
};

export function PublicSocietiesClient() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get('search')?.trim() || '';
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState<PublicSocietiesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getPublicSocieties({ search, page });
        setResult(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load public societies:', err);
        setError(err.message || 'Failed to load societies');
        setResult(null);
      }
    });
  }, [search, page]);

  const isLoading = isPending || result === null;

  return (
    <>
      <SearchInput placeholder='Search public societies...' />

      <div className='mt-6'>
        {isLoading ? (
          <SkeletonCards count={6} />
        ) : error ? (
          <div className='text-center py-12 text-muted-foreground'>
            <p className='text-lg font-medium text-foreground'>{error}</p>
            <p className='text-sm mt-2'>Please try again later.</p>
          </div>
        ) : result?.data.length === 0 ? (
          <div className='text-center py-12 text-muted-foreground'>
            <p className='text-lg'>
              {search
                ? `No societies found for "${search}"`
                : 'No public societies available yet.'}
            </p>
            <p className='text-sm mt-2'>
              {search ? 'Try a different search term.' : 'Check back later!'}
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
          pageParam='page' // default for public browse
        />
      )}
    </>
  );
}
