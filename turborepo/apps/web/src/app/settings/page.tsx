import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { default as SettingsPage } from "@/ui/settings/subpage";

export const metadata = {
  title: "settings"
};

export default async function Settings() {
  const session = await auth();
  console.log(session?.user);

  return (
    <Suspense fallback={"Loading..."}>
      <SettingsPage user={session?.user} />
    </Suspense>
  );
}
