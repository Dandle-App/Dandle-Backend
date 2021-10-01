import express, { NextFunction, Request, Response } from 'express';
import * as validator from 'express-validator';
import passport from 'passport';
import { logger } from '../../logging';

const staffSigninRouter = express.Router();

staffSigninRouter.post(
  '/',
  [
    validator
      .check('username')
      .notEmpty()
      .withMessage('Username cannot be empty.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must use a valid email.')
      .trim(),
    validator
      .check('password')
      .notEmpty()
      .withMessage('password cannot be empty')
      .isLength({ min: 6, max: 26 })
      .withMessage('Password must be at 6-26 char long.')
      .trim(),
  ],
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      logger.info(`req object: \n${JSON.stringify(req.body)}`);
      const errors = validator.validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).json({
          error: 'Username and/or password validation failure',
          verbose: errors,
        });
      }
      passport.authenticate('local', (err, user, info) => {
        logger.debug(JSON.stringify(info));
        logger.debug(JSON.stringify(err));
        logger.debug(JSON.stringify(user));
        if (!user) {
          return res.status(401).json({
            error: 'Error occured while logging in user.',
            verbose: info,
          });
        }
        if (!user) {
          return res.status(401).json({
            error: 'User could not be matched.',
          });
        }
        req.login(user, next);
        return res.json({
          success: true,
          user: user.username,
        });
      })(req, res, next);
    } catch (e: any) {
      logger.error(JSON.stringify(e));
      // Return an error res in case something happened
      return res.status(404).json({
        error: 'An unknown error occurred',
      });
    }
    return undefined;
  },
);

export default staffSigninRouter;
