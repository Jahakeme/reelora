import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import LibraryGrid from "@/components/library/LibraryGrid";
import SignInPrompt from "@/components/library/SignInPrompt";
import { getHistory } from "@/lib/data/library";

export default async function HistoryPage() {
  const videos = await getHistory();

  return (
    <DirectionalTransition>
      {videos === null ? (
        <SignInPrompt
          title="Watch history"
          description="Sign in to see videos you've watched."
          callbackPath="/history"
        />
      ) : (
        <LibraryGrid
          title="Watch history"
          description="Videos you've watched recently"
          videos={videos}
          emptyTitle="No watch history yet"
          emptyDescription="Videos you watch will appear here"
        />
      )}
    </DirectionalTransition>
  );
}
