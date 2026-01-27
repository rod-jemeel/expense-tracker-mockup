import { getAllOrganizations } from "@/lib/server/services/super-dashboard"
import { SuperOrganizationsContentClient } from "./super-organizations-content-client"

export async function SuperOrganizationsContent() {
  const organizations = await getAllOrganizations()

  return <SuperOrganizationsContentClient organizations={organizations} />
}
