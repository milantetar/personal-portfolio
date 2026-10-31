<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\PortfolioAssistantLog;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PortfolioAssistantLogController extends Controller
{
    public function __construct(
        protected SidebarItemRepository $sidebarItemRepository,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $query = PortfolioAssistantLog::query()->latest('id');

        if ($search !== '') {
            $query->where(function ($sub) use ($search): void {
                $sub->where('user_question', 'like', "%{$search}%")
                    ->orWhere('assistant_answer', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate(20)->withQueryString();

        $totalQueries = PortfolioAssistantLog::query()->count();
        $queriesToday = PortfolioAssistantLog::query()->whereDate('created_at', today())->count();
        $uniqueVisitors = PortfolioAssistantLog::query()->distinct('ip_hash')->count('ip_hash');

        return inertia('admin/assistant-logs', [
            'logs' => $logs,
            'stats' => [
                'total_queries' => $totalQueries,
                'queries_today' => $queriesToday,
                'unique_visitors' => $uniqueVisitors,
            ],
            'filters' => [
                'search' => $search,
            ],
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function destroy(PortfolioAssistantLog $log): RedirectResponse
    {
        $log->delete();

        return back()->with('success', 'Log entry deleted.');
    }

    public function clearAll(): RedirectResponse
    {
        PortfolioAssistantLog::query()->delete();

        return back()->with('success', 'All assistant chat logs have been cleared.');
    }
}
