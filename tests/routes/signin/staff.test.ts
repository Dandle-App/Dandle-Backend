import app from '../../../src/app';
import request from 'supertest';
import mongoose from 'mongoose';
import { logger } from '../../../src/logging';
import redisClient from '../../../src/redis';
import User from '../../../src/models/user';
import bcrypt from 'bcrypt';
import jwt_decode from 'jwt-decode';

describe('GET /signin/staff', () => {
  beforeAll((done) => {
    logger.transports[0].level = 'warn';
    User.findOneAndUpdate(
      {
        username: 'testuse@test.com',
        password: bcrypt.hashSync('password1234', 10),
        staff_name: 'Test McTesterson',
      },
      {
        $push: {
          orgs: {
            org_id: 'org123456789',
            is_admin: true,
            staff_id: 29471823,
          },
        },
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
    User.deleteOne({
      username: 'testuse@test.com',
      password: bcrypt.hashSync('password1234', 10),
      staff_name: 'Test McTesterson',
    }).catch((error) => {
      logger.error(JSON.stringify(error));
    });
    mongoose.disconnect().then(() => {
      logger.info('Closing the DB connection...');
      redisClient.quit();
      done();
    });
  });
  it('should accept a valid username and password', async () => {
    const res_good = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'testuse@test.com')
      .field('password', 'password1234')
      .expect(200);

    expect(res_good.body).toHaveProperty('success');
    expect(res_good.body).toHaveProperty('user');
    expect(res_good.body).toHaveProperty('token');

    expect(res_good.body.success).toBeTruthy();
    expect(res_good.body.user).toEqual('testuse@test.com');
    let decodedJWT = jwt_decode(res_good.body.token);
    expect(decodedJWT).toBeDefined();
    expect(decodedJWT).toHaveProperty('email');
    expect(decodedJWT).toHaveProperty('name');
    expect(decodedJWT).toHaveProperty('orgs');
  });
  it('should accept a reject incorrect username', async () => {
    const res_incorrect_username = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'test@test.com')
      .field('password', 'password123')
      .expect(401);

    expect(res_incorrect_username.body).toHaveProperty('error');
    expect(res_incorrect_username.body.error).toEqual(
      'Error occured while logging in user.',
    );
  });
  it('should reject incorrect password', async () => {
    const res_incorrect_password = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'tst@test.com')
      .field('password', 'password1234')
      .expect(401);

    expect(res_incorrect_password.body).toHaveProperty('error');
    expect(res_incorrect_password.body.error).toEqual(
      'Error occured while logging in user.',
    );
  });

  it('should reject invalid inputs', async () => {
    const res_invalid_username = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'testuse')
      .field('password', 'password1234')
      .expect(401);

    expect(res_invalid_username.body).toHaveProperty('error');
    expect(res_invalid_username.body.error).toEqual(
      'Username and/or password validation failure',
    );

    const res_invalid_password = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'testuse@test.com')
      .field('password', 'pass')
      .expect(401);

    expect(res_invalid_password.body).toHaveProperty('error');
    expect(res_invalid_password.body.error).toEqual(
      'Username and/or password validation failure',
    );
  });
});