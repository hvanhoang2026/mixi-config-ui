import { redirect } from "next/navigation";

export default function ProfilePage() {
  redirect("/config-center?account=profile");
}
