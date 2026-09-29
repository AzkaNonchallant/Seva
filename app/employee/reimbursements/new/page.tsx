import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { listTravels } from "@/lib/api/travel";

export const metadata = { title: "Reimbursement Baru • Employee" };

/**
 * `POST /api/reimbursements` takes a travelId and nothing else, so there is no
 * form to render here: the list screen offers the action per eligible travel.
 * Reaching this URL directly lands on that list, where the choice is made.
 */
export default async function NewReimbursementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["EMPLOYEE"]);
  const params = await searchParams;

  // A travel id in the URL still works: verify it is one this employee can
  // claim before sending them to the form, so the link never dead-ends.
  const travelId = Number(params.travelId);
  if (Number.isFinite(travelId) && travelId > 0) {
    const travels = await listTravels().catch(() => []);
    const eligible = travels.find(
      (travel) => travel.id === travelId && travel.status === "COMPLETED",
    );
    if (eligible) redirect(`/employee/reimbursements#travel-${travelId}`);
  }

  redirect("/employee/reimbursements");
}
