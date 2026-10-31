<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Data\Media\MediaData;
use App\Http\Controllers\Controller;
use App\Http\Requests\CertificateRequest;
use App\Models\Certificate;
use App\Models\Media;
use App\Models\SidebarItem;
use App\Repositories\Dashboard\SidebarItemRepository;
use App\Services\Media\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class CertificateController extends Controller
{
    public function __construct(
        protected SidebarItemRepository $sidebarItemRepository,
        protected MediaService $mediaService,
    ) {}

    public function index(): Response
    {
        $certificateSidebarItem = SidebarItem::query()->firstOrCreate(
            ['url' => '/dashboard/certificates'],
            ['label' => 'Certificates', 'sort_order' => 2, 'is_visible' => true],
        );
        if (! $certificateSidebarItem->is_visible) {
            $certificateSidebarItem->update(['is_visible' => true]);
        }

        return inertia('admin/certificates', [
            'certificates' => Certificate::query()->with('media')->orderBy('sort_order')->latest('id')->get(),
            'mediaItems' => Media::query()->latest()->get(),
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function store(CertificateRequest $request): RedirectResponse
    {
        $certificate = Certificate::query()->create($request->validated());
        Log::info('Certificate created.', ['user_id' => $request->user()?->id, 'certificate_id' => $certificate->id]);

        return to_route('certificates.index')->with('success', 'Certificate added successfully.');
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:50'],
            'files.*' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:20480'],
        ]);

        $created = DB::transaction(function () use ($validated, $request): int {
            $count = 0;
            foreach ($validated['files'] as $file) {
                $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $title = $this->certificateTitle($filename);

                $media = $this->mediaService->createMedia(
                    MediaData::from([
                        'file' => $file,
                        'title' => $title,
                        'alt_text' => $title,
                        'usage' => 'none',
                    ]),
                    $request->user(),
                );

                Certificate::query()->create([
                    'title' => $title,
                    'issuer' => $this->certificateIssuer($title),
                    'description' => 'Imported from the uploaded certificate file.',
                    'media_id' => $media->id,
                    'sort_order' => Certificate::query()->max('sort_order') + 1,
                    'is_visible' => true,
                ]);
                $count++;
            }

            return $count;
        });

        Log::info('Certificates imported from media files.', [
            'user_id' => $request->user()?->id,
            'created_count' => $created,
        ]);

        return to_route('certificates.index')->with('success', "{$created} certificates imported successfully.");
    }

    private function certificateTitle(string $filename): string
    {
        $title = trim((string) preg_replace('/[_-]+/', ' ', $filename));
        $title = trim((string) preg_replace('/\b(certificate|certification|cert)\b/i', '', $title));

        return ucwords($title !== '' ? $title : $filename);
    }

    private function certificateIssuer(string $title): string
    {
        foreach ([
            'AWS' => 'Amazon Web Services',
            'Amazon' => 'Amazon Web Services',
            'Cisco' => 'Cisco',
            'CCNA' => 'Cisco',
            'IBM' => 'IBM',
            'Infosys' => 'Infosys',
            'Android' => 'Infosys',
            'PHP' => 'Simplilearn-Cursa',
        ] as $keyword => $issuer) {
            if (str_contains(strtolower($title), strtolower($keyword))) {
                return $issuer;
            }
        }

        return 'Certificate provider';
    }

    public function update(CertificateRequest $request, Certificate $certificate): RedirectResponse
    {
        $certificate->update($request->validated());
        Log::info('Certificate updated.', ['user_id' => $request->user()?->id, 'certificate_id' => $certificate->id]);

        return to_route('certificates.index')->with('success', 'Certificate updated successfully.');
    }

    public function destroy(Certificate $certificate): RedirectResponse
    {
        $id = $certificate->id;
        $certificate->delete();
        Log::info('Certificate deleted.', ['user_id' => request()->user()?->id, 'certificate_id' => $id]);

        return to_route('certificates.index')->with('success', 'Certificate deleted successfully.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:certificates,id'],
        ]);

        $deletedCount = Certificate::query()->whereIn('id', $validated['ids'])->delete();

        Log::info('Certificates bulk deleted.', [
            'user_id' => $request->user()?->id,
            'deleted_count' => $deletedCount,
            'certificate_ids' => $validated['ids'],
        ]);

        return to_route('certificates.index')->with('success', "{$deletedCount} certificates deleted successfully.");
    }
}
