import express from 'express';
import staffSignInRouter from './staff';

const signInRouter = express.Router();

signInRouter.use(staffSignInRouter);

export default signInRouter;
