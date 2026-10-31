import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Eye,
    Globe2,
    Monitor,
    Users,
} from 'lucide-react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { PageProps } from '@/types';

interface AnalyticsSummary {
    pageViews: number;
    uniqueSessions: number;
    topPath: string | null;
    referrerCount: number;
}

interface DailyTraffic {
    date: string;
    views: number;
    sessions: number;
}

interface AnalyticsRow {
    path?: string;
    host?: string | null;
    type?: string;
    views: number;
}

interface AnalyticsPageProps extends PageProps {
    range: 7 | 30 | 90;
    summary: AnalyticsSummary;
    daily: DailyTraffic[];
    topPages: AnalyticsRow[];
    topReferrers: AnalyticsRow[];
    devices: AnalyticsRow[];
    period: { from: string; to: string };
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
}

function formatDate(
    value: string,
    options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
    return new Intl.DateTimeFormat(undefined, options).format(
        new Date(`${value}T12:00:00`),
    );
}

function TrafficChart({ data }: { data: DailyTraffic[] }) {
    const width = 1000;
    const height = 220;
    const padding = 12;
    const max = Math.max(1, ...data.map((point) => point.views));
    const points = data.map((point, index) => {
        const x =
            data.length <= 1
                ? width / 2
                : padding + (index / (data.length - 1)) * (width - padding * 2);
        const y =
            height - padding - (point.views / max) * (height - padding * 2);
        return { ...point, x, y };
    });
    const line = points.map((point) => `${point.x},${point.y}`).join(' ');
    const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

    return (
        <div>
            <div
                className="h-56 w-full"
                role="img"
                aria-label={`Daily page views over ${data.length} days`}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    className="h-full w-full overflow-visible"
                >
                    <defs>
                        <linearGradient
                            id="traffic-area"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity=".2"
                            />
                            <stop
                                offset="100%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    {[0, 1, 2, 3].map((step) => {
                        const y = padding + (step / 3) * (height - padding * 2);
                        return (
                            <line
                                key={step}
                                x1={padding}
                                x2={width - padding}
                                y1={y}
                                y2={y}
                                stroke="hsl(var(--border))"
                                strokeDasharray="3 6"
                            />
                        );
                    })}
                    {data.some((point) => point.views > 0) ? (
                        <>
                            <polygon points={area} fill="url(#traffic-area)" />
                            <polyline
                                points={line}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        </>
                    ) : (
                        <text
                            x={width / 2}
                            y={height / 2}
                            textAnchor="middle"
                            fill="hsl(var(--muted-foreground))"
                            fontSize="14"
                        >
                            No visits in this period
                        </text>
                    )}
                </svg>
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                {points
                    .filter(
                        (_, index) =>
                            index === 0 ||
                            index === points.length - 1 ||
                            index === Math.floor((points.length - 1) / 2),
                    )
                    .map((point) => (
                        <span key={point.date}>{formatDate(point.date)}</span>
                    ))}
            </div>
        </div>
    );
}

function RankedRows({
    rows,
    label,
}: {
    rows: AnalyticsRow[];
    label: 'path' | 'host' | 'type';
}) {
    const maxViews = Math.max(1, ...rows.map((row) => row.views));

    if (!rows.length)
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No data for this period.
            </p>
        );

    return (
        <ol className="divide-y divide-border/70">
            {rows.map((row, index) => {
                const value =
                    row[label] ||
                    (label === 'host' ? 'Direct / no referrer' : 'Unknown');
                return (
                    <li
                        key={`${value}-${index}`}
                        className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                    >
                        <span className="w-5 shrink-0 font-mono text-[10px] text-muted-foreground">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <span
                                    className="truncate font-medium"
                                    title={value}
                                >
                                    {value}
                                </span>
                                <span className="shrink-0 font-mono text-muted-foreground">
                                    {formatNumber(row.views)}
                                </span>
                            </div>
                            <div className="mt-2 h-1 overflow-hidden bg-muted">
                                <div
                                    className="h-full bg-primary/75"
                                    style={{
                                        width: `${(row.views / maxViews) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

export default function AnalyticsPage() {
    const {
        sidebarItems,
        branding,
        backgroundImage,
        range,
        summary,
        daily,
        topPages,
        topReferrers,
        devices,
        period,
    } = usePage<AnalyticsPageProps>().props;
    const cards = [
        {
            label: 'Page views',
            value: summary.pageViews,
            detail: 'Successful public page loads',
            icon: Eye,
        },
        {
            label: 'Unique sessions',
            value: summary.uniqueSessions,
            detail: 'Pseudonymous browser sessions',
            icon: Users,
        },
        {
            label: 'Top page',
            value: summary.topPath || '—',
            detail: 'Most viewed path in this period',
            icon: ArrowUpRight,
            compact: true,
        },
        {
            label: 'Referring hosts',
            value: summary.referrerCount,
            detail: 'External hosts sending visits',
            icon: Globe2,
        },
    ];

    return (
        <>
            <Head title="Traffic analytics" />
            <AdminLayout
                sidebarItems={sidebarItems}
                backgroundUrl={
                    branding?.backgroundImage?.url || backgroundImage?.url
                }
                branding={branding}
            >
                <div className="admin-page admin-analytics-page mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <AdminPageHeader
                        icon={<Activity className="size-4" />}
                        title="Traffic analytics"
                        description="Understand how visitors find and use your public portfolio."
                        actions={
                            <div
                                className="flex items-center gap-1 rounded-md border border-border bg-card p-1"
                                aria-label="Analytics date range"
                            >
                                {([7, 30, 90] as const).map((days) => (
                                    <Link
                                        key={days}
                                        href={`/dashboard/analytics?range=${days}`}
                                        preserveScroll
                                        className={`rounded px-2.5 py-1.5 text-xs transition-colors ${range === days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        aria-current={
                                            range === days ? 'page' : undefined
                                        }
                                    >
                                        {days} days
                                    </Link>
                                ))}
                            </div>
                        }
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <p>
                            Reporting period:{' '}
                            <span className="font-medium text-foreground">
                                {formatDate(period.from, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}{' '}
                                –{' '}
                                {formatDate(period.to, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </p>
                        <Badge variant="outline" className="font-normal">
                            First-party tracking
                        </Badge>
                    </div>

                    <section
                        aria-label="Traffic summary"
                        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        {cards.map(
                            ({ label, value, detail, icon: Icon, compact }) => (
                                <Card
                                    key={label}
                                    className="border-border/80 bg-card/90"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {label}
                                            </p>
                                            <Icon
                                                className="size-4 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <p
                                            className={`mt-3 truncate font-display font-semibold tracking-tight ${compact ? 'text-lg' : 'text-3xl'}`}
                                            title={
                                                typeof value === 'string'
                                                    ? value
                                                    : undefined
                                            }
                                        >
                                            {typeof value === 'number'
                                                ? formatNumber(value)
                                                : value}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {detail}
                                        </p>
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </section>

                    <Card className="border-border/80 bg-card/90">
                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                            <div>
                                <CardTitle className="text-sm">
                                    Traffic over time
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                    Daily successful page views
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                className="gap-1 font-mono text-[10px]"
                            >
                                <ArrowDownRight className="size-3" />
                                {range}D
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <TrafficChart data={daily} />
                        </CardContent>
                    </Card>

                    <section
                        className="grid gap-3 xl:grid-cols-3"
                        aria-label="Traffic breakdowns"
                    >
                        <Card className="border-border/80 bg-card/90">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Popular pages
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Most visited paths
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RankedRows rows={topPages} label="path" />
                            </CardContent>
                        </Card>
                        <Card className="border-border/80 bg-card/90">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Referring hosts
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    External sources, when provided by the
                                    browser
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RankedRows rows={topReferrers} label="host" />
                            </CardContent>
                        </Card>
                        <Card className="border-border/80 bg-card/90">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Monitor className="size-4 text-muted-foreground" />
                                    Devices
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Coarse classification from browser headers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RankedRows rows={devices} label="type" />
                            </CardContent>
                        </Card>
                    </section>

                    <p className="border-t border-border/70 pt-4 text-[11px] leading-5 text-muted-foreground">
                        This dashboard stores a rotating 90-day history of page
                        paths, referral hostnames, coarse device type, and a
                        keyed hash of the Laravel session ID. It does not store
                        raw IP addresses, full referrer URLs, or full user-agent
                        strings. A session is an estimate and does not identify
                        a person.
                    </p>
                </div>
            </AdminLayout>
        </>
    );
}
