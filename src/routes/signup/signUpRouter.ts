import express from 'express';
import staffSignInRouter from "../signin/staff";
import signInRouter from "../signin/signInRouter";
import { orgSignUpRouter } from "./org"

const signUpRouter = express.Router();

signUpRouter.use('/org', orgSignUpRouter);

export default signUpRouter;
