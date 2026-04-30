import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import LibraryGrid from "@/components/library/LibraryGrid";
import SignInPrompt from "@/components/library/SignInPrompt";
import { getLikedVideos } from "@/lib/data/library";

export default async function LikedPage() {
  const videos = await getLikedVideos();

  return (
    <DirectionalTransition>
      {videos === null ? (
        <SignInPrompt
          title="Liked videos"
          description="Sign in to see videos you've liked."
          callbackPath="/liked"
        />
      ) : (
        <LibraryGrid
          title="Liked videos"
          videos={videos}
          emptyTitle="No liked videos yet"
          emptyDescription="Videos you like will appear here"
        />
      )}
    </DirectionalTransition>
  );
}
