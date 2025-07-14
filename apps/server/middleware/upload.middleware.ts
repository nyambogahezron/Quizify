import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Configure storage
const storage = multer.diskStorage({
	destination: (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void
	) => {
		const uploadDir = 'uploads/avatars';
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void
	) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

// File filter
const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Not an image! Please upload only images.'));
	}
};

// Configure multer
export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
});

// Process image
export const processImage = async (filePath: string): Promise<string> => {
	const processedPath = filePath.replace(/\.[^/.]+$/, '') + '-processed.jpg';

	await sharp(filePath)
		.resize(500, 500, {
			fit: 'cover',
			position: 'center',
		})
		.jpeg({ quality: 80 })
		.toFile(processedPath);

	// Delete original file
	fs.unlinkSync(filePath);

	return processedPath;
};
