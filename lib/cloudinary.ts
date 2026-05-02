import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ url: string; publicId: string; type: "image" | "video"; thumbnail?: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "grad-party",
        public_id: filename,
        transformation: resourceType === "image"
          ? [{ quality: "auto", fetch_format: "auto" }]
          : undefined,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        const isVideo = result.resource_type === "video";
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? "video" : "image",
          thumbnail: isVideo
            ? result.secure_url.replace("/upload/", "/upload/so_0,f_jpg,w_400/").replace(/\.\w+$/, ".jpg")
            : undefined,
        });
      }
    );
    stream.end(buffer);
  });
}

export default cloudinary;
