// TODO(dashboard): implement file writing
// When type === "security-product":
//   update price/image/badge/inStock in
//   src/data/security-solutions.ts
// When type === "vehicle":
//   update rates/image/badge in
//   src/data/car-rental.ts
// When type === "it-package":
//   update startingFromValue/startingFrom
//   in src/data/it-services.ts
// For now: log and return success so UI works

export async function POST(req: Request) {
  const data = await req.json()
  console.log("Dashboard update:", data)
  // TODO(dashboard): write to data files
  return Response.json({ success: true })
}
