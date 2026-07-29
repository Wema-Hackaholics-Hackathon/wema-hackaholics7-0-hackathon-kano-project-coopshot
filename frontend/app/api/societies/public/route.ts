// app/api/societies/public/route.ts

import { NextRequest } from 'next/server';
import { apiFetch } from '@/lib/api';
import { MOCK_SOCIETIES } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  /* ORIGINAL BACKEND CALL:
  let endpoint = `/societies/public?page=${page}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  const res = await apiFetch(endpoint, { method: 'GET' }, true);
  const data = await res.json();
  return Response.json(data);
  */

  const filtered = search.trim()
    ? MOCK_SOCIETIES.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_SOCIETIES;

  return Response.json({
    data: filtered,
    current_page: page,
    last_page: 1,
    total: filtered.length,
  });
}
