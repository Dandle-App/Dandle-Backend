import {server as app} from '../../../src/app';
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
            .field('company_email', 'testus@gmail.com')
            .field('password', 'password1234')
            .field('company_name', 'Company')
            .field('company_phone_num', '1234567890')
            .expect(200);
        logger.info(JSON.stringify(res_good.body));
        expect(res_good.body).toHaveProperty('successful_insert');
        await Organization.deleteOne({company_email: 'testus@gmail.com'})
    });

    it('should reject invalid inputs', async () => {
        const res_invalid_username = await request(app)
            .post('/signup/org')
            .type('form')
            .field('company_email', 'testuse')
            .field('password', 'password1234')
            .expect(401);

        expect(res_invalid_username.body).toHaveProperty('error');

        const res_invalid_password = await request(app)
            .post('/signup/org')
            .type('form')
            .field('company_email', 'testuse@test.com')
            .field('password', 'pass')
            .expect(401);

        expect(res_invalid_password.body).toHaveProperty('error');
    });
});