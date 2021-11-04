import express from 'express';

import orgSignUpRouter from './org';
import staffSignUpRouter from './staff';

const signUpRouter = express.Router();

signUpRouter.use('/org', orgSignUpRouter);
signUpRouter.use('/staff', staffSignUpRouter);

export default signUpRouter;
