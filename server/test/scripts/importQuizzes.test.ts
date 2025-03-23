import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from '../../models/User.model';
import Quiz from '../../models/Quiz.model';

// Mock the dependencies
jest.mock('mongoose');
jest.mock('fs');
jest.mock('path');
jest.mock('../../models/User.model');
jest.mock('../../models/Quiz.model');

// Import the functions after mocking
import {
	ensureAdminExists,
	importQuizzes,
} from '../../scripts/importQuizzesModule';

describe('Import Quizzes Functionality', () => {
	// Setup and teardown
	beforeAll(() => {
		process.env.MONGO_URI = 'mongodb://test-uri';
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		delete process.env.MONGO_URI;
	});

	describe('ensureAdminExists', () => {
		it('should return existing admin user ID if admin exists', async () => {
			// Mock admin user already exists
			const mockAdminId = 'admin-id-123';
			const mockAdmin = { _id: mockAdminId };
			(User.findOne as jest.Mock).mockResolvedValue(mockAdmin);

			const result = await ensureAdminExists();

			expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@quizify.com' });
			expect(result).toBe(mockAdminId);
		});

		it('should create a new admin user if none exists', async () => {
			// Mock admin user does not exist
			const mockAdminId = 'new-admin-id-456';
			(User.findOne as jest.Mock).mockResolvedValue(null);

			const mockUserInstance = {
				_id: mockAdminId,
				save: jest.fn().mockResolvedValue(true),
			};
			(User as unknown as jest.Mock).mockImplementation(() => mockUserInstance);

			const result = await ensureAdminExists();

			expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@quizify.com' });
			expect(User).toHaveBeenCalledWith({
				username: 'admin',
				email: 'admin@quizify.com',
				password: 'admin123',
				isAdmin: true,
				name: 'Admin User',
			});
			expect(mockUserInstance.save).toHaveBeenCalled();
			expect(result).toBe(mockAdminId);
		});

		it('should handle errors during admin creation', async () => {
			// Mock an error during user creation
			const mockError = new Error('Database error');
			(User.findOne as jest.Mock).mockRejectedValue(mockError);

			// Mock process.exit to prevent test from exiting
			const mockExit = jest
				.spyOn(process, 'exit')
				.mockImplementation((() => {}) as any);

			await ensureAdminExists();

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});
	});

	describe('importQuizzes', () => {
		it('should import quizzes from JSON file', async () => {
			// Mock admin user
			const mockAdminId = 'admin-id-123';
			jest.spyOn(global.console, 'log').mockImplementation(() => {});

			// Mock the ensureAdminExists function
			jest.mock('../../scripts/importQuizzesModule', () => ({
				...jest.requireActual('../../scripts/importQuizzesModule'),
				ensureAdminExists: jest.fn().mockResolvedValue(mockAdminId),
			}));

			// Mock reading the quiz data
			const mockQuizData = [
				{ title: 'Quiz 1', questions: [] },
				{ title: 'Quiz 2', questions: [] },
			];
			(fs.readFileSync as jest.Mock).mockReturnValue(
				JSON.stringify(mockQuizData)
			);
			(path.join as jest.Mock).mockReturnValue('/path/to/quizzes.json');

			// Mock database operations
			(Quiz.deleteMany as jest.Mock).mockResolvedValue({});
			(Quiz.insertMany as jest.Mock).mockResolvedValue(mockQuizData);
			(mongoose.disconnect as jest.Mock).mockResolvedValue({});

			await importQuizzes();

			// Check if quizzes were processed correctly
			expect(Quiz.deleteMany).toHaveBeenCalledWith({ createdBy: mockAdminId });
			expect(Quiz.insertMany).toHaveBeenCalled();

			// Verify that timestamps and createdBy were set
			const insertCall = (Quiz.insertMany as jest.Mock).mock.calls[0][0];
			expect(insertCall.length).toBe(2);
			expect(insertCall[0].createdBy).toBe(mockAdminId);
			expect(insertCall[0].createdAt).toBeInstanceOf(Date);
			expect(insertCall[0].updatedAt).toBeInstanceOf(Date);

			// Verify mongoose was disconnected
			expect(mongoose.disconnect).toHaveBeenCalled();
		});

		it('should handle errors during quiz import', async () => {
			// Mock an error during quiz import
			const mockError = new Error('Import error');
			(fs.readFileSync as jest.Mock).mockImplementation(() => {
				throw mockError;
			});

			// Mock process.exit to prevent test from exiting
			const mockExit = jest
				.spyOn(process, 'exit')
				.mockImplementation((() => {}) as any);
			jest.spyOn(global.console, 'error').mockImplementation(() => {});

			await importQuizzes();

			expect(mongoose.disconnect).toHaveBeenCalled();
			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});
	});
});
