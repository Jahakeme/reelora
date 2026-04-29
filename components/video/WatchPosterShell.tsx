import Image from "next/image";
import { toCloudinaryThumbnail } from "@/lib/cloudinary";

interface WatchPosterShellProps {
  thumbnail: string | null;
  title: string;
}

export default function WatchPosterShell({ thumbnail, title }: WatchPosterShellProps) {
  const src = toCloudinaryThumbnail(thumbnail);
  if (!src) {
    return <div className="absolute inset-0 bg-bg-base" aria-hidden />;
  }
  return (
    <Image
      src={src}
      alt={title}
      fill
      sizes="(max-width: 1024px) 100vw, 880px"
      priority
      className="object-contain"
    />
  );
}
