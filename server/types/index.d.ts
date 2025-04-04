import { Types } from 'mongoose';
import { Response as ExpressResponse } from 'express';

export type UserProps = {
	userId: Types.ObjectId;
	name: string;
	email: string;
	username: string;
	isAdmin: boolean;
};

export type attachCookieProps = {
	res: ExpressResponse;
	token: string;
	user: UserProps;
};
