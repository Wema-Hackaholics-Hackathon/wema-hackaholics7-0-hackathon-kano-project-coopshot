import { getFinancialOpportunities } from '@/app/actions/opportunities';
import { FinancialOpportunities } from '@/components/financial-opportunities';

export const metadata = {
  title: 'Financial Opportunities | CoopShot',
  description: 'Unlocked institutional products based on your Financial Passport.',
};

export default async function FinancialOpportunitiesPage() {
  const opportunities = await getFinancialOpportunities();

  return (
    <div className='p-6 md:p-8 space-y-6'>
      <FinancialOpportunities opportunities={opportunities} />
    </div>
  );
}
