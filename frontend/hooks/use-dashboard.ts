"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardApi.getOverview
  });
}
