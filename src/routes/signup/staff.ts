import express, { Request, Response } from 'express';
import bcrypt from "bcrypt";
import User from "../../models/user";

const staffSignUpRouter = express.Router();

staffSignUpRouter.post('/staffsignup', async (req: any, res: Response) => {
    const hashedPassword: String = bcrypt.hashSync(req.password, 10);
    try {
        const doc = {
            username: req.staff_username,
            password: hashedPassword,
            staff_name: req.staff_name,
            orgs: req.orgs
        };
        const ent1 = new User(doc);
        const saveddoc = await ent1.save();
        await res.json({
            successful_insert: saveddoc === ent1,
        });
    } catch (e) {
        res.status(404).json({
            error: e,
        });
    }
});