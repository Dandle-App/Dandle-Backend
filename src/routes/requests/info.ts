import express, {Request, Response} from 'express';
import { io } from "socket.io-client";
import { logger } from '../../logging';
import { param, validationResult } from 'express-validator';
import parser from 'body-parser';
import connectRedis from 'connect-redis';
import redisClient from '../../redis';

const router = express.Router();

interface InfoRequest extends Request {
    id: string;
}
const requestInfoRouter = router.get('/',
    [
         param('id').isString().withMessage('id must be a string'),
    ],
    async (req: any, res: Response) => {
        // check if request has errors
        JSON.stringify(req.body);
        logger.info(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error(errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
    },
    async (_req: any, res: Response) => {
        logger.info('Requesting info');
        // redis connect stuff here
        res.status(200).send({
            message: 'Hello, world!',
        });
    });

export default requestInfoRouter;

