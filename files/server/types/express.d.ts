import express from 'express';
import { UserProps } from '.';
import { Express } from 'express';
import mongoose from 'mongoose';

declare global {
	namespace Express {
		interface Request {
			secret?: string;
			user?: UserProps;
			currentUser?: {
				userId: string;
				username?: string;
				email?: string;
				isAdmin?: boolean;
			};
		}
	}
}
