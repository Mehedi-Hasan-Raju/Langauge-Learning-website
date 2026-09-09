import multer from "multer";

export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "audio/mpeg") {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only MP3 audio files are allowed"
      )
    );
  },
});