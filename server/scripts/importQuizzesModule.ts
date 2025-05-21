import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Quiz from '../models/Quiz.model';
import User from '../models/User.model';

// Connect to MongoDB
export const connectToDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI as string);
		console.log('MongoDB connected for quiz import');
	} catch (err) {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	}
};

// Function to create admin user if it doesn't exist
export async function ensureAdminExists() {
	try {
		// Look for existing admin user
		let adminUser = await User.findOne({ email: 'admin@quizify.com' });

		if (!adminUser) {
			// Create admin user if it doesn't exist
			adminUser = new User({
				username: 'admin',
				email: 'admin@quizify.com',
				password: 'admin123', // Will be hashed by the model
				isAdmin: true,
				name: 'Admin User',
			});

			await adminUser.save();
			console.log('Admin user created successfully');
		} else {
			console.log('Admin user already exists');
		}

		return adminUser._id;
	} catch (error) {
		console.error('Error creating admin user:', error);
		process.exit(1);
	}
}

// Import quizzes
export async function importQuizzes() {
	try {
		// Ensure admin user exists
		const adminId = await ensureAdminExists();

		// Read quiz data
		const quizData = JSON.parse(
			fs.readFileSync(path.join(__dirname, '../data/quizzes.json'), 'utf8')
		);

		console.log(`Found ${quizData.length} quizzes to import`);

		// Delete existing quizzes created by admin
		await Quiz.deleteMany({ createdBy: adminId });
		console.log('Deleted existing admin quizzes');

		// Process each quiz
		for (const quiz of quizData) {
			// Replace createdBy string with actual admin ID
			quiz.createdBy = adminId;

			// Add timestamps
			const now = new Date();
			quiz.createdAt = now;
			quiz.updatedAt = now;
		}

		// Insert all quizzes
		await Quiz.insertMany(quizData);
		console.log(`Successfully imported ${quizData.length} quizzes`);

		mongoose.disconnect();
		console.log('MongoDB disconnected');
	} catch (error) {
		console.error('Error importing quizzes:', error);
		mongoose.disconnect();
		process.exit(1);
	}
}

// This is only used when this file is run directly
if (require.main === module) {
	connectToDB().then(() => {
		importQuizzes();
	});
}
