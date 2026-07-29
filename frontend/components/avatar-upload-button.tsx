'use client';

import React from 'react'
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconUpload,
  IconLoader,
} from '@tabler/icons-react';
import { updateSocietyAvatar } from '@/app/actions/societies';
import { toast } from 'sonner';
import { Avatar, AvatarImage } from './ui/avatar';

function AvatarUploadButton({
  societyId,
}: {
  societyId: string;
  currentAvatar: string;
}) {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('avatar', file);

    startTransition(async () => {
      try {
        const newAvatarUrl = await updateSocietyAvatar(societyId, formData);
        toast.success('Avatar updated successfully!');
        setPreview(null);
        // Optionally trigger page refresh or mutate cache
        // window.location.reload(); // Simple refresh — or use revalidateTag if using cache
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload avatar');
        setPreview(null);
      }
    });
  };

  return (
    <div className='space-y-4'>
      {preview && (
        <div className='flex justify-center'>
          <Avatar className='h-32 w-32 border-4 border-background shadow-xl'>
            <AvatarImage src={preview} />
          </Avatar>
        </div>
      )}

      <label
        htmlFor='avatar-upload'
        className='block'
      >
        <input
          id='avatar-upload'
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          disabled={pending}
          className='hidden'
        />
        <Button
          asChild
          variant='outline'
          className='w-full cursor-pointer'
          disabled={pending}
        >
          <span>
            {pending ? (
              <>
                <IconLoader className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <IconUpload className='mr-2 h-4 w-4' />
                {preview ? 'Change Image' : 'Upload New Avatar'}
              </>
            )}
          </span>
        </Button>
      </label>

      <p className='text-xs text-center text-muted-foreground'>
        Recommended: Square image (1:1), max 5MB
      </p>
    </div>
  );
}

export default AvatarUploadButton;