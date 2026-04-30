import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import CollectionsView from "@/components/library/CollectionsView";
import SignInPrompt from "@/components/library/SignInPrompt";
import { getCollections } from "@/lib/data/library";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <DirectionalTransition>
      {collections === null ? (
        <SignInPrompt
          title="Collections"
          description="Sign in to view and manage your saved video collections."
          callbackPath="/collections"
        />
      ) : (
        <CollectionsView collections={collections} />
      )}
    </DirectionalTransition>
  );
}
