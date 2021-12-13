import express from 'express'
import requestInfoRouter from "./info";

const requestRouter = express.Router();

requestRouter.use('/info', requestInfoRouter);

export default requestRouter;