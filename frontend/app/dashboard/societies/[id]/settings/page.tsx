// app/dashboard/societies/[id]/settings/page.tsx

import SocietyHeader from '@/components/society-header';
import RightAside from '@/components/right-aside';
import SocietySettingsClient from '@/components/society-settings-client';
import { getSocietySettings } from '@/app/actions/societies';
import { getSocietyDocuments } from '@/app/actions/societies';

interface PageProps {
  params: Promise<{ id: string }>;
}

import { GatedAccessScreen } from '@/components/gated-access-screen';

export default async function SocietySettingsPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch both in parallel
  const [settingsData, documents] = await Promise.all([
    getSocietySettings(id),
    getSocietyDocuments(id),
  ]);

  const society = settingsData?.society;
  if (!society || society.can_join) {
    return <GatedAccessScreen society={society} featureName="Society Policy & Settings" />;
  }

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />

      <div className='container max-w-7xl mx-auto px-6 py-6 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-8 space-y-6'>
            <SocietySettingsClient
              society={society}
              initialDocuments={documents} // ← Pass documents as prop
            />
          </div>

          <div className='lg:col-span-4'>
            <RightAside society={society} />
          </div>
        </div>
      </div>
    </div>
  );
}
