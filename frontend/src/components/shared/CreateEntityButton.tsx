import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { NavLink } from "react-router";

type CreateEntityButtonProps = {
    entity: "driver" | "client" | "vehicle" | "trip";
    to: string;
};

export const CreateEntityButton = ({ entity, to }: CreateEntityButtonProps) => (
    <NavLink
        className={cn(buttonVariants(), "no-underline sm:h-10 sm:px-3.5)")}
        to={to}
    >
        <Plus aria-hidden="true" />
        Create {entity}
    </NavLink>
);
