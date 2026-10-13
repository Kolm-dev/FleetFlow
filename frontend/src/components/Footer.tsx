import { buttonVariants } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import { NavLink } from "react-router";

export const Footer = () => {
    return (
        <footer className="mx-auto mt-auto flex w-full max-w-(--container-width) items-center justify-between gap-3 border-t border-border px-4 py-5 sm:px-6">
            <NavLink
                className="group flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                to="/"
                aria-label="FleetFlow home"
            >
                <span className="min-w-0">
                    <span className="block text-sm font-semibold transition-colors group-hover:text-primary">
                        FleetFlow
                    </span>
                    <span className="block text-xs text-muted-foreground">Fleet operations workspace · 2026</span>
                </span>
            </NavLink>

            <a
                className={`${buttonVariants({ variant: "ghost", size: "sm" })} shrink-0`}
                href="https://github.com/Kolm-dev"
                target="_blank"
                rel="noreferrer"
            >
                <Code2 aria-hidden="true" />
                GitHub
                <span className="sr-only">(opens in a new tab)</span>
            </a>
        </footer>
    );
};
