import app from '../../../src/app';
import request from 'supertest';
import mongoose from 'mongoose';
import { logger } from '../../../src/logging';
import redisClient from '../../../src/redis';
import Organization from '../../../src/models/organization';
import bcrypt from 'bcrypt';
import jwt_decode from 'jwt-decode';
import {CookieAccessInfo} from 'cookiejar';

describe('GET /signup/org', () => {
    beforeAll((done) => {
        logger.transports[0].level = 'warn';
        Organization.findOneAndUpdate(
            {
                company_email: 'testuse@test.com',
                password_hash: bcrypt.hashSync('password1234', 10),
                company_name: 'Test McTesterson',
            },
            {
                upsert: true,
            },
        ).catch((error) => {
            if (error.code !== 11000) logger.error(JSON.stringify(error));
        });

        done();
    });

    afterAll((done) => {
        Organization.deleteOne({
            company_email: 'testuse@test.com',
            password_hash: bcrypt.hashSync('password1234', 10),
            company_name: 'Test McTesterson',
        }).catch((error) => {
            logger.error(JSON.stringify(error));
        });
        mongoose.disconnect().then(() => {
            logger.info('Closing the DB connection...');
            redisClient.quit();
            done();
        });
    });
    it('should accept a valid company_name and password', async () => {
        const res_good = await request(app)
            .post('/signup/org')
            .type('form')
            .field('company_email', 'testuse@test.com')
            .field('password', 'password1234')
            .expect(200);

        expect(res_good.body).toHaveProperty('success');
        expect(res_good.body).toHaveProperty('user');
        expect(res_good.body).toHaveProperty('token');

        expect(res_good.body.success).toBeTruthy();
        expect(res_good.body.user).toEqual('testuse@test.com');
        let decodedJWT = jwt_decode(res_good.body.token);
        expect(decodedJWT).toBeDefined();
        expect(decodedJWT).toHaveProperty('company_email');
        expect(decodedJWT).toHaveProperty('company_name');
        expect(decodedJWT).toHaveProperty('company_phone_num');
    });

    it('should reject invalid inputs', async () => {
        const res_invalid_username = await request(app)
            .post('/signup/org')
            .type('form')
            .field('company_email', 'testuse')
            .field('password', 'password1234')
            .expect(401);

        expect(res_invalid_username.body).toHaveProperty('error');
        expect(res_invalid_username.body.error).toEqual(
            'Company_email and/or password validation failure',
        );

        const res_invalid_password = await request(app)
            .post('/signup/org')
            .type('form')
            .field('company_email', 'testuse@test.com')
            .field('password', 'pass')
            .expect(401);

        expect(res_invalid_password.body).toHaveProperty('error');
        expect(res_invalid_password.body.error).toEqual(
            'Company_email and/or password validation failure',
        );
    });
});