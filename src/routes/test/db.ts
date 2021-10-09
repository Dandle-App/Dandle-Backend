import express, { Request, Response } from 'express';
import Organization from '../../models/organization';

const testDbRouter = express.Router();

/* GET home page. */
testDbRouter.get('/db', async (req: Request, res: Response) => {
  const ent1 = new Organization({ name: 'ent1' });
  const saveddoc = await ent1.save();
  await res.json({
    successful_insert: saveddoc === ent1,
  });
});

export default testDbRouter;
