import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, LockKeyhole, type LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { Link } from "react-router";

export type AuthFormField = {
    id: string;
    label: string;
    value: string;
    type: "text" | "password";
    autoComplete: string;
    placeholder: string;
    icon: LucideIcon;
    error?: string;
    autoFocus?: boolean;
    onChange: (value: string) => void;
};

type AuthFormProps = {
    title: string;
    description: string;
    fields: AuthFormField[];
    submitLabel: string;
    pendingLabel: string;
    isPending: boolean;
    isSubmitDisabled?: boolean;
    errorMessage?: string | null;
    footerText: string;
    footerLinkLabel: string;
    footerLinkTo: string;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    rememberMe?: boolean;
    onRememberMeChange?: (checked: boolean) => void;
};

export const AuthForm = ({
    title,
    description,
    fields,
    submitLabel,
    pendingLabel,
    isPending,
    isSubmitDisabled = false,
    errorMessage,
    footerText,
    footerLinkLabel,
    footerLinkTo,
    onSubmit,
    rememberMe,
    onRememberMeChange,
}: AuthFormProps) => {
    const generalErrorId = "auth-form-error";

    return (
        <section className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10 sm:px-6 sm:py-16">
            <Card className="w-full shadow-lg">
                <CardHeader className="items-center gap-2 text-center">
                    <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <LockKeyhole
                            className="size-5"
                            aria-hidden="true"
                        />
                    </div>
                    <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        className="space-y-4"
                        onSubmit={onSubmit}
                        method="post"
                    >
                        {fields.map(field => {
                            const fieldErrorId = `${field.id}-error`;
                            const describedBy = [
                                field.error ? fieldErrorId : null,
                                errorMessage ? generalErrorId : null,
                            ]
                                .filter(Boolean)
                                .join(" ");
                            const Icon = field.icon;

                            return (
                                <div
                                    className="space-y-2"
                                    key={field.id}
                                >
                                    <label
                                        className="text-sm font-medium"
                                        htmlFor={field.id}
                                    >
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <Icon
                                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id={field.id}
                                            name={field.id}
                                            value={field.value}
                                            type={field.type}
                                            required
                                            autoFocus={field.autoFocus}
                                            autoComplete={field.autoComplete}
                                            placeholder={field.placeholder}
                                            disabled={isPending}
                                            aria-invalid={Boolean(field.error || errorMessage)}
                                            aria-describedby={describedBy || undefined}
                                            className="mt-0 h-10 max-w-none rounded-lg border border-input bg-background pr-3 pl-10 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            onChange={event => field.onChange(event.currentTarget.value)}
                                        />
                                    </div>
                                    {field.error && (
                                        <p
                                            id={fieldErrorId}
                                            className="m-0 text-sm font-medium text-destructive"
                                            role="alert"
                                        >
                                            {field.error}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {onRememberMeChange && (
                            <label
                                className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 leading-none"
                                htmlFor="remember"
                            >
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={rememberMe ?? false}
                                    disabled={isPending}
                                    className="size-4 m-0 shrink-0 cursor-pointer rounded border accent-primary outline-none disabled:cursor-not-allowed"
                                    onChange={event => onRememberMeChange(event.currentTarget.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                        )}

                        {errorMessage && (
                            <ErrorMessage
                                messages={errorMessage}
                                className="p-3"
                                id={generalErrorId}
                            />
                        )}

                        <Button
                            className="w-full"
                            disabled={isPending || isSubmitDisabled}
                            type="submit"
                        >
                            {isPending && (
                                <LoaderCircle
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            )}
                            {isPending ? pendingLabel : submitLabel}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="m-0 text-center text-sm text-muted-foreground">
                        {footerText}{" "}
                        <Link
                            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            to={footerLinkTo}
                        >
                            {footerLinkLabel}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </section>
    );
};
