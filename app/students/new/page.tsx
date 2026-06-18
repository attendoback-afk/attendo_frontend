import { redirect } from "next/navigation";

export default function StudentNewRedirectPage() {
  redirect("/students/create");
}
