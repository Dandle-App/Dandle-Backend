import express, { Request, Response } from 'express';
import validator from 'express-validator';
import { logger } from '../../logging';

const router = express.Router();

interface InfoRequest extends Request {
  id: string;
}
const requestInfoRouter = router.get('/info',
  [
    validator.get('id').isString().withMessage('id must be a string'),
  ],
  async (req: InfoRequest, res: Response) => {
    // check if request has errors
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
  },
  async (_req: InfoRequest, res: Response) => {
    logger.info('Requesting info');
    res.status(200).send({
      message: 'Hello, world!',
    });
  });

export default requestInfoRouter;
