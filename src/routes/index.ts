import {Request, Response} from "express";

import express from 'express';
import {logger} from "../logging";
const router = express.Router();

/* GET home page. */
export let indexRoute = router.get('/', async (req: Request, res: Response) => {
  await res.json({
    message: "This is index page!"
  })
});

