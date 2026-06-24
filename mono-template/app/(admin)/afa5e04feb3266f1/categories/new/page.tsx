import { redirect } from "next/navigation"
import { verifyAdminSession } from "../../../_actions/_utils"
import { CategoryForm } from "../../../_components/category-form"

export default async function NewCategoryPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/afa5e04feb3266f1")

  return <CategoryForm />
}
