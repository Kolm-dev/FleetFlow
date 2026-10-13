import { Menu } from "@base-ui/react/menu";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { Check, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

const navigationItems = [
    { label: "Home", to: "/" },
    { label: "Trips", to: "/trips" },
    { label: "Drivers", to: "/drivers" },
    { label: "Vehicles", to: "/vehicles" },
    { label: "Clients", to: "/clients" },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentRoute =
        navigationItems.find(({ to }) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)))
            ?.to ?? "";
    const currentLabel = navigationItems.find(({ to }) => to === currentRoute)?.label ?? "Navigation";

    return (
        <div className="contents min-[761px]:flex min-[761px]:min-w-0 min-[761px]:flex-1 min-[761px]:items-center min-[761px]:gap-7">
            <Link
                className="p-1 col-start-1 row-start-1 inline-flex shrink-0 items-center gap-2 rounded-lg text-base font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 min-[761px]:text-lg"
                to="/"
                aria-label="FleetFlow"
            >
                <img
                    className="size-7 shrink-0 object-contain min-[761px]:size-8"
                    src="/favicon"
                    alt=""
                    aria-hidden="true"
                />
                FleetFlow
            </Link>

            <NavigationMenu.Root
                aria-label="Primary navigation"
                className="absolute left-1/2 hidden -translate-x-1/2 min-[761px]:block"
            >
                <NavigationMenu.List className="flex list-none items-center gap-1 rounded-xl border border-border/70 bg-muted/40 p-1 shadow-xs">
                    {navigationItems.map(item => {
                        const isActive = item.to === currentRoute;

                        return (
                            <NavigationMenu.Item key={item.to}>
                                <NavigationMenu.Link
                                    active={isActive}
                                    render={<Link to={item.to} />}
                                    className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 ${
                                        isActive
                                            ? "text-foreground shadow-sm bg-green-200"
                                            : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                                    }`}
                                >
                                    {item.label}
                                </NavigationMenu.Link>
                            </NavigationMenu.Item>
                        );
                    })}
                </NavigationMenu.List>
            </NavigationMenu.Root>

            <div className="col-span-2 col-start-1 row-start-2 hidden w-full max-[760px]:block">
                <Menu.Root>
                    <Menu.Trigger
                        className="group flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
                        aria-label="Open primary navigation"
                    >
                        <span>{currentLabel}</span>
                        <ChevronDown
                            className="size-4 shrink-0 text-muted-foreground transition-transform group-data-popup-open:rotate-180"
                            aria-hidden="true"
                        />
                    </Menu.Trigger>

                    <Menu.Portal>
                        <Menu.Positioner
                            align="start"
                            sideOffset={6}
                            className="z-50 w-(--anchor-width) outline-none"
                        >
                            <Menu.Popup className="w-full origin-(--transform-origin) overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                                {navigationItems.map(item => {
                                    const isActive = item.to === currentRoute;

                                    return (
                                        <Menu.Item
                                            key={item.to}
                                            onClick={() => navigate(item.to)}
                                            className="flex min-h-10 cursor-default items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                        >
                                            <span>{item.label}</span>
                                            {isActive && (
                                                <Check
                                                    className="size-4 shrink-0 text-primary"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </Menu.Item>
                                    );
                                })}
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </div>
        </div>
    );
};

export default Navbar;
