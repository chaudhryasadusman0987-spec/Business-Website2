// Backwards-compatibility shim.
// The CCTV section was restructured into the Security Solutions hub.
// All product data now lives in security-solutions.ts — this file simply
// re-exports the surveillance products and shared fees so older imports
// (e.g. the AI agent prompt) keep working.
import { securitySolutions } from "./security-solutions"

export { installFee, gstRate } from "./security-solutions"

export const cctvProducts =
  securitySolutions.find((s) => s.id === "surveillance")?.products ?? []
