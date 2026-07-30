'use client';

import Image from 'next/image';
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
          <div className='flex flex-col items-center justify-center py-12 text-center bg-card/60 rounded-xl border p-8 shadow-2xs'>
            <Image
              src='/illustrations/undraw_refresh_szfn.svg'
              alt='Error loading societies'
              width={180}
              height={130}
              className='mb-4 h-28 w-auto opacity-80'
            />
            <p className='text-base font-semibold text-foreground mb-1'>{error}</p>
            <p className='text-xs text-muted-foreground'>Please try refreshing the page later.</p>
          </div>
        ) : result?.data.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-14 text-center bg-card/60 rounded-xl border p-8 shadow-2xs'>
            <Image
              src={search ? '/illustrations/undraw_searching_pqji.svg' : '/illustrations/undraw_the-void_i26b.svg'}
              alt={search ? 'No search results' : 'No public societies'}
              width={search ? 210 : 180}
              height={search ? 150 : 130}
              className='mb-5 h-36 w-auto'
            />
            <h3 className='text-lg font-bold text-foreground mb-1'>
              {search ? `No societies found matching "${search}"` : 'No Public Societies Available'}
            </h3>
            <p className='text-sm text-muted-foreground max-w-sm leading-relaxed'>
              {search
                ? 'Try tweaking your search keywords or clearing the filter to see all public societies.'
                : 'There are no open public societies right now. Be the first to create one!'}
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

