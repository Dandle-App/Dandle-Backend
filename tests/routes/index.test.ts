import app from "../../src/app";
import request from "supertest";
import mongoose from "mongoose";
import {logger} from "../../src/logging";
import redisClient from "../../src/redis"

describe("GET /", () => {
    afterEach((done) => {
        mongoose.disconnect().then(() => {
            logger.info("Closing the DB connection...")
            redisClient.quit()
            done()
        })
    })
    it("to be json response with the correct message.",  async () => {
       const res = await request(app)
           .get("/")
           .expect(200)

       expect(res.body.message).toEqual('This is index page!')
    });
});