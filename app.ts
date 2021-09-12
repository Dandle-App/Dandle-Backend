import express from "express";
import path from "path";
import winston from "winston";
import expressWinston from "express-winston";
import helmet from "helmet"
import {indexRoute} from "./routes";
import {logger, middlewareLogger} from "./logging";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();




const app = express();

mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        logger.info("mongo connection successful");
    })
    .catch(() => {
        logger.info("mongo connection error");
    });
const orgSchema = new mongoose.Schema({
    name: String,
    location: String,
    staff: [{
            staff_id: Number,
            staff_name: String,
            is_manager: Boolean,
        }],
    section: [{
        section_name: String,
        labor_category: String,
        units: [{
            unit_number: String,
            occupant: [{
                name: String,
                phone_number: String,
                request: {
                    menu1: String,
                    menu2: String,
                    menu3: String,
                    menu4: String,
                },
            }],
            qr_code: String,
            assigned_staff: Number,
        }]
    }]
});

const Organization = mongoose.model('Organization', orgSchema);

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
