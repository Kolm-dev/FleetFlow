import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/types/statsTypes";
import { getSetupSteps } from "./setupSteps";
import { ArrowUpRight, Check, Lock } from "lucide-react";
import { Link } from "react-router";

type SetupChecklistProps = {
    stats: Stats;
};

export const SetupChecklist = ({ stats }: SetupChecklistProps) => {
    const steps = getSetupSteps(stats);

    const completedSteps = steps.filter(step => step.isDone).length;

    return (
        <Card className="min-w-0 border-blue-200/60 dark:border-blue-900/60">
            <CardHeader className="gap-1.5">
                <CardDescription>Getting started</CardDescription>
                <CardTitle className="text-lg sm:text-xl">Set up your first trip</CardTitle>
                <p className="m-0 text-sm text-muted-foreground">
                    {completedSteps} of {steps.length} steps completed
                </p>
            </CardHeader>
            <CardContent>
                <ol className="m-0 grid list-none gap-2 p-0">
                    {steps.map((step, index) => (
                        <li
                            key={step.title}
                            className="flex flex-col gap-3 rounded-lg bg-background/70 p-3 ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <span
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                        step.isDone
                                            ? "bg-emerald-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {step.isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className="m-0 font-medium">{step.title}</p>
                                    <p className="m-0 text-sm text-muted-foreground">
                                        {step.isLocked && !step.isDone ? step.lockedReason : step.description}
                                    </p>
                                </div>
                            </div>

                            {step.isDone ? (
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Done</span>
                            ) : step.isLocked ? (
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Lock className="size-4" aria-hidden="true" />
                                    Locked
                                </span>
                            ) : (
                                <Link
                                    to={step.to}
                                    className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full justify-between no-underline sm:w-auto`}
                                >
                                    {step.linkLabel}
                                    <ArrowUpRight aria-hidden="true" />
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
};
