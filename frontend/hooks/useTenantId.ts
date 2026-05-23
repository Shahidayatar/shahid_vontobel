export function useTenantId() {
  if (typeof window === "undefined") {
    return "tenant-dev";
  }

  return window.localStorage.getItem("tenantId") ?? "tenant-dev";
}
