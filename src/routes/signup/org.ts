import express, { Request, Response } from 'express';
import Organization from '../../models/organization';
import bcrypt from 'bcrypt';
import { logger } from '../../logging';

const router = express.Router();

export let orgSignUpRouter = router.post('/', async (req: any, res: Response) => {
    JSON.stringify(req.body);
    const hashedOrgPassword: String = bcrypt.hashSync(req.body.password_hash, 10);
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
    } catch  {
        await res.json({
            message: "Error inserting doc",
        })
    }
});