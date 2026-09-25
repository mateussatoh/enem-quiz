/** Only same-app admin paths are allowed as post-login destinations (no open redirects). */
export function safeAdminNext(next: string | null | undefined): string {
  return next && /^\/admin(\/|\?|$)/.test(next) && !next.startsWith("/admin/login")
    ? next
    : "/admin";
}
