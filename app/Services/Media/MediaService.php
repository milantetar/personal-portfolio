<?php

declare(strict_types=1);

namespace App\Services\Media;

use App\Data\Media\MediaData;
use App\Data\Media\MediaUpdateData;
use App\Models\Media;
use App\Models\SiteSetting;
use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    public function createMedia(MediaData $data, ?User $user = null): Media
    {
        $file = $data->file;
        $disk = (string) config('services.media_storage_disk', 'public');
        $cloudinary = $disk === 'cloudinary' ? $this->uploadToCloudinary($file) : null;
        $path = $cloudinary['url'] ?? $file->store('media', $disk);

        $media = Media::create([
            'disk' => $disk,
            'path' => $path,
            'cloudinary_public_id' => $cloudinary['public_id'] ?? null,
            'cloudinary_resource_type' => $cloudinary['resource_type'] ?? null,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $data->alt_text ?? $file->getClientOriginalName(),
            'title' => $data->title ?? $file->getClientOriginalName(),
            'uploaded_by' => $user?->id,
        ]);

        if (! empty($data->usage) && $data->usage !== 'none') {
            $this->assignMediaToSlot($media, $data->usage);
        }

        return $media;
    }

    /**
     * Update an existing media record (and optionally replace the file).
     */
    public function updateMedia(Media $media, MediaUpdateData $data): Media
    {
        $attributes = [
            'alt_text' => $data->alt_text,
            'title' => $data->title ?? $media->title,
        ];

        // If a new file is uploaded, delete the old file from storage and store the new one
        if ($data->file instanceof UploadedFile) {
            $file = $data->file;
            $oldDisk = $media->disk;
            $oldPath = $media->path;
            $oldCloudinaryId = $media->cloudinary_public_id;
            $oldCloudinaryType = $media->cloudinary_resource_type;
            $disk = (string) config('services.media_storage_disk', 'public');
            $cloudinary = $disk === 'cloudinary' ? $this->uploadToCloudinary($file) : null;
            $path = $cloudinary['url'] ?? $file->store('media', $disk);

            $attributes['path'] = $path;
            $attributes['disk'] = $disk;
            $attributes['cloudinary_public_id'] = $cloudinary['public_id'] ?? null;
            $attributes['cloudinary_resource_type'] = $cloudinary['resource_type'] ?? null;
            $attributes['original_name'] = $file->getClientOriginalName();
            $attributes['mime_type'] = $file->getMimeType() ?? 'application/octet-stream';
            $attributes['size'] = $file->getSize();

            $media->update($attributes);

            if ($oldCloudinaryId !== null && $oldCloudinaryType !== null) {
                $this->deleteFromCloudinary($oldCloudinaryId, $oldCloudinaryType);
            } elseif ($oldDisk !== 'cloudinary') {
                Storage::disk($oldDisk)->delete($oldPath);
            }

            $this->handleMediaUsage($media, $data->usage);

            return $media->fresh();
        }

        $media->update($attributes);

        $this->handleMediaUsage($media, $data->usage);

        return $media->fresh();
    }

    /**
     * Handle assigning or unassigning a media item to/from theme slots.
     */
    public function handleMediaUsage(Media $media, string $usage): SiteSetting
    {
        $settings = $this->siteSettings();

        if ($usage === 'none') {
            $updates = [];
            if ($settings->logo_media_id === $media->id) {
                $updates['logo_media_id'] = null;
            }
            if ($settings->background_media_id === $media->id) {
                $updates['background_media_id'] = null;
            }
            if (Schema::hasColumn('site_settings', 'avatar_media_id') && $settings->avatar_media_id === $media->id) {
                $updates['avatar_media_id'] = null;
            }
            if (Schema::hasColumn('site_settings', 'resume_media_id') && $settings->resume_media_id === $media->id) {
                $updates['resume_media_id'] = null;
            }
            if (Schema::hasColumn('site_settings', 'favicon_media_id') && $settings->favicon_media_id === $media->id) {
                $updates['favicon_media_id'] = null;
            }

            if ($updates !== []) {
                $settings->update($updates);
            }

            return $settings->fresh();
        }

        return $this->assignMediaToSlot($media, $usage);
    }

    /**
     * Assign a media file to a branding slot ('logo', 'background', 'avatar').
     */
    public function assignMediaToSlot(Media $media, string $slot): SiteSetting
    {
        $settings = $this->siteSettings();

        $columnMap = [
            'logo' => 'logo_media_id',
            'background' => 'background_media_id',
            'avatar' => 'avatar_media_id',
            'resume' => 'resume_media_id',
            'favicon' => 'favicon_media_id',
        ];

        if (isset($columnMap[$slot])) {
            $column = $columnMap[$slot];
            if (Schema::hasColumn('site_settings', $column)) {
                $settings->update([$column => $media->id]);
            }
        }

        return $settings->fresh();
    }

    /**
     * Clear a media slot ('logo', 'background', 'avatar').
     */
    public function clearMediaSlot(string $slot): SiteSetting
    {
        $settings = $this->siteSettings();

        $columnMap = [
            'logo' => 'logo_media_id',
            'background' => 'background_media_id',
            'avatar' => 'avatar_media_id',
            'resume' => 'resume_media_id',
            'favicon' => 'favicon_media_id',
        ];

        if (isset($columnMap[$slot])) {
            $column = $columnMap[$slot];
            if (Schema::hasColumn('site_settings', $column)) {
                $settings->update([$column => null]);
            }
        }

        return $settings->fresh();
    }

    /**
     * Update site branding and theme customizations safely.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function updateBranding(array $attributes): SiteSetting
    {
        $settings = $this->siteSettings();

        $valid = [];
        foreach ([
            'theme_preset', 'glass_blur', 'glass_opacity',
            'logo_media_id', 'background_media_id', 'avatar_media_id', 'resume_media_id', 'favicon_media_id',
            'hero_title', 'hero_subtitle', 'hero_description',
            'about_title', 'about_description', 'skills_content',
            'projects_content', 'experience_content', 'contact_content',
            'primary_cta_label', 'primary_cta_url',
            'secondary_cta_label', 'secondary_cta_url',
            'email', 'github_url', 'linkedin_url', 'is_available',
        ] as $col) {
            if (array_key_exists($col, $attributes) && Schema::hasColumn('site_settings', $col)) {
                $valid[$col] = $attributes[$col];
            }
        }

        if (! empty($attributes['site_name']) && is_string($attributes['site_name'])) {
            $cleanName = trim($attributes['site_name']);
            if ($cleanName !== '') {
                $valid['site_name'] = $cleanName;
            }
        }

        if ($valid !== []) {
            $settings->update($valid);
        }

        return $settings->fresh();
    }

    /**
     * Delete a media record and remove its file from storage.
     */
    public function deleteMedia(Media $media): bool
    {
        // Delete the physical file from the storage disk
        if ($media->disk === 'cloudinary' && $media->cloudinary_public_id !== null) {
            $this->deleteFromCloudinary($media->cloudinary_public_id, $media->cloudinary_resource_type ?? 'image');
        } elseif (Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }

        // Delete the database record
        return $media->delete();
    }

    /**
     * Delete multiple media records and remove their files from storage.
     *
     * @param  array<int>  $ids
     */
    public function deleteMultipleMedia(array $ids): int
    {
        $mediaList = Media::query()->whereIn('id', $ids)->get();
        $count = 0;

        foreach ($mediaList as $media) {
            $this->deleteMedia($media);
            $count++;
        }

        return $count;
    }

    private function siteSettings(): SiteSetting
    {
        $settings = SiteSetting::query()->first();

        if (! $settings) {
            return SiteSetting::query()->create([
                'site_name' => "Milan's Portfolio",
            ]);
        }

        if (blank($settings->site_name)) {
            $settings->forceFill(['site_name' => "Milan's Portfolio"])->save();
        }

        return $settings->fresh();
    }

    /** @return array{url: string, public_id: string, resource_type: string} */
    private function uploadToCloudinary(UploadedFile $file): array
    {
        $cloudinaryUrl = (string) config('services.cloudinary.url', '');
        if ($cloudinaryUrl === '') {
            throw new \RuntimeException('CLOUDINARY_URL must be configured when MEDIA_STORAGE_DISK is cloudinary.');
        }

        $result = (new Cloudinary($cloudinaryUrl))->uploadApi()->upload($file->getRealPath(), [
            'folder' => trim((string) config('services.cloudinary.folder', 'personal-portfolio'), '/').'/media',
            'resource_type' => 'auto',
            'use_filename' => false,
            'unique_filename' => true,
        ]);

        return [
            'url' => (string) $result['secure_url'],
            'public_id' => (string) $result['public_id'],
            'resource_type' => (string) $result['resource_type'],
        ];
    }

    private function deleteFromCloudinary(string $publicId, string $resourceType): void
    {
        $cloudinaryUrl = (string) config('services.cloudinary.url', '');
        if ($cloudinaryUrl === '') {
            throw new \RuntimeException('CLOUDINARY_URL must be configured to delete Cloudinary media.');
        }

        (new Cloudinary($cloudinaryUrl))->uploadApi()->destroy($publicId, [
            'resource_type' => $resourceType,
            'invalidate' => true,
        ]);
    }
}
