import express, {Request, Response} from 'express';
import { io } from "socket.io-client";
import { logger } from '../../logging';
import { param, validationResult, query } from 'express-validator';
import parser from 'body-parser';
import connectRedis from 'connect-redis';
import ioredis from 'ioredis';
import redisClient from '../../redis';

const router = express.Router();
interface InfoRequest extends Request {
    id?: string;
}
const requestInfoRouter = router.get('/',
    [
         query('id').isString().withMessage('id must be a string'),
    ],
    async (req: InfoRequest, res: Response) => {
        // check if request has error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error(errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        else {
            logger.info('Requesting info');
            logger.info(req.query.id);
            let queryId = JSON.stringify(req.query.id);
            redisClient.get(queryId, (err, reply) => {
                if(err){
                    res.status(401).json({err: err});
                    return;
                }
                else{
                    logger.info(reply);
                    // @ts-ignore
                    let replyStr = reply;
                    res.status(200).send({
                        message: replyStr,
                    });
                }

            });
        }
    });

export default requestInfoRouter;

