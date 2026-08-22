import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/config-center?account=settings");
}
