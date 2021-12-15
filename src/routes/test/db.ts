import express, { Request, Response } from 'express';
import Organization from '../../models/organization';

const router = express.Router();

/* GET home page. */
export let testDbRouter = router.get('/', async (req: Request, res: Response) => {
  const ent1 = new Organization({ name: 'ent1' });
  const saveddoc = await ent1.save();
  await res.json({
    successful_insert: saveddoc === ent1,
  });
});
