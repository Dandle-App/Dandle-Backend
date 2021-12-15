import LocalStrategy from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import Staff, { StaffI } from '../models/staff';
import Organization, { OrgI } from '../models/organization';
import { logger } from '../logging';
import User, { UserI } from '../models/user';

module.exports = (passport: any) => {
  /**
   * Options for configuring JWT strategy
   * for more info visit:
   * https://github.com/mikenicholson/passport-jwt#configure-strategy
   */
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromBodyField('token'),
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: process.env.SESSION_SECRET,
  };
  /**
   * This is where we will actually use the JWT for authentication note that this
   * should be called with the {session: false} option. It does not need session at all for this
   * and it will avoid any issues with local-* strategies.
   * Find more info here:
   * https://github.com/mikenicholson/passport-jwt
   * AGAIN: ALWAYS CALL WITH SESSIONS OFF ({session: false})
   */
  passport.use(
    'jwt',
    new JWTStrategy(
      opts,
      /**
       *  Verified function for JWT, at this point the JWT is already verified.
       * @param jwtPayload payload of the JWT, see the signin routes for what this should be.
       * JWT should have a '.type' to denote if its a user, staff, or org
       * @param done (error, user) is the signature for this. User should be the user from one
       * of the models.
       */
      async (jwtPayload: JwtPayload, done) => {
        if (jwtPayload.type === 'STAFF') {
          try {
            const user = await Staff.findOne({
              company_email: jwtPayload.company_email,
            });
            if (user) {
              done(null, user);
            } else {
              done(null, null);
            }
          } catch (e) {
            logger.error(e);
            done(e);
          }
        }
        if (jwtPayload.type === 'ORG') {
          try {
            const user = await Organization.findOne({
              company_email: jwtPayload.company_email,
            });
            if (user) {
              done(null, user);
            } else {
              done(null, null);
            }
          } catch (e) {
            logger.error(e);
            done(e);
          }
        }
        done(jwtPayload, done);
      },
    ),
  );

  passport.use(
    'local-staff',
    new LocalStrategy.Strategy(
      /**
       * Handles the verification of staff using a company_email and password
       * @param company_email The company_email from the form
       * @param password The password from the form, still in plain text at this point,
       * needs to be hashed
       * @param done (error, user, {message: string}) is the signature for this, error should be
       * for success it should be (null, user), if verification failed then do
       * (null, null, {message: 'reason'}) and for exceptions then (error)
       */
      async (username: string, password: string, done) => {
        const count = await Staff.countDocuments({ username });
        if (count > 0) {
          const user = await Staff.findOne({ username });

          if (!user) {
            return done(null, false, {
              message: 'Incorrect username.',
            });
          }
          if (!bcrypt.compareSync(password, user.password)) {
            return done(null, null, {
              message: 'Incorrect password.',
            });
          }
          return done(null, user);
        }
        return done(null, false, { message: 'User not found' });
      },
    ),
  );
  passport.use(
    'local-org',
    new LocalStrategy.Strategy(
      (username: string, password: string, done: any) => {
        const company_email = username;
        const password_hash = password;
        Organization.countDocuments({ company_email }, (err, count) => {
          if (err) {
            const errorString: string = JSON.stringify(err);
            logger.error(errorString);
            done(null, null, {
              error: errorString,
            });
          }

          if (count > 0) {
            Organization.findOne(
              { company_email },
              (error: any, dbOrgDoc: any) => {
                if (error) {
                  return done(error);
                }
                if (!dbOrgDoc) {
                  return done(null, false, {
                    error: 'Incorrect company_email.',
                  });
                }

                logger.info(password_hash);
                logger.info(dbOrgDoc.password_hash);
                const passwordMatch = bcrypt.compareSync(
                  password_hash,
                  dbOrgDoc.password_hash,
                );

                if (!passwordMatch) {
                  return done(null, false, {
                    error: 'Incorrect password.',
                  });
                }
                return done(null, dbOrgDoc);
              },
            );
          } else {
            done(null, null, {
              error: 'Company not found.',
            });
          }
        });
      },
    ),
  );
  passport.use(
    'local-user',
    new LocalStrategy.Strategy(
      /**
       * Handles the verification of users using a company_email and password, essentially
       * the same thing as above but this time for users since they are different
       * db documents
       * @param company_email The company_email from the form
       * @param password The password from the form, still in plain text at this point,
       * needs to be hashed
       * @param done (error, user, {message: string}) is the signature for this, error should be
       * for success it should be (null, user), if verification failed then do
       * (null, null, {message: 'reason'}) and for exceptions then (error)
       */
      (company_email: string, password: string, done: any) => {
        User.countDocuments({ company_email }, (err, count) => {
          if (err) {
            const errorString: String = JSON.stringify(err);
            logger.error(errorString);
            done(null, null, {
              error: errorString,
            });
          }

          if (count > 0) {
            User.findOne({ company_email }, (error: any, user: any) => {
              if (error) {
                return done(error);
              }
              if (!user) {
                return done(null, false, {
                  error: 'Incorrect company_email.',
                });
              }
              if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {
                  error: 'Incorrect password.',
                });
              }
              return done(null, user);
            });
          } else {
            done(null, null, {
              error: 'User not found',
            });
          }
        });
      },
    ),
  );

  /**
   * Interface for having a standardized user between staff, user, and org
   */
  interface SessionUserI {
    username?: string;
    company_email?: string;
    type: 'USER' | 'STAFF' | 'ORG';
  }

  /**
   * This is responsible for putting the company_email into session to be
   * gotten later, for more info:
   * https://github.com/jwalton/passport-api-docs#passportserializeuserfnuser-done--fnreq-user-done
   */
  passport.serializeUser((user: UserI | StaffI | OrgI, done: any) => {
    let sessionUser: SessionUserI;
    if (user instanceof User) {
      sessionUser = {
        company_email: user.username,
        type: 'USER',
      };
      done(null, sessionUser);
    } else if (user instanceof Staff) {
      sessionUser = {
        company_email: user.username,
        type: 'STAFF',
      };
      done(null, sessionUser);
    } else if (user instanceof Organization) {
      sessionUser = {
        company_email: user.company_email,
        type: 'ORG',
      };
      done(null, sessionUser);
    }
  });
  /**
   * This is responsible for getting the company_email from session and then get the user from
   * the database, for more info:
   * https://github.com/jwalton/passport-api-docs#passportdeserializeuserfnserializeduser-done--fnreq-serializeduser-done
   */
  passport.deserializeUser(
    /**
     * Function for deserializing the user from session
     * @param user
     * @param done (error, userDocument)
     */
    (user: SessionUserI, done: any) => {
      if (user.type === 'STAFF') {
        Staff.findOne({ company_email: user.company_email })
          .then((document) => {
            done(null, document);
          })
          .catch((error) => {
            logger.error(JSON.stringify(error));
            done(error, null);
          });
      } else if (user.type === 'USER') {
        Staff.findOne({ company_email: user.company_email })
          .then((document) => {
            done(null, document);
          })
          .catch((error) => {
            logger.error(JSON.stringify(error));
            done(error, null);
          });
      } else if (user.type == 'ORG') {
        Organization.findOne({ company_email: user.company_email })
          .then((document) => {
            done(null, document);
          })
          .catch((error) => {
            logger.error(JSON.stringify(error));
            done(error, null);
          });
      }
    },
  );
};
