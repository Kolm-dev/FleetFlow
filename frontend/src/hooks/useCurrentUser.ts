import { getCurrentUser } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        retry: false,
    });
};
