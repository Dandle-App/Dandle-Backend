import express, { Response, Request, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as validator from 'express-validator';
import Organization from '../../models/organization';

const router = express.Router();

// eslint-disable-next-line import/prefer-default-export
const orgSignUpRouter = router.post('/',
  [
    validator
      .check('company_name')
      .exists()
      .notEmpty()
      .withMessage('Username cannot be empty.')
      .trim(),
    validator
      .check('company_email')
      .exists()
      .notEmpty()
      .withMessage('Email cannot be empty.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must use a valid email.')
      .trim(),
    validator
      .check('company_phone_num')
      .exists()
      .notEmpty()
      .withMessage('Username cannot be empty.')
      .isNumeric()
      .trim(),
    validator
      .check('password')
      .exists()
      .notEmpty()
      .withMessage('password cannot be empty')
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
  async (req: any, res: Response) => {
    JSON.stringify(req.body);
    const hashedOrgPassword: String = bcrypt.hashSync(req.body.password, 10);
    const doc = {
      company_name: req.body.company_name,
      company_email: req.body.company_email,
      company_phone_num: req.body.company_phone_num,
      password_hash: hashedOrgPassword,
    };
    try {
      const ent1 = new Organization(doc);
      const saveddoc = await ent1.save();
      await res.json({
        successful_insert: saveddoc,
      });
    } catch {
      await res.json({
        message: 'Error inserting doc',
      });
    }
  });

export default orgSignUpRouter;
