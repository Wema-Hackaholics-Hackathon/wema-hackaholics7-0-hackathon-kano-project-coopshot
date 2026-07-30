// components/society-settings-client.tsx
'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  IconIdBadge2,
  IconUserPlus,
  IconLock,
  IconGlobe,
  IconEdit,
  IconFileText,
  IconClock,
  IconUpload,
  IconCircleCheck,
  IconImageInPicture,
  IconLoader,
  IconTrendingUp,
  IconSettings,
  IconInfoCircle,
} from '@tabler/icons-react';
import { toggleSocietyVisibility, updateSocietyAvatar } from '@/app/actions/societies';
import { SocietyDocument, SocietyProps } from '@/types';
import { toast } from 'sonner';
import EditSettingsModal from './edit-settings-modal';
import InviteCoFounderModal from './invite-co-founder-modal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import AvatarUploadButton from './avatar-upload-button';

interface SocietySettingsClientProps {
  society: SocietyProps;
  initialDocuments: SocietyDocument[];
}

export default function SocietySettingsClient({
  society: initialSociety,
  initialDocuments,
}: SocietySettingsClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [society, setSociety] = useState(initialSociety);
  const [pending, startTransition] = useTransition();

  const documents = initialDocuments; // ← Now from props

  const handleVisibilityToggle = (checked: boolean) => {
    startTransition(async () => {
      try {
        await toggleSocietyVisibility(society.id.toString(), checked);
        setSociety({ ...society, is_public: checked });
        toast.success('Society visibility updated!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update visibility');
      }
    });
  };

  const canInviteCoFounder =
    society.isFounder && !society.co_founder && society.can_manage;

  return (
    <div className='space-y-6'>
      <Card className='p-6 border bg-linear-to-r from-primary/5 via-background to-background shadow-2xs'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-xl bg-primary/10 text-primary'>
            {society.can_manage ? <IconSettings className='h-6 w-6' /> : <IconInfoCircle className='h-6 w-6' />}
          </div>
          <div>
            <h2 className='text-lg font-bold text-foreground'>
              {society.can_manage ? 'Cooperative Settings & Administration' : 'Cooperative Information & Governance'}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {society.can_manage
                ? 'Manage group visibility, co-founder permissions, contribution rules, and legal documents.'
                : 'Review cooperative parameters, constitution documents, governance policies, and verification status.'}
            </p>
          </div>
        </div>
      </Card>
      {/* Existing Sections */}
      {canInviteCoFounder && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconUserPlus className='h-5 w-5' />
              Co-founder
            </CardTitle>
            <CardDescription>
              Invite a trusted member to co-manage this society with full
              permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setInviteOpen(true)}>
              Invite Co-founder
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconIdBadge2 className='h-5 w-5' />
            Verification Status
          </CardTitle>
          <CardDescription>
            Verified societies can invite members and start contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {society.verified ? (
                <Badge variant='default'>Verified</Badge>
              ) : (
                <Badge variant='secondary'>Unverified</Badge>
              )}
              <span className='text-sm text-muted-foreground'>
                {society.verified
                  ? 'Your society is fully verified.'
                  : 'Verification required to unlock full features.'}
              </span>
            </div>
            {!society.verified && society.can_manage && (
              <Button variant='outline'>Verify Now</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Society Avatar - New Card */}
      {society.can_manage && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconImageInPicture className='h-5 w-5' />
              Society Avatar
            </CardTitle>
            <CardDescription>
              Update the profile picture for your society.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center gap-6'>
              <Avatar className='h-32 w-32 border-4 border-background shadow-xl'>
                <AvatarImage
                  src={society.avatar_url}
                  alt={society.name}
                />
                <AvatarFallback className='text-5xl font-bold'>
                  {society.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='w-full max-w-sm'>
                <AvatarUploadButton
                  societyId={society.id.toString()}
                  currentAvatar={society.avatar_url}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconLock className='h-5 w-5' />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <p className='font-medium'>Society Visibility</p>
              <p className='text-sm text-muted-foreground'>
                {society.is_public
                  ? 'Anyone can discover and request to join'
                  : 'Only invited members can join'}
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <Badge variant={society.is_public ? 'outline' : 'secondary'}>
                <IconGlobe className='mr-1 h-3 w-3' />
                {society.is_public ? 'Public' : 'Private'}
              </Badge>

              {society.can_manage && (
                <Switch
                  checked={society.is_public}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={pending}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <IconTrendingUp className='h-5 w-5 text-primary' />
              Contribution & Treasury Policy Settings
            </CardTitle>
            <CardDescription>
              Define contribution parameters and Treasury Bill allocation rules for this society.
            </CardDescription>
          </div>
          {society.can_manage && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setEditOpen(true)}
              className='cursor-pointer'
            >
              <IconEdit className='mr-2 h-4 w-4' />
              Edit Settings
            </Button>
          )}
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Contribution Amount
              </p>
              <p className='text-xl font-bold text-foreground'>
                ₦{society.settings.contribution_amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Frequency</p>
              <p className='text-lg font-semibold capitalize text-foreground'>
                {society.settings.frequency}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Payout Cycle</p>
              <p className='text-lg font-semibold capitalize text-foreground'>
                {society.settings.payout_cycle}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Late Fee</p>
              <p className='text-lg font-semibold text-foreground'>
                ₦{society.settings.late_fee?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                Default T-Bill Allocation
              </p>
              <p className='text-lg font-semibold text-foreground'>
                {society.settings.tbill_allocation_percentage ?? 5}% of pool
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                T-Bill Lock Duration
              </p>
              <p className='text-lg font-semibold text-foreground'>
                {society.settings.tbill_duration_days ?? 91} Days (3 Months)
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Loan Multiplier</p>
              <p className='text-lg font-semibold text-foreground'>
                x{society.settings.loan_multiplier ?? 1} of contributions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New: Society Documents Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconFileText className='h-5 w-5' />
            Society Documents
          </CardTitle>
          <CardDescription>
            Important files and records for this society.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='rounded-full bg-muted/50 p-4 mb-6'>
                <IconUpload className='h-12 w-12 text-muted-foreground/50' />
              </div>
              <h3 className='text-xl font-semibold mb-3'>
                No documents uploaded yet
              </h3>
              <p className='text-muted-foreground max-w-md'>
                Upload constitution, registration certificates, or other
                important documents to complete verification.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className='flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div className='rounded-lg bg-muted p-3'>
                      <IconFileText className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='font-medium'>
                        {doc.description || 'Untitled Document'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Uploaded by {doc.uploaded_by} •{' '}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Badge variant={doc.approved ? 'default' : 'secondary'}>
                      {doc.approved ? (
                        <>
                          <IconCircleCheck className='mr-1 h-3 w-3' />
                          Approved
                        </>
                      ) : (
                        <>
                          <IconClock className='mr-1 h-3 w-3' />
                          Pending
                        </>
                      )}
                    </Badge>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                    >
                      <a
                        href={doc.file_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EditSettingsModal
        society={society}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={(updated) => setSociety({ ...society, settings: updated })}
      />

      <InviteCoFounderModal
        society={society}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
