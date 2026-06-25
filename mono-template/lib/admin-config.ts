const SECRET_PATH = process.env.ADMIN_SECRET_PATH || "afa5e04feb3266f1"

export const ADMIN_PREFIX = `/${SECRET_PATH}`
export const ADMIN_BASE = ADMIN_PREFIX
export const LOGIN_PATH = ADMIN_PREFIX
export const COOKIE_PATH = ADMIN_PREFIX

export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_PREFIX)
}
