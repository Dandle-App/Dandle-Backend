/** Name - Staff.ts
 *  Description - staff typescript file for staff sign up.
 * */
import express, { NextFunction, Response, Request } from 'express';
import bcrypt from 'bcrypt';
import * as validator from 'express-validator';
import Staff from '../../models/staff';

const router = express.Router();

staffSignUpRouter.post('/staff',
  [
    validator
      .check('username')
      .exists()
      .notEmpty()
      .withMessage('Username cannot be empty.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must use a valid email.')
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
    try {
      const count = await Staff.countDocuments({ username: req.username });
      if (count === 0) {
        const hashedPassword: String = bcrypt.hashSync(req.password, 10);
        const doc = {
          username: req.username,
          staff_id: req.staff_id,
          staff_name: req.staff_name,
          password: hashedPassword,
        };
        const ent1 = new Staff(doc);
        await ent1.save();
        await res.json({
          successful: true,
        });
      } else {
        res.status(401).json({
          error: 'Account Already Exists',
        });
      }
    } catch (e) {
      res.status(404).json({
        error: e,
      });
    }
  });

export default staffSignUpRouter;
