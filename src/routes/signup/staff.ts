import express, { Response } from 'express';
import bcrypt from 'bcrypt';

const staffSignUpRouter = express.Router();

staffSignUpRouter.post('/db', async (req: any, res: Response) => {
  const hashedPassword: String = bcrypt.hashSync(req.password, 10);
  try {
    const doc = {
      staff_id: req.staff_id,
      staff_name: req.staff_name,
      staff_password: hashedPassword,
    };
    const ent1 = new User(doc);
    const saveddoc = await ent1.save();
    await res.json({
      successful: saveddoc === ent1,
    });
  } catch (e) {
    res.status(404).json({
      error: e,
    });
  }
});
