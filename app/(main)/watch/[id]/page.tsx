import WatchView from "@/components/video/WatchView";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WatchView videoId={id} />;
}
