import Logout from "@/components/Auth/Logout";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export const Header = () => {
    const { data: user } = useCurrentUser();
    const navigate = useNavigate();
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    return (
        <header className="relative mx-auto grid w-full max-w-(--container-width) grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 border-b border-border px-4 py-3 sm:px-6 min-[761px]:flex min-[761px]:items-center min-[761px]:justify-between min-[761px]:gap-8">
            <Navbar />

            <div className="col-start-2 row-start-1 self-center">
                <Menu.Root>
                    <Menu.Trigger
                        openOnHover
                        delay={100}
                        closeDelay={200}
                        className="group flex h-9 max-w-40 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted sm:max-w-52"
                        aria-label="Open user menu"
                    >
                        <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="min-w-0 truncate">{user?.name ?? "Account"}</span>
                        <ChevronDown
                            className="size-3.5 shrink-0 text-muted-foreground transition-transform ggroup-data-popup-open:rotate-180"
                            aria-hidden="true"
                        />
                    </Menu.Trigger>

                    <Menu.Portal>
                        <Menu.Positioner align="end" sideOffset={6} className="z-40 outline-none">
                            <Menu.Popup className="min-w-48 origin-(--transform-origin) overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                                <div className="border-b border-border px-3 py-2">
                                    <p className="text-xs text-muted-foreground">Signed in as</p>
                                    <p className="mt-0.5 max-w-52 truncate text-sm font-medium">
                                        {user?.name ?? "User"}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <Menu.Item
                                        onClick={() => navigate("/pricing-settings")}
                                        className="flex min-h-9 cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                    >
                                        <Settings className="size-4 text-muted-foreground" aria-hidden="true" />
                                        Pricing
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => setIsLogoutConfirmOpen(true)}
                                        className="flex min-h-9 cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none select-none data-highlighted:bg-destructive/10"
                                    >
                                        <LogOut className="size-4" aria-hidden="true" />
                                        Logout
                                    </Menu.Item>
                                </div>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </div>

            <Logout
                isOpen={isLogoutConfirmOpen}
                onOpenChange={setIsLogoutConfirmOpen}
            />
        </header>
    );
};
