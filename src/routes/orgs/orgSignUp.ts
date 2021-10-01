// @ts-ignore
import express, { Request, Response } from 'express';
import Organization from '../../models/organization';
import { logger, middlewareLogger } from '../../logging';


const router = express.Router();

export let orgSignUpRoute = router.post('/orgsignup', async (req: any, res: Response) => {
    JSON.stringify(req.body);
    const doc = {
        name: req.body.name,
        location: req.body.location,
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

