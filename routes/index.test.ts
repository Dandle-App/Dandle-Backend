import app from "../app";
import request from "supertest";

describe("GET /", () => {
    it("Index page status code", async () => {
        const result = await request(app).get("/");
        expect(result.statusCode).toEqual(200);
    });
});