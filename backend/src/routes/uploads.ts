import path from 'node:path';
import fs from 'node:fs';
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch {
    // best-effort; if this fails, multer will throw on upload
  }
}

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (err: Error | null, path: string) => void,
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, filename: string) => void,
  ) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}_${safeName}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.post(
  '/uploads/vehicle-image',
  authGuard,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const urlPath = `/uploads/${file.filename}`;
    res.status(201).json({ url: urlPath });
  }),
);

export default router;
