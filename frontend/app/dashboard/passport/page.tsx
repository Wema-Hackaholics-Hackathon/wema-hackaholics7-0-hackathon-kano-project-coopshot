import { getFinancialPassport } from '@/app/actions/passport';
import { FinancialPassportCard } from '@/components/financial-passport-card';

export const metadata = {
  title: 'Financial Passport | CoopShot',
  description: 'Your portable financial reputation and trust profile.',
};

export default async function FinancialPassportPage() {
  const passport = await getFinancialPassport();

  return (
    <div className='p-6 md:p-8 space-y-6'>
      <FinancialPassportCard passport={passport} />
    </div>
  );
}
