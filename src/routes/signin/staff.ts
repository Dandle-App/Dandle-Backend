import express, {NextFunction, Request, Response} from 'express';
import * as validator from 'express-validator';
import passport from "passport";
import {logger} from "../../logging";

const router = express.Router();

/* GET home page. */
router.post('/staff', [
        validator.check('username').notEmpty().trim().isEmail().normalizeEmail().withMessage('Must use a valid email.'),
        validator.check('password').notEmpty().trim().isLength({min: 6, max: 26})
    ], async (req: Request, res: Response, next: NextFunction) => {
        const errors = validator.validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(401).json({
                error: "Username and/or password validation failure",
                verbose: errors
            })
        }
        passport.authenticate('local', (err, user, info) => {
            logger.info(err)
            logger.info(user)
            logger.info(info)
            if (err) {
                return res.status(401).json({
                    error: 'Error occured while logging in user.',
                    verbose: err
                })
            }
            if (!user) {
                return res.status(401).json({
                    error: 'User could not be matched.'
                })
            }
            req.login(user, next)
            return res.json({
                success: true,
                user: user.username
            })
        })(req, res, next)
    }
);