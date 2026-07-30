import Image from 'next/image';
import SocietyHeader from '@/components/society-header';
import { JoinSocietyButton } from '@/components/join-society-button';
import { SocietyProps } from '@/types';

export function GatedAccessScreen({ society, featureName }: { society: SocietyProps; featureName: string }) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />
      <div className='container max-w-7xl mx-auto px-6 py-12 flex-1'>
        <div className='flex flex-col items-center justify-center text-center py-16 px-6 border rounded-2xl bg-card/60 shadow-2xs space-y-6 max-w-2xl mx-auto'>
          <Image
            src='/illustrations/undraw_join_niai.svg'
            alt='Membership Required'
            width={220}
            height={160}
            className='h-40 w-auto opacity-90'
          />
          <div className='space-y-2 max-w-lg'>
            <h2 className='text-2xl font-bold tracking-tight text-foreground'>
              Membership Required
            </h2>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Access to <span className='font-semibold text-foreground'>{featureName}</span> is restricted to active members of <strong className='text-foreground'>{society.name}</strong>. Join this society to unlock internal records!
            </p>
          </div>
          <div className='pt-2'>
            <JoinSocietyButton societyId={society.id.toString()} className='px-8 py-2.5 text-base' />
          </div>
        </div>
      </div>
    </div>
  );
}
