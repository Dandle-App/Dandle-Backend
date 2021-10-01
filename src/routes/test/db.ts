import express, { Request, Response } from 'express';
import Organization from '../../models/organization';

const router = express.Router();

/* GET home page. */
export let testdbroute = router.get(
    '/db',
    async (req: Request, res: Response) => {
        const ent1 = new Organization({ name: 'for_demo_day_1' });
        const saveddoc = await ent1.save();
        await res.json({
            successful_insert: saveddoc === ent1,
        });
    }
);
