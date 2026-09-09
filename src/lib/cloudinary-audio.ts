import cloudinary from "./cloudinary";

export const uploadListeningAudio = (
  buffer: Buffer,
  originalName: string
): Promise<{
  secure_url: string;
  public_id: string;
}> => {
  return new Promise((resolve, reject) => {
    const publicId = `listening-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "german-learning/listening",
          resource_type: "video",
          public_id: publicId,
          format: "mp3",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary upload failed"
              )
            );
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

    uploadStream.end(buffer);
  });
};