import {server as app} from '../../../src/app';
import request from 'supertest';
import mongoose from 'mongoose';
import { logger } from '../../../src/logging';
import redisClient from '../../../src/redis';
import Staff from '../../../src/models/staff';
import bcrypt from 'bcrypt';
import jwt_decode from 'jwt-decode';
import { CookieAccessInfo } from 'cookiejar';
import { assert } from 'console';

describe('GET /signin/staff', () => {
  beforeAll((done) => {
    logger.transports[0].level = 'warn';
    Staff.findOneAndUpdate(
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
    Staff.deleteOne({
      username: 'testuse@test.com',
      password: bcrypt.hashSync('password1234', 10),
      staff_name: 'Test McTesterson',
    }).then(() => {
      mongoose.disconnect().then(() => {
        redisClient.quit().then(() => {
          done();
        });
      });
    });
  });

  it('should fail if invalid params are sent', async () => {
    const res_created = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'testuse')
      .field('password', 'pass')
      .field('staffName', 'John Doe')
      .expect(401);

    expect(res_created.body).toHaveProperty('error');
  });

  it('should fail if invalid params are sent', async () => {
    const res_created = await request(app)
      .post('/signin/staff')
      .type('form')
      .field('username', 'tes')
      .field('password', 'password1234')
      .field('staffName', 'John Doe')
      .expect(401);

    expect(res_created.body).toHaveProperty('error');
  });
});
