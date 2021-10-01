import express from 'express';
import staffSignInRouter from './staff';

const signInRouter = express.Router();

signInRouter.use('/staff', staffSignInRouter);

export default signInRouter;
