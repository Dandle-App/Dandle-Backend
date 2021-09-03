import {Request, Response} from "express";

import express from 'express';
import {logger} from "../logging";
const router = express.Router();

/* GET home page. */
export let indexRoute = router.get('/', async (req: Request, res: Response) => {
  logger.info("Here is an info log!")
  logger.error("Here is an error log!")
  await res.json({
    message: "This is index page!"
  })
});

