import cloudinary from "./cloudinary";

export const uploadAusbildungImage = (
  buffer: Buffer
): Promise<{
  secure_url: string;
  public_id: string;
}> => {
  return new Promise((resolve, reject) => {
    const publicId = `ausbildung-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "german-learning/ausbildung",
          resource_type: "image",
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary image upload failed"
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



export const uploadBlogImage = (
  buffer: Buffer
): Promise<{
  secure_url: string;
  public_id: string;
}> => {
  return new Promise((resolve, reject) => {
    const publicId = `blog-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "german-learning/blog",
          resource_type: "image",
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary blog image upload failed"
              )
            );
            return;
          }

          resolve({
            secure_url:
              result.secure_url,
            public_id:
              result.public_id,
          });
        }
      );

    uploadStream.end(buffer);
  });
};