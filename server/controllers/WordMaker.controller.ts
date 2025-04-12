import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import AsyncHandler from '../middleware/AsyncHandler';
import WordsMakerModel from '../models/WordsMaker.model';
import { UserProgress } from '../models/UserProgress';

class WordMakerController {
	/**
	 * @description Create a new word maker
	 * @param {WordMaker} wordMaker - The word maker object
	 * @returns {Promise<WordMaker>} The created word maker object
	 */
	static createWordMaker = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const {
			level,
			description,
			hints,
			words,
			letters,
			gridSize,
			totalPoints,
			timeLimit,
			icon,
		} = req.body;

		const wordMaker = new WordsMakerModel({
			level,
			description,
			hints,
			words,
			letters,
			gridSize,
			totalPoints,
			timeLimit,
			icon,
		});

		await wordMaker.save();

		res.status(StatusCodes.CREATED).json(wordMaker);
	});

	/**
	 * @description Get all word makers
	 * @returns {Promise<WordMaker[]>} An array of word makers
	 */
	static getWordMakers = AsyncHandler(async (req: Request, res: Response) => {
		const wordMakers = await WordsMakerModel.find({});

		res.status(StatusCodes.OK).json(wordMakers);
	});

	/**
	 * @description Update a word maker by id
	 * @param {string} id - The id of the word maker
	 * @param {WordMaker} wordMaker - The word maker object
	 * @returns {Promise<WordMaker>} The updated word maker object
	 */
	static updateWordMaker = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const { id } = req.params;
		const {
			level,
			description,
			hints,
			words,
			letters,
			gridSize,
			totalPoints,
			timeLimit,
			icon,
		} = req.body;

		const wordMaker = await WordsMakerModel.findByIdAndUpdate(
			id,
			{
				level,
				description,
				hints,
				words,
				letters,
				gridSize,
				totalPoints,
				timeLimit,
				icon,
			},
			{ new: true }
		);

		if (!wordMaker) {
			throw new NotFoundError('WordMaker not found');
		}

		res.status(StatusCodes.OK).json(wordMaker);
	});

	/**
	 * @description Delete a word maker by id
	 * @param {string} id - The id of the word maker
	 * @returns {Promise<WordMaker>} The deleted word maker object
	 */
	static deleteWordMaker = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const { id } = req.params;

		const wordMaker = await WordsMakerModel.findByIdAndDelete(id);

		if (!wordMaker) {
			throw new NotFoundError('WordMaker not found');
		}

		res.status(StatusCodes.OK).json(wordMaker);
	});

	/**
	 * @description Get a word maker by id
	 * @param {string} id - The id of the word maker
	 * @returns {Promise<WordMaker>} The word maker object
	 */
	static getWordMaker = AsyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;

		const wordMaker = await WordsMakerModel.findById(id);

		if (!wordMaker) {
			throw new NotFoundError('WordMaker not found');
		}

		res.status(StatusCodes.OK).json(wordMaker);
	});

	static getUserProgress = AsyncHandler(async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		if (!userId) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const totalLevels = await WordsMakerModel.countDocuments({});

		const userProgress = await UserProgress.find({ userId });

		const nextLevel =
			totalLevels < userProgress.length
				? totalLevels + 1
				: userProgress.length + 1;

		res.status(StatusCodes.OK).json({ totalLevels, userProgress, nextLevel });
	});

	static createUserProgress = AsyncHandler(
		async (req: Request, res: Response) => {
			const userId = req.user?.userId;
			if (!userId) {
				throw new UnauthorizedError('Unauthorized access');
			}

			const { level, score, wordsFound, timeSpent } = req.body;
			const userProgress = await UserProgress.findOne({ userId, level });

			if (userProgress) {
				throw new BadRequestError('User progress in this level already exists');
			}

			let status = '';

			if (wordsFound.length === 0) {
				status = 'unlocked';
			} else {
				status = 'completed';
			}

			const stars = calculateStars(score, timeSpent);

			const progress = new UserProgress({
				userId,
				level,
				score,
				wordsFound,
				timeSpent,
				stars,
				status,
				completedAt: new Date(),
			});

			await progress.save();

			res.status(StatusCodes.CREATED).json(progress);
		}
	);

	static updateUserProgress = AsyncHandler(
		async (req: Request, res: Response) => {
			const userId = req.user?.userId;
			if (!userId) {
				throw new UnauthorizedError('Unauthorized access');
			}

			const { level, score, wordsFound, timeSpent } = req.body;

			const userProgress = await UserProgress.findOne({ userId, level });

			if (!userProgress) {
				throw new NotFoundError('User progress not found');
			}

			// Calculate stars based on performance
			const stars = calculateStars(score, timeSpent);

			const progress = await UserProgress.findOneAndUpdate(
				{ userId, level },
				{
					score,
					wordsFound,
					timeSpent,
					stars,
					status: 'completed',
					completedAt: new Date(),
				},
				{ upsert: true, new: true }
			);

			res.json(progress);
		}
	);
}

const calculateStars = (score: number, timeSpent: number): number => {
	// Example star calculation logic
	if (score >= 90) return 3;
	if (score >= 70) return 2;
	if (score >= 50) return 1;
	return 0;
};

export default WordMakerController;
