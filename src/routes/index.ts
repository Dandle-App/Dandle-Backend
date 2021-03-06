import express, { Request, Response } from 'express';
import {logger} from '../logging';

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', async (req: Request, res: Response) => {
  await res.json({
    message: 'This is index page!',
  });
});

export default indexRouter;
