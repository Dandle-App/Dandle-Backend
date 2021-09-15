import express, { Request, Response } from 'express';

const router = express.Router();

/* GET home page. */
export let indexRoute = router.get('/', async (req: Request, res: Response) => {
    await res.json({
        message: 'This is index page!',
    });
});
