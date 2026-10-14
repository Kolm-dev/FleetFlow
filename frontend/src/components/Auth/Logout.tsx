import { logout } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Dialog } from "@base-ui/react/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

type LogoutProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

const Logout = ({ isOpen, onOpenChange }: LogoutProps) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mutate: logoutMutate, isPending } = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            onOpenChange(false);
            queryClient.setQueryData(["currentUser"], null);
            navigate("/authorization", { replace: true });
        },
    });

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/55 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
                <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-background p-5 text-foreground shadow-2xl outline-none transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <LogOut
                                className="size-5"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="min-w-0">
                            <Dialog.Title className="text-lg font-semibold">Confirm logout</Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                                Are you sure you want to sign out of FleetFlow?
                            </Dialog.Description>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isPending}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => logoutMutate()}
                        >
                            {isPending ? "Signing out..." : "Logout"}
                        </Button>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default Logout;
