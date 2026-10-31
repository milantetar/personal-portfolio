<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected SidebarItemRepository $sidebarItemRepository,
    ) {}

    public function index(): Response
    {
        Log::info('Web dashboard requested.', ['user_id' => auth()->id()]);
        $sidebarItems = $this->sidebarItemRepository->getAllActiveSorted();

        Log::info('Web dashboard loaded.', [
            'user_id' => auth()->id(),
            'sidebar_item_count' => $sidebarItems->count(),
        ]);

        return inertia('admin/dashboard', [
            'sidebarItems' => $sidebarItems,
        ]);
    }
}
