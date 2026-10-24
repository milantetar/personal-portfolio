<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\CertificateRequest;
use App\Models\Certificate;
use App\Models\Media;
use App\Models\SidebarItem;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class CertificateController extends Controller
{
    public function __construct(protected SidebarItemRepository $sidebarItemRepository) {}

    public function index()
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
}
