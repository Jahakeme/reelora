import { v2 as cloudinary } from "cloudinary";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";

const EAGER_THUMBNAIL = "w_640,h_360,c_fill,so_0";

export async function POST() {
  try {
    const { userId } = await requireAuth();

    const { cloud_name, api_key, api_secret } = cloudinary.config();
    if (!cloud_name || !api_key || !api_secret) {
      throw new ApiException(
        "INTERNAL",
        "Cloudinary is not configured. Set CLOUDINARY_URL.",
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `reelora/videos/${userId}`;

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, eager: EAGER_THUMBNAIL },
      api_secret as string,
    );

    return ok({
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`,
      signedParams: {
        api_key,
        timestamp,
        folder,
        eager: EAGER_THUMBNAIL,
        signature,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
