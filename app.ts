import express from "express";
import path from "path";
import helmet from "helmet"
import {indexRoute} from "./routes";
import {middlewareLogger, logger} from "./logging";
import mongoose from "mongoose";
import dotenv from "dotenv";

async function prestart() {
    // Load the env file if there is one
    dotenv.config()

    // Connect to mongoose before continuing, if its not set then log the error and exit
    if (process.env.MONGO_CONN_STRING) {
        try {
            await mongoose.connect(process.env.MONGO_CONN_STRING)
            logger.info("Connected to MongoDB")
        } catch (e) {
            logger.error(e)
        }
    } else {
        logger.error("MongoDB connection string was not set!")
    }
}

// This is just a hacky way of avoiding using async/await syntax at top-level
prestart()

const app = express();
app.use(middlewareLogger)
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoute);

module.exports = app;

