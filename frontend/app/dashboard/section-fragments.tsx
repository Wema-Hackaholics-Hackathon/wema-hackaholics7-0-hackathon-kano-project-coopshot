// app/dashboard/section-fragments.tsx

import { Suspense } from 'react';
import { SocietyCards } from '@/components/society-cards';
import {
  getRecommendedSocieties,
  getPublicSocieties,
} from '../actions/societies';
import { SearchInput } from '@/components/search-input';
import { PaginationControls } from '@/components/pagination-controls';
import { headers } from 'next/headers';

export async function RecommendedSection() {
  const result = await getRecommendedSocieties();
  return <SocietyCards societies={result.data || []} />;
}

export async function PublicSocietiesSection() {
  const headersList = await headers();
  const searchParams = new URLSearchParams(
    headersList.get('x-search-params') || ''
  );
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const result = await getPublicSocieties({ search, page }); // default empty
  return (
    <>
      <SearchInput placeholder='Search public societies...' />
      <div className='mt-4'>
        <SocietyCards societies={result.data || []} />
      </div>
      {/* Pagination can be added later */}

      <PaginationControls
        currentPage={result.current_page || 1}
        lastPage={result.last_page || 1}
        total={result.total}
      />
    </>
  );
}
