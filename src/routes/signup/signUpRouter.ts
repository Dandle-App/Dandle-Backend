import express from 'express';
import staffSignInRouter from "../signin/staff";
import signInRouter from "../signin/signInRouter";
import { orgSignUpRouter } from './org';
import { staffSignUpRouter } from './staff';

import orgSignUpRouter from './org';
import staffSignUpRouter from './staff';

const signUpRouter = express.Router();

signUpRouter.use('/org', orgSignUpRouter);
signUpRouter.use('/staff', staffSignUpRouter);

export default signUpRouter;
