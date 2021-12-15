import express, { Request, Response } from 'express';
import { validationResult, query } from 'express-validator';
import { logger } from '../../logging';
import redisClient from '../../redis';

const router = express.Router();
interface InfoRequest extends Request {
  id?: string;
}
const requestInfoRouter = router.get('/',
  [
    query('id').isString().withMessage('id must be a string'),
  ],
  // eslint-disable-next-line consistent-return
  async (req: InfoRequest, res: Response) => {
    // check if request has error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    logger.info('Requesting info');
    logger.info(req.query.id);
    let queryId = req.query.id;
    // @ts-ignore
    queryId = queryId.toString();
    try {
      const reply = await redisClient.get(queryId);
      logger.info(reply);
      const replyStr = JSON.stringify(reply);
      res.status(200).send({
        message: replyStr,
      });
    } catch (e) {
      res.status(401).json({ err: e });
    }
    // previous implementation using callbacks. (works)

    /* await redisClient.get(queryId, (err, reply) => {
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
            }); */
  });

export default requestInfoRouter;
