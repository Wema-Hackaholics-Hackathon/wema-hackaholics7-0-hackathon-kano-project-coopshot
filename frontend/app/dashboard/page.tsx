// app/dashboard/page.tsx
import { RecommendedSocietiesClient } from '@/components/recommended-societies-client';
import { PublicSocietiesClient } from '@/components/public-societies-client';
import { getFinancialPassport } from '@/app/actions/passport';
import { getMyActiveSocieties } from '@/app/actions/societies';
import { PassportWidget } from '@/components/passport-widget';
import { PlatformWalletCard } from '@/components/platform-wallet-card';
import { DashboardActivityWidget } from '@/components/dashboard-activity-widget';

export default async function Dashboard() {
  const [passport, { active_societies }] = await Promise.all([
    getFinancialPassport(),
    getMyActiveSocieties(),
  ]);

  return (
    <div className='flex flex-1 flex-col px-6 py-6 space-y-8'>
      {/* Aggregated Platform Asset Wallet Header */}
      <PlatformWalletCard passport={passport} />

      {/* Main Dashboard Layout Grid */}
      <div className='@container/main grid flex-1 grid-cols-1 gap-6 lg:grid-cols-5'>
        {/* Main Content - Left (3/5) */}
        <main className='lg:col-span-3 space-y-10'>
          <section>
            <h2 className='mb-5 text-2xl font-bold tracking-tight'>Recommended for You</h2>
            <RecommendedSocietiesClient />
          </section>

          <section>
            <h2 className='mb-5 text-2xl font-bold tracking-tight'>
              Explore Public Societies
            </h2>
            <PublicSocietiesClient />
          </section>
        </main>

        {/* Sidebar - Right (2/5) */}
        <aside className='lg:col-span-2'>
          <div className='sticky top-6 space-y-6'>
            {/* Signature Financial Passport Widget */}
            <PassportWidget passport={passport} />

            {/* Interactive Activity & Quick Actions Widget */}
            <DashboardActivityWidget passport={passport} activeSocieties={active_societies} />
          </div>
        </aside>
      </div>
    </div>
  );
}
