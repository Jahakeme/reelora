import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import SettingsView from "@/components/settings/SettingsView";
import SignedOutView from "@/components/you/SignedOutView";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <DirectionalTransition>
      {session?.user?.id ? (
        <SettingsView
          user={{
            id: session.user.id,
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            image: session.user.image ?? null,
          }}
        />
      ) : (
        <SignedOutView />
      )}
    </DirectionalTransition>
  );
}
