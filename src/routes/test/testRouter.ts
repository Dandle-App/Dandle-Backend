import express from 'express';
import { testDbRouter } from './db';

const testRouter = express.Router();

testRouter.use('/db', testDbRouter);

export default testRouter;
