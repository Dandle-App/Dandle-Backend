import express, { Request, Response } from 'express';

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', async (req: Request, res: Response) => {

  await res.json({
    message: 'This is index page! changed',
  });
});

export default indexRouter;
