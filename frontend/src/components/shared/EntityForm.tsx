import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FormEvent, ReactNode } from "react";

type EntityFormProps = {
    title: string;
    description?: string;
    submitLabel: string;
    pendingLabel: string;
    isPending: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    submitDisabled?: boolean;
    children: ReactNode;
};

export const formFieldClass = "mb-0 grid min-w-0 gap-1.5 text-sm font-medium text-foreground";
export const formControlClass = "mt-0 h-10 w-full min-w-0 max-w-none rounded-md border border-input bg-background px-3 py-2 text-sm font-normal text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";
export const formGridClass = "grid min-w-0 gap-4 sm:grid-cols-2";

export const EntityForm = ({
    title,
    description,
    submitLabel,
    pendingLabel,
    isPending,
    onSubmit,
    onCancel,
    submitDisabled = false,
    children,
}: EntityFormProps) => (
    <form className="mx-auto w-full max-w-3xl" onSubmit={onSubmit}>
        <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border px-4 py-5 sm:px-6">
                <h1 className="m-0 text-2xl font-semibold text-foreground">{title}</h1>
                {description && <p className="m-0 text-sm text-muted-foreground">{description}</p>}
            </CardHeader>
            <CardContent className="grid gap-6 p-4 sm:p-6">
                {children}
            </CardContent>
            <div className="flex flex-wrap gap-2 border-t border-border p-4 sm:p-6">
                <Button className="w-full sm:w-auto" type="submit" disabled={isPending || submitDisabled}>
                    {isPending ? pendingLabel : submitLabel}
                </Button>
                <Button className="w-full sm:w-auto" type="button" variant="outline" disabled={isPending} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Card>
    </form>
);
