/**
 * Escape user-supplied text before interpolating it into email HTML.
 * Without this, a form field like `<a href="…">Verify your account</a>`
 * would be rendered as a real link in mail sent from our domain.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
