import express from "express";
import helmet from "helmet"
import {indexRoute} from "./routes";
import {logger, middlewareLogger} from "./logging";
import mongoose from "mongoose";
import dotenv from "dotenv";

import {testdbroute} from "./routes/test/db";

dotenv.config();
const app = express();

async function prestart() {
    // Connect to mongoose before continuing, if its not set then log the error and exit
    if (process.env.MONGODB_URI) {
        try {
            await mongoose.connect(process.env.MONGODB_URI)
            logger.info("Connected to MongoDB")
        } catch (e) {
            logger.error("Could not connect")
        }
    } else {
        logger.error("MongoDB connection string was not set!")
        process.exit(1)
    }
}

// This is just a hacky way of avoiding using async/await syntax at top-level
prestart().catch(e => {
    logger.error("Error occurred during prestart!")
})

app.use(middlewareLogger) // for logging internal express logging
app.use(helmet()) // security basics
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', indexRoute);
app.use('/test', testdbroute);

export default app;