<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsVisit;
use App\Repositories\Dashboard\SidebarItemRepository;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(private readonly SidebarItemRepository $sidebarItemRepository) {}

    public function index(Request $request): Response
    {
        $validated = $request->validate(['range' => ['sometimes', 'in:7,30,90']]);
        $range = (int) ($validated['range'] ?? 30);
        $end = CarbonImmutable::now()->endOfDay();
        $start = $end->subDays($range - 1)->startOfDay();
        $visits = AnalyticsVisit::query()->whereBetween('viewed_at', [$start, $end]);

        $summary = [
            'pageViews' => (clone $visits)->count(),
            'uniqueSessions' => (clone $visits)->distinct('visitor_hash')->count('visitor_hash'),
            'topPath' => (clone $visits)->selectRaw('path, COUNT(*) as views')->groupBy('path')->orderByDesc('views')->value('path'),
            'referrerCount' => (clone $visits)->whereNotNull('referrer_host')->distinct('referrer_host')->count('referrer_host'),
        ];

        $dailyRows = (clone $visits)
            ->selectRaw('DATE(viewed_at) as visit_date, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as sessions')
            ->groupBy('visit_date')
            ->orderBy('visit_date')
            ->get()
            ->mapWithKeys(static fn (AnalyticsVisit $row): array => [
                (string) $row->getAttribute('visit_date') => [
                    'views' => (int) $row->getAttribute('views'),
                    'sessions' => (int) $row->getAttribute('sessions'),
                ],
            ]);

        $daily = collect(range(0, $range - 1))->map(function (int $offset) use ($start, $dailyRows): array {
            $date = $start->addDays($offset)->toDateString();
            $row = $dailyRows->get($date);

            return ['date' => $date, 'views' => $row['views'] ?? 0, 'sessions' => $row['sessions'] ?? 0];
        });

        $topPages = (clone $visits)->selectRaw('path, COUNT(*) as views')->groupBy('path')->orderByDesc('views')->limit(8)->get();
        $topReferrers = (clone $visits)->whereNotNull('referrer_host')->selectRaw('referrer_host as host, COUNT(*) as views')->groupBy('referrer_host')->orderByDesc('views')->limit(8)->get();
        $devices = (clone $visits)->selectRaw('device_type as type, COUNT(*) as views')->groupBy('device_type')->orderByDesc('views')->get();

        Log::info('Dashboard analytics viewed.', [
            'user_id' => $request->user()?->id,
            'range_days' => $range,
            'page_views' => $summary['pageViews'],
        ]);

        return inertia('admin/analytics', [
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
            'range' => $range,
            'summary' => $summary,
            'daily' => $daily,
            'topPages' => $topPages,
            'topReferrers' => $topReferrers,
            'devices' => $devices,
            'period' => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
        ]);
    }
}
