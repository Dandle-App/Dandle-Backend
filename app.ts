import express from "express";
import path from "path";
import winston from "winston";
import expressWinston from "express-winston";
import helmet from "helmet"
import {indexRoute} from "./routes";
import {middlewareLogger} from "./logging";

const app = express();
app.use(middlewareLogger)
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoute);

module.exports = app;
