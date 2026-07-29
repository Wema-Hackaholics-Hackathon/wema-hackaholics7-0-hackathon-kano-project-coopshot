// app/societies/[id]/members/page.tsx

import RightAside from '@/components/right-aside';
import { getSocietyMembers } from '@/app/actions/societies';
import SocietyHeader from '@/components/society-header';
import { SocietyMembersClient } from '@/components/society-members-client';
import { Member, SocietyProps } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SocietyMembersPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getSocietyMembers(id);

  const society: SocietyProps = data.society;
  const members: Member[] = data.members;
  const totalMembers = society.total_members || members.length;
  const onlyFounder = totalMembers === 1;
  const founder =
    members.find((m) => m.id === society.founder.id) || members[0];

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />

      <div className='container max-w-7xl mx-auto px-6 py-6 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-7 xl:col-span-8'>
            <SocietyMembersClient
              society={society}
              members={members}
              totalMembers={totalMembers}
              onlyFounder={onlyFounder}
              founder={founder}
            />
          </div>

          <RightAside society={society} />
        </div>
      </div>
    </div>
  );
}
