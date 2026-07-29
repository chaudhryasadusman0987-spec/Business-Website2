import { readCatalog } from "@/lib/catalog-store"
import { mergeITServices } from "@/lib/catalog"
import { itServiceItems, type ITServiceItem } from "@/data/it-services"

// Server-side accessor for the IT services list with the admin dashboard's
// saved overrides merged in.
//
// Server-only — readCatalog imports node:fs. Client components (e.g. the IT
// quote wizard) get the same data by fetching /api/catalog and calling
// mergeITServices themselves.
//
// Pages using these must opt out of static rendering (`export const dynamic =
// "force-dynamic"`), otherwise the merge runs once at build time and dashboard
// edits never appear.

export async function getITServices(): Promise<ITServiceItem[]> {
  return mergeITServices(itServiceItems, await readCatalog())
}

/** One merged service by id. Ids come from the static data file, so a miss is a bug. */
export async function getITService(id: string): Promise<ITServiceItem> {
  const service = (await getITServices()).find((s) => s.id === id)
  if (!service) throw new Error(`Unknown IT service "${id}"`)
  return service
}
