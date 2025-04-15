import path from "path";
import fs from "fs";
import multer, { diskStorage } from "multer";

const createUploadDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    createUploadDir(dir);
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export { upload };
