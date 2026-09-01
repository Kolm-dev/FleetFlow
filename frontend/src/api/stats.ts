import { apiClient } from "@/api/client";
import type { Stats } from "@/types/statsTypes";

export function getStats() {
    return apiClient<Stats>("/stats");
}
