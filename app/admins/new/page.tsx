import { redirect } from "next/navigation";

export default function AdminNewRedirectPage() {
  redirect("/admins/create");
}
