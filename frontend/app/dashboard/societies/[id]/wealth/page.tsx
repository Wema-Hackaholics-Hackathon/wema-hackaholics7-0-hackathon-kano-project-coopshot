import { notFound } from 'next/navigation';
import { getSociety } from '../../../../actions/societies';
import { getSocietyInvestmentCycle } from '../../../../actions/investment';
import { SocietyProps } from '@/types';
import SocietyHeader from '@/components/society-header';
import { CommunityWealthCard } from '@/components/community-wealth-card';

export default async function SocietyWealthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const society: SocietyProps = await getSociety(id);

  if (!society) {
    notFound();
  }

  const cycle = await getSocietyInvestmentCycle(id);

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header */}
      <SocietyHeader society={society} />

      {/* Main Content */}
      <div className='container max-w-7xl mx-auto px-6 py-8 flex-1'>
        <CommunityWealthCard society={society} cycle={cycle} />
      </div>
    </div>
  );
}
