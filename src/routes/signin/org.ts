import express, { NextFunction, Request, Response } from 'express';
import * as validator from 'express-validator';
import passport from 'passport';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../../logging';
import Organization, { OrgI } from '../../models/organization';

const orgSignInRouter = express.Router();

interface RefreshTokenI extends jwt.JwtPayload {
  company_email?: string,
}

orgSignInRouter.post(
  '/refresh-token',
  [
    validator.oneOf(
      [
        validator
          .cookie('refresh_token')
          .exists()
          .notEmpty()
          .isString()
          .trim()
          .withMessage('Token value in body must not be empty if provided.')
          .matches('(^[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*$)')
          .withMessage('Token is not a proper JWT'),
        validator
          .body('refresh_token')
          .exists()
          .notEmpty()
          .isString()
          .trim()
          .withMessage('Token value in body must not be empty if provided.')
          .matches('(^[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*$)')
          .withMessage('Token is not a proper JWT'),
      ],
      'You must provide a valid token in either cookies or body.',
    ),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({
        error: 'Username/Password Validation Error',
      });
    }
    return next();
  },
  async (req: Request, res: Response): Promise<Response | void> => {
    // Look for the token in the cookies, then body, then return 401 if in neither
    let tokenString: string;
    // Check in cookies
    if (req.cookies.refresh_token) {
      logger.debug('refresh token in cookies');
      tokenString = req.cookies.refresh_token;
      // Check the body
    } else if (req.body.refresh_token) {
      logger.debug('refresh token in body');
      tokenString = req.body.refresh_token;
      // Error out for no token found
    } else {
      // Should technically never actually happen do to validation, but typescript needs it.
      return res.status(401).json({
        error: 'A refresh token must be provided as either a cookie or in body',
      });
    }

    let payload: RefreshTokenI;

    try {
      payload = jwt.verify(tokenString, process.env.SECRET!) as JwtPayload;
    } catch (e) {
      logger.error(e);
      return res.status(401).json({
        error: JSON.stringify(e),
      });
    }

    const org = await Organization.findOne({ company_email: payload.company_email });

    if (!org) {
      return res.status(500).json({
        error: 'Company not found.',
      });
    }
    if (!org.refresh_tokens.includes(tokenString)) {
      return res.status(403).json({
        error: 'Invalid token.',
      });
    }

    const newToken = jwt.sign({
      company_email: org.company_email,
    },
    process.env.SESSION_SECRET!,
    {
      expiresIn: '7d',
    });

    return res.json({
      token: newToken,
    });
  },
);

orgSignInRouter.post(
  '/',
  [
    validator
      .check('username')
      .exists()
      .notEmpty()
      .withMessage('Field must not be empty')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be valid email')
      .trim(),
    validator
      .check('password')
      .exists()
      .notEmpty()
      .withMessage('Password field empty')
      .isLength({ min: 6, max: 26 })
      .withMessage('Password must be at 6-26 char long.')
      .trim(),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({
        error: errors,
      });
    }
    return next();
  },
  passport.authenticate('local-org'),
  async (req: Request, res: Response): Promise<Response | void> => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Error occured in company login.',
      });
    }
    const user = req.user as OrgI;
    if (!user) {
      return res.status(401).json({
        error: 'No match for company.',
      });
    }
    const token = jwt.sign(
      {
        type: 'ORG',
        company_email: user.company_email,
      },
      process.env.SESSION_SECRET!,
      {
        expiresIn: '7d',
      },
    );
    const refreshToken = jwt.sign(
      {
        user: user.company_email,
      },
      process.env.SESSION_SECRET!,
      {
        expiresIn: '30d',
      },
    );
    res.cookie(refreshToken, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return res.json({
      success: true,
      user: user.company_email,
      token,
      refreshToken,
    });
  },
);

export default orgSignInRouter;
