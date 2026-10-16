import type { TripStatus } from "@/types/tripsTypes";

export const tripStatusStyles: Record<TripStatus, { badge: string; filter: string; selectedFilter: string }> = {
    planned: {
        badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
        filter: "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
        selectedFilter: "border-slate-500 bg-slate-500 text-white hover:bg-slate-600",
    },
    pending: {
        badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
        filter: "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300 dark:hover:bg-orange-950/50",
        selectedFilter: "border-orange-600 bg-orange-600 text-white hover:bg-orange-700",
    },
    closed: {
        badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        filter: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50",
        selectedFilter: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
    },
    cancelled: {
        badge: "bg-red-500/15 text-red-700 dark:text-red-300",
        filter: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50",
        selectedFilter: "border-red-600 bg-red-600 text-white hover:bg-red-700",
    },
};
