// app/account/page.tsx
import { redirect } from "next/navigation";

export default function AccountIndex() {
  redirect("/account/profile");
}
