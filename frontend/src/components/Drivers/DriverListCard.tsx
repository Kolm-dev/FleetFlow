import { driverStatusStyles } from "@/components/Drivers/driverStatusStyles";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Driver } from "@/types/driversTypes";
import { Link } from "react-router";

type DriverListCardProps = {
    driver: Driver;
};

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

export const DriverListCard = ({ driver }: DriverListCardProps) => {
    const statusStyle = driverStatusStyles[driver.status];

    return (
        <article>
            <Card className="gap-0 py-0">
                <CardContent className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-4 p-4">
                    <img
                        className="size-[72px] rounded-lg border border-border bg-muted object-cover"
                        src={driver.photo ?? DRIVER_PHOTO_PLACEHOLDER}
                        alt=""
                    />

                    <div className="flex min-w-0 flex-col items-start gap-2.5">
                        <div className="min-w-0">
                            <h3 className="m-0 wrap-break-word text-base font-semibold leading-snug text-foreground">
                                {driver.name}
                            </h3>
                            <p className="m-0 mt-0.5 text-xs text-muted-foreground">ID #{driver.id}</p>
                        </div>

                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.badge}`}>
                            <span className="sr-only">Status: </span>
                            {statusStyle.label}
                        </span>

                        <div className="min-w-0 max-w-full">
                            <span className="block text-xs text-muted-foreground">Phone</span>
                            <a
                                className="wrap-break-word text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                href={`tel:${driver.phone_number}`}
                            >
                                {driver.phone_number}
                            </a>
                        </div>
                    </div>

                    <div className="col-span-2 border-t border-border pt-3">
                        <Link
                            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
                            to={`/drivers/${driver.id}`}
                        >
                            View profile
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </article>
    );
};
