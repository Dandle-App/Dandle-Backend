import express, { NextFunction, Request, Response } from 'express';
import * as validator from 'express-validator';
import passport from 'passport';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../../logging';
import User from '../../models/user';

const staffSigninRouter = express.Router();

interface RefreshTokenI extends jwt.JwtPayload {
  username?: string;
}

staffSigninRouter.post(
  '/refresh-token',
  async (req: Request, res: Response): Promise<Response | void> => {
    // Look for the token in the cookies, then body, then return 401 if in neither
    let payload: RefreshTokenI;
    let tokenString: string;
    // Check in cookies
    if (req.cookies.refresh_token) {
      logger.debug('refresh token in cookies');
      try {
        tokenString = req.cookies.refresh_token;
        payload = jwt.verify(
          req.cookies.refresh_token,
          process.env.SECRET!,
        ) as JwtPayload;
      } catch (e) {
        logger.error(e);
        return res.status(401).json({
          error: JSON.stringify(e),
        });
      }

      // Check the body
    } else if (req.body.refresh_token) {
      logger.debug('refresh token in body');
      try {
        tokenString = req.body.refresh_token;
        payload = jwt.verify(
          req.cookies.refresh_token,
          process.env.SECRET!,
        ) as JwtPayload;
      } catch (e) {
        logger.error(e);
        return res.status(401).json({
          error: JSON.stringify(e),
        });
      }

      // Error out for no token found
    } else {
      return res.status(401).json({
        error: 'A refresh token must be provided as either a cookie or in body',
      });
    }

    // Get the user from the JWT payload
    const user = await User.findOne({ username: payload.username });

    // Check if the user was found
    if (!user) {
      return res.status(500).json({
        error: 'User not found',
      });
    }

    if (!user.refresh_tokens.includes(tokenString)) {
      return res.status(403).json({
        error: 'Invalid token',
      });
    }

    // Generate a new token
    const newToken = jwt.sign(
      {
        email: user.username,
        name: user.staff_name,
        orgs: user.orgs,
      },
      process.env.SESSION_SECRET!,
      {
        expiresIn: '7d',
      },
    );

    // Return the token to the client
    return res.json({
      token: newToken,
    });
  },
);

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
  ): Promise<Response | void> => {
    try {
      const errors = validator.validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).json({
          error: 'Username and/or password validation failure',
        });
      }
      passport.authenticate('local', (err, user, info) => {
        logger.debug(JSON.stringify(info));
        logger.debug(JSON.stringify(err));
        logger.debug(JSON.stringify(user));
        if (!user) {
          return res.status(401).json({
            error: 'Error occured while logging in user.',
          });
        }
        if (!user) {
          return res.status(401).json({
            error: 'User could not be matched.',
          });
        }
        req.login(user, next);
        const token = jwt.sign(
          {
            email: user.username,
            name: user.staff_name,
            orgs: user.orgs,
          },
          process.env.SESSION_SECRET!,
          {
            expiresIn: '7d',
          },
        );

        const refreshToken = jwt.sign(
          {
            user: user.username,
          },
          process.env.SESSION_SECRET!,
          {
            expiresIn: '30d',
          },
        );

        return res
          .cookie(refreshToken, refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
          })
          .json({
            success: true,
            user: user.username,
            token,
            refreshToken,
          });
      })(req, res, next);
    } catch (e: any) {
      logger.error(JSON.stringify(e));
      // Return an error res in case something happened
      return res.status(404).json({
        error: 'An unknown error occurred',
      });
    }

    return res.status(500).json({
      error: 'Unexpected error occurred',
    });
  },
);

export default staffSigninRouter;
