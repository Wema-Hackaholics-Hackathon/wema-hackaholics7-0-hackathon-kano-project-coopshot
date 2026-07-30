export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getFinancialPassport } from '@/app/actions/passport';
import { getMyActiveSocieties } from '@/app/actions/societies';
import { FinancialPassportCard } from '@/components/financial-passport-card';

export const metadata = {
  title: 'Financial Passport | CoopShot',
  description: 'Your portable financial reputation and trust profile.',
};

export default async function FinancialPassportPage() {
  const [passport, { active_societies }] = await Promise.all([
    getFinancialPassport(),
    getMyActiveSocieties(),
  ]);

  return (
    <div className='p-6 md:p-8 space-y-6'>
      <FinancialPassportCard passport={passport} activeSocieties={active_societies} />
    </div>
  );
}
