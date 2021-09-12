import express from "express";
import path from "path";
import winston from "winston";
import expressWinston from "express-winston";
import helmet from "helmet"
import {indexRoute} from "./routes";
import {logger, middlewareLogger} from "./logging";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Organization from "./models/organization";

dotenv.config();




const app = express();

mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        logger.info("mongo connection successful");
    })
    .catch(() => {
        logger.info("mongo connection error");
    });





// example document ent1
const ent1 = new Organization({name: "ent1"});
ent1.save()
    .then(() => {
        logger.info("adding model successful");
    })
    .catch(() => {
        logger.info("adding model failed");
    });

app.use(middlewareLogger)
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoute);

module.exports = app;
