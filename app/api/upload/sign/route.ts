import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";

type UploadKind = "video" | "avatar";

interface UploadPolicy {
  folder: string | ((userId: string) => string);
  publicIdTemplate?: (userId: string) => string;
  overwrite?: boolean;
  invalidate?: boolean;
  eager?: string;
  eagerAsync?: string;
  allowedFormats?: string;
  maxBytes?: number;
}

const POLICIES: Record<UploadKind, UploadPolicy> = {
  video: {
    folder: (userId) => `reelora/videos/${userId}`,
    eager: "w_640,h_360,c_fill,so_0,f_jpg",
    eagerAsync: "false",
  },
  avatar: {
    folder: "reelora/avatars",
    publicIdTemplate: (userId) => userId,
    overwrite: true,
    invalidate: true,
    eager: "c_fill,g_auto,w_400,h_400,f_auto,q_auto",
    allowedFormats: "jpg,png,webp",
    maxBytes: 4 * 1024 * 1024,
  },
};

function isUploadKind(value: unknown): value is UploadKind {
  return value === "video" || value === "avatar";
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const kind = body?.kind;
    if (!isUploadKind(kind)) {
      throw new ApiException("BAD_REQUEST", "Invalid upload kind");
    }

    const { cloud_name, api_key, api_secret } = cloudinary.config();
    if (!cloud_name || !api_key || !api_secret) {
      throw new ApiException(
        "INTERNAL",
        "Cloudinary is not configured. Set CLOUDINARY_URL.",
      );
    }

    const policy = POLICIES[kind];
    const folder =
      typeof policy.folder === "function" ? policy.folder(userId) : policy.folder;
    const publicId = policy.publicIdTemplate?.(userId);
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number | boolean> = {
      timestamp,
      folder,
    };
    if (publicId) paramsToSign.public_id = publicId;
    if (policy.overwrite) paramsToSign.overwrite = true;
    if (policy.invalidate) paramsToSign.invalidate = true;
    if (policy.eager) paramsToSign.eager = policy.eager;
    if (policy.eagerAsync) paramsToSign.eager_async = policy.eagerAsync;
    if (policy.allowedFormats) paramsToSign.allowed_formats = policy.allowedFormats;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      api_secret as string,
    );

    return ok({
      signature,
      timestamp,
      apiKey: api_key,
      cloudName: cloud_name,
      folder,
      publicId,
      overwrite: policy.overwrite,
      invalidate: policy.invalidate,
      eager: policy.eager,
      eagerAsync: policy.eagerAsync,
      allowedFormats: policy.allowedFormats,
      maxBytes: policy.maxBytes,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
