import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import UploadView from "@/components/video/UploadView";
import SignInPrompt from "@/components/library/SignInPrompt";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  return (
    <DirectionalTransition>
      {session?.user ? (
        <UploadView />
      ) : (
        <SignInPrompt
          title="Upload a video"
          description="Sign in to share your videos with the Reelora community."
          callbackPath="/upload"
        />
      )}
    </DirectionalTransition>
  );
}
