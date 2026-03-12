import endpoint from "shared/endpoint";

/**
 * Perform admin login
 */
export function adminLogin(data: any) {
  return endpoint.post("/admin/login", data);
}

/**
 * Get current admin user data
 */
export function getAdminMe() {
  return endpoint.get("/admin/me");
}

/**
 * Admin logout
 */
export function adminLogout() {
  return endpoint.post("/admin/logout");
}
