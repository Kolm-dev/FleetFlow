import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

type StatusTone = "blue" | "amber" | "emerald" | "rose" | "slate";
type Accent = "blue" | "emerald";

type StatusItem = {
    label: string;
    value: number;
    tone: StatusTone;
};

type StatusBreakdownCardProps = {
    title: string;
    eyebrow: string;
    total: number;
    totalLabel: string;
    statuses: StatusItem[];
    to: string;
    linkLabel: string;
    distributionLabel: string;
    icon: LucideIcon;
    accent: Accent;
};

const statusColors: Record<StatusTone, string> = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    slate: "bg-slate-400",
};

const accentStyles: Record<Accent, { card: string; header: string; icon: string }> = {
    blue: {
        card: "border-blue-200/60 bg-gradient-to-br from-card to-blue-50/70 dark:border-blue-900/60 dark:to-blue-950/20",
        header: "border-blue-100/80 dark:border-blue-900/50",
        icon: "bg-blue-500",
    },
    emerald: {
        card: "border-emerald-200/60 bg-gradient-to-br from-card to-emerald-50/70 dark:border-emerald-900/60 dark:to-emerald-950/20",
        header: "border-emerald-100/80 dark:border-emerald-900/50",
        icon: "bg-emerald-500",
    },
};

export const StatusBreakdownCard = ({
    title,
    eyebrow,
    total,
    totalLabel,
    statuses,
    to,
    linkLabel,
    distributionLabel,
    icon: Icon,
    accent,
}: StatusBreakdownCardProps) => {
    const styles = accentStyles[accent];
    const percentage = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

    return (
        <Card className={`min-w-0 overflow-hidden ${styles.card}`}>
            <CardHeader
                className={`flex flex-col items-stretch gap-4 border-b sm:flex-row sm:items-center sm:justify-between ${styles.header}`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${styles.icon}`}
                    >
                        <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <CardDescription>{eyebrow}</CardDescription>
                        <CardTitle className="mt-0.5 text-lg sm:text-xl">{title}</CardTitle>
                    </div>
                </div>

                <Link
                    to={to}
                    className={`${buttonVariants({ variant: "ghost", size: "sm" })} w-full justify-between sm:w-auto`}
                >
                    {linkLabel}
                    <ArrowUpRight aria-hidden="true" />
                </Link>
            </CardHeader>

            <CardContent className="space-y-5 pt-1">
                <div>
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                        <strong className="text-3xl leading-none font-bold tracking-tight tabular-nums sm:text-4xl">
                            {total}
                        </strong>
                        <span className="pb-0.5 text-sm text-muted-foreground">{totalLabel}</span>
                    </div>

                    <div
                        className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-muted"
                        aria-label={distributionLabel}
                    >
                        {statuses.map((status) => (
                            <div
                                key={status.label}
                                className={statusColors[status.tone]}
                                style={{ flexGrow: status.value }}
                                title={`${status.label}: ${status.value}`}
                            />
                        ))}
                    </div>
                </div>

                <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-2">
                    {statuses.map((status) => (
                        <li
                            key={status.label}
                            className="min-w-0 rounded-lg bg-background/70 p-3 ring-1 ring-foreground/5"
                        >
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span
                                    className={`mt-1.5 size-2 shrink-0 rounded-full ${statusColors[status.tone]}`}
                                />
                                <span className="min-w-0 break-words">{status.label}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="text-lg font-semibold tabular-nums">{status.value}</span>
                                <span className="text-xs text-muted-foreground">{percentage(status.value)}%</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
