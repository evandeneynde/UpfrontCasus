import { Head, usePage } from '@inertiajs/react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';
import type { AnalyticsData, LeaderboardEntry } from '@/types';

type PageProps = AnalyticsData;

type VolumeCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';
type SortKey = 'bags' | 'kg' | 'batches' | 'efficiency';
type FlowCycle = 'day' | 'week' | 'month';

type Option = { value: string; label: string };

const PERIOD_OPTIONS: Option[] = [
    { value: 'daily', label: 'Dag' },
    { value: 'weekly', label: 'Week' },
    { value: 'monthly', label: 'Maand' },
    { value: 'yearly', label: 'Jaar' },
];


const FLOW_LABELS: Record<FlowCycle, string> = {
    day: 'Dag',
    week: 'Week',
    month: 'Maand',
};

const FLOW_ORDER: FlowCycle[] = ['day', 'week', 'month'];

const LABEL_STEP: Record<FlowCycle, number> = {
    day: 4,
    week: 1,
    month: 5,
};


// Production Chart
const PAD = { top: 16, right: 16, bottom: 44, left: 48 };
const VIEW_W = 800;
const VIEW_H = 260;
const CHART_W = VIEW_W - PAD.left - PAD.right;
const CHART_H = VIEW_H - PAD.top - PAD.bottom;

function buildPath(data: number[], total: number, maxVal: number): string {
    if (data.length === 0 || maxVal === 0) return '';
    return data
        .map((v, i) => {
            const x = PAD.left + (i / (total - 1)) * CHART_W;
            const y = PAD.top + (1 - v / maxVal) * CHART_H;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
}

function yAxisTicks(maxVal: number, count = 4): number[] {
    if (maxVal === 0) return [0];
    const step = Math.ceil(maxVal / count);
    return Array.from({ length: count + 1 }, (_, i) => i * step);
}

type Series = {
    label: string;
    color: string;
    average: number[];
    current: number[];
};

type TooltipInfo = {
    x: number;
    y: number;
    value: number;
    label: string;
    color: string;
    seriesLabel: string;
};

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

function LineChart({
    series,
    labels,
    step,
    periodLabel,
}: {
    series: Series[];
    labels: string[];
    step: number;
    periodLabel: string;
}) {
    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

    const allValues = series.flatMap((s) => [...s.average, ...s.current]);
    const maxVal = Math.max(...allValues, 1);
    const ticks = yAxisTicks(maxVal);
    const displayMax = ticks[ticks.length - 1];
    const hasData = allValues.some((v) => v > 0);

    const TOOLTIP_W = 88;
    const multiSeries = series.length > 1;
    const TOOLTIP_H = multiSeries ? 50 : 40;

    return (
        <div className="relative w-full">
            <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full"
                aria-label="Productieverloop grafiek"
            >
                {/* Y-axis grid lines + labels */}
                {ticks.map((tick) => {
                    const y = PAD.top + (1 - tick / displayMax) * CHART_H;
                    return (
                        <g key={tick}>
                            <line
                                x1={PAD.left}
                                y1={y}
                                x2={VIEW_W - PAD.right}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity={0.1}
                                strokeWidth={1}
                            />
                            <text
                                x={PAD.left - 6}
                                y={y + 4}
                                textAnchor="end"
                                fontSize={11}
                                fill="currentColor"
                                opacity={0.5}
                            >
                                {tick}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis */}
                {labels.map((label, i) => {
                    if (i % step !== 0) return null;
                    const x =
                        labels.length === 1
                            ? PAD.left
                            : PAD.left + (i / (labels.length - 1)) * CHART_W;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={VIEW_H - 8}
                            textAnchor="middle"
                            fontSize={11}
                            fill="currentColor"
                            opacity={0.5}
                        >
                            {label}
                        </text>
                    );
                })}

                {!hasData && (
                    <text
                        x={VIEW_W / 2}
                        y={VIEW_H / 2}
                        textAnchor="middle"
                        fontSize={13}
                        fill="currentColor"
                        opacity={0.35}
                    >
                        Nog geen data voor deze periode
                    </text>
                )}

                {/* One pair of lines per series */}
                {hasData &&
                    series.map((s) => {
                        const total = labels.length;
                        const avgPath = buildPath(s.average, total, displayMax);
                        const curPath = buildPath(s.current, total, displayMax);
                        return (
                            <g key={s.label}>
                                {avgPath && (
                                    <path
                                        d={avgPath}
                                        fill="none"
                                        strokeWidth={1.5}
                                        strokeDasharray="6 4"
                                        style={{ stroke: s.color }}
                                        opacity={0.4}
                                    />
                                )}
                                {curPath && (
                                    <>
                                        <path
                                            d={curPath}
                                            fill="none"
                                            strokeWidth={2.5}
                                            style={{ stroke: s.color }}
                                        />
                                        {s.current.map((v, i) => {
                                            if (v === 0) return null;
                                            const x =
                                                total === 1
                                                    ? PAD.left
                                                    : PAD.left + (i / (total - 1)) * CHART_W;
                                            const y =
                                                PAD.top +
                                                (1 - v / displayMax) * CHART_H;
                                            return (
                                                <g key={i}>
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={3.5}
                                                        style={{
                                                            fill: s.color,
                                                            stroke: 'var(--background)',
                                                        }}
                                                        strokeWidth={1.5}
                                                    />
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={10}
                                                        fill="transparent"
                                                        className="cursor-pointer"
                                                        onMouseEnter={() =>
                                                            setTooltip({
                                                                x,
                                                                y,
                                                                value: v,
                                                                label: labels[i],
                                                                color: s.color,
                                                                seriesLabel: s.label,
                                                            })
                                                        }
                                                        onMouseLeave={() => setTooltip(null)}
                                                    />
                                                </g>
                                            );
                                        })}
                                    </>
                                )}
                            </g>
                        );
                    })}
                {tooltip && (() => {
                    const tx = Math.min(
                        Math.max(tooltip.x - TOOLTIP_W / 2, PAD.left),
                        VIEW_W - PAD.right - TOOLTIP_W,
                    );
                    const ty =
                        tooltip.y - TOOLTIP_H - 12 < PAD.top
                            ? tooltip.y + 14
                            : tooltip.y - TOOLTIP_H - 12;
                    return (
                        <g style={{ pointerEvents: 'none' }}>
                            <rect
                                x={tx}
                                y={ty}
                                width={TOOLTIP_W}
                                height={TOOLTIP_H}
                                rx={5}
                                fill="var(--card)"
                                stroke="var(--border)"
                                strokeWidth={1}
                            />
                            {multiSeries && (
                                <text
                                    x={tx + TOOLTIP_W / 2}
                                    y={ty + 15}
                                    fontSize={10}
                                    fill={tooltip.color}
                                    fontWeight="500"
                                    textAnchor="middle"
                                >
                                    {tooltip.seriesLabel}
                                </text>
                            )}
                            <text
                                x={tx + TOOLTIP_W / 2}
                                y={ty + (multiSeries ? 31 : 22)}
                                fontSize={13}
                                fontWeight="700"
                                fill="currentColor"
                                textAnchor="middle"
                            >
                                {tooltip.value}
                            </text>
                            <text
                                x={tx + TOOLTIP_W / 2}
                                y={ty + (multiSeries ? 44 : 35)}
                                fontSize={10}
                                fill="currentColor"
                                opacity={0.45}
                                textAnchor="middle"
                            >
                                {tooltip.label}
                            </text>
                        </g>
                    );
                })()}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-1 pt-2 text-xs text-muted-foreground">
                {series.map((s) => (
                    <span key={s.label} className="flex items-center gap-1.5">
                        <svg width="36" height="8" className="shrink-0">
                            <line
                                x1="0" y1="4" x2="16" y2="4"
                                strokeWidth="2.5"
                                stroke={s.color}
                            />
                            <line
                                x1="20" y1="4" x2="36" y2="4"
                                strokeWidth="1.5"
                                strokeDasharray="4 3"
                                stroke={s.color}
                                strokeOpacity="0.5"
                            />
                        </svg>
                        {s.label}
                    </span>
                ))}
                <span className="flex items-center gap-1.5 text-muted-foreground/60">
                    <svg width="16" height="8" className="shrink-0">
                        <line
                            x1="0" y1="4" x2="16" y2="4"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            stroke="currentColor"
                        />
                    </svg>
                    gemiddelde per {periodLabel.toLowerCase()}
                </span>
            </div>
        </div>
    );
}

function Indicators({
    options,
    active,
    onChange,
}: {
    options: Option[];
    active: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-0.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={
                        opt.value === active
                            ? 'rounded bg-background px-1.5 py-0.5 text-xs font-medium text-foreground shadow-sm'
                            : 'px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
                    }
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

type StatCardProps = {
    title: string;
    value: string;
    subtitle: string;
    leftOptions: Option[];
    leftActive: string;
    onLeftChange: (value: string) => void;
    rightOptions?: Option[];
    rightActive?: string;
    onRightChange?: (value: string) => void;
};

function StatCard({
    title,
    value,
    subtitle,
    leftOptions,
    leftActive,
    onLeftChange,
    rightOptions,
    rightActive,
    onRightChange,
}: StatCardProps) {
    return (
        <Card className="overflow-hidden gap-4 pb-0">
            <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
            <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
                <Indicators
                    options={leftOptions}
                    active={leftActive}
                    onChange={onLeftChange}
                />
                {rightOptions && rightActive !== undefined && onRightChange && (
                    <Indicators
                        options={rightOptions}
                        active={rightActive}
                        onChange={onRightChange}
                    />
                )}
            </div>
        </Card>
    );
}

// --- User leaderboard
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    if (!active) {
        return <ArrowUpDown className="ml-1 inline size-3.5 opacity-40" />;
    }

    return dir === 'desc' ? (
        <ChevronDown className="ml-1 inline size-3.5" />
    ) : (
        <ChevronUp className="ml-1 inline size-3.5" />
    );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
    const [sortKey, setSortKey] = useState<SortKey>('bags');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    function handleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    const sorted = [...entries].sort((a, b) => {
        const av = a[sortKey] ?? -Infinity;
        const bv = b[sortKey] ?? -Infinity;
        return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number);
    });

    const col = (key: SortKey, label: string, className?: string) => (
        <TableHead
            className={`cursor-pointer select-none hover:text-foreground ${className ?? ''}`}
            onClick={() => handleSort(key)}
        >
            {label}
            <SortIcon active={sortKey === key} dir={sortDir} />
        </TableHead>
    );

    if (entries.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Nog geen voltooide producties.</p>
        );
    }

    return (
        <div className="rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Medewerker</TableHead>
                        {col('bags', 'Zakken', 'text-right')}
                        {col('kg', 'KG geproduceerd', 'text-right')}
                        {col('efficiency', 'Efficiëntie', 'text-right')}
                        {col('batches', 'Batches', 'text-right')}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map((entry, i) => (
                        <TableRow key={entry.name}>
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell className="text-right">{entry.bags}</TableCell>
                            <TableCell className="text-right">{entry.kg}</TableCell>
                            <TableCell className="text-right">
                                {entry.efficiency !== null
                                    ? `${entry.efficiency}%`
                                    : '—'}
                            </TableCell>
                            <TableCell className="text-right">{entry.batches}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function ProductToggle({
    options,
    selected,
    colorMap,
    onToggle,
}: {
    options: { id: string; name: string }[];
    selected: string[];
    colorMap: Record<string, string>;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((pt) => {
                const id = pt.id;
                const active = selected.includes(id);
                return (
                    <button
                        key={id}
                        onClick={() => onToggle(id)}
                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            active
                                ? 'border-transparent bg-muted text-foreground'
                                : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span
                            className="inline-block size-2 shrink-0 rounded-full"
                            style={{
                                background: active ? colorMap[id] : 'currentColor',
                                opacity: active ? 1 : 0.3,
                            }}
                        />
                        {pt.name}
                    </button>
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const { volume, efficiency, leaderboard, flowData, products } =
        usePage<PageProps>().props;

    const [volumePeriod, setVolumePeriod] = useState<VolumeCycle>('weekly');
    const [effPeriod, setEffPeriod] = useState<VolumeCycle>('weekly');
    const [batchPeriod, setBatchPeriod] = useState<VolumeCycle>('weekly');
    const [flowPeriod, setFlowPeriod] = useState<FlowCycle>('day');
    const [selectedProducts, setSelectedProducts] = useState<string[]>(['all']);

    const vol = volume[volumePeriod];
    const eff = efficiency[effPeriod];
    const bat = volume[batchPeriod];

    // Stable color mapping: product type id → chart color (doesn't shift when toggling)
    const colorMap: Record<string, string> = Object.fromEntries([
        ...products.map((pt, i) => [String(pt.id), CHART_COLORS[i % CHART_COLORS.length]]),
        ['all', CHART_COLORS[products.length % CHART_COLORS.length]],
    ]);

    const toggleOptions: { id: string; name: string }[] = [
        { id: 'all', name: 'Totaal' },
        ...products.map((pt) => ({ id: String(pt.id), name: pt.name })),
    ];

    const chartLabels = flowData['all'][flowPeriod].labels;
    const chartSeries: Series[] = selectedProducts.map((ptId) => {
        const data = (ptId === 'all' ? flowData['all'] : (flowData[`pt_${ptId}`] ?? flowData['all']))[flowPeriod];
        return {
            label: ptId === 'all' ? 'Totaal' : (products.find((p) => String(p.id) === ptId)?.name ?? ptId),
            color: colorMap[ptId] ?? CHART_COLORS[0],
            average: data.average,
            current: data.current,
        };
    });

    const toggleProduct = (id: string) => {
        setSelectedProducts((prev) =>
            prev.includes(id)
                ? prev.length > 1 ? prev.filter((p) => p !== id) : prev
                : [...prev, id],
        );
    };

    const volValue = `${vol.kg} kg`;
    const volSubtitle = `${vol.bags} zakken`;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Dashboard"
                    description="Productie en werkenemer statistieken"
                />

                {/*Stats*/}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Productie"
                        value={volValue}
                        subtitle={volSubtitle}
                        leftOptions={PERIOD_OPTIONS}
                        leftActive={volumePeriod}
                        onLeftChange={(v) => setVolumePeriod(v as VolumeCycle)}
                    />
                    <StatCard
                        title="Efficiëntie"
                        value={eff !== null ? `${eff}%` : '—'}
                        subtitle="geproduceerde zakken tegenover verwacht"
                        leftOptions={PERIOD_OPTIONS}
                        leftActive={effPeriod}
                        onLeftChange={(v) => setEffPeriod(v as VolumeCycle)}
                    />
                    <StatCard
                        title="Aantal batches"
                        value={bat.batches.toString()}
                        subtitle={`gemiddeld ${bat.batches > 0 ? (bat.kg / bat.batches).toFixed(1) : '0'} kg per batch`}
                        leftOptions={PERIOD_OPTIONS}
                        leftActive={batchPeriod}
                        onLeftChange={(v) => setBatchPeriod(v as VolumeCycle)}
                    />
                </div>

                {/*Production Graph*/}
                <Card>
                    <CardHeader className="gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>Productie</CardTitle>
                            <div className="flex gap-1">
                                {FLOW_ORDER.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFlowPeriod(f)}
                                        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                            flowPeriod === f
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                    >
                                        {FLOW_LABELS[f]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ProductToggle
                            options={toggleOptions}
                            selected={selectedProducts}
                            colorMap={colorMap}
                            onToggle={toggleProduct}
                        />
                    </CardHeader>
                    <CardContent>
                        <LineChart
                            series={chartSeries}
                            labels={chartLabels}
                            step={LABEL_STEP[flowPeriod]}
                            periodLabel={FLOW_LABELS[flowPeriod]}
                        />
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                <div>
                    <h2 className="mb-3 text-bafse font-semibold">Medewerkers</h2>
                    <Leaderboard entries={leaderboard} />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
