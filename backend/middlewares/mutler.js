import multer from "multer";

const storage = multer.memoryStorage();
export const singleUpload = multer({ storage }).single("file");

export const profileUploads = multer({ storage }).fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  // Backwards compatibility for older clients
  { name: "file", maxCount: 1 },
]);
