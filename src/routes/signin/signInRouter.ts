import express from 'express';
import staffSignInRouter from './staff';
import orgSignInRouter from './org';

const signInRouter = express.Router();

signInRouter.use('/staff', staffSignInRouter);
signInRouter.use('/org', orgSignInRouter);
export default signInRouter;
