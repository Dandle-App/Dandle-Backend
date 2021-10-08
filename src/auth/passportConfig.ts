import LocalStrategy from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import bcrypt from 'bcrypt';
import Staff, { StaffI } from '../models/staff';
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
      async (jwtPayload, done) => {
        if (jwtPayload.type === 'STAFF') {
          try {
            const user = await Staff.findOne({ username: jwtPayload.username });
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
       * Handles the verification of staff using a username and password
       * @param username The username from the form
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
    'local-user',
    new LocalStrategy.Strategy(
      /**
       * Handles the verification of users using a username and password, essentially
       * the same thing as above but this time for users since they are different
       * db documents
       * @param username The username from the form
       * @param password The password from the form, still in plain text at this point,
       * needs to be hashed
       * @param done (error, user, {message: string}) is the signature for this, error should be
       * for success it should be (null, user), if verification failed then do
       * (null, null, {message: 'reason'}) and for exceptions then (error)
       */
      (username: string, password: string, done: any) => {
        User.countDocuments({ username }, (err, count) => {
          if (err) {
            const errorString: String = JSON.stringify(err);
            logger.error(errorString);
            done(null, null, {
              error: errorString,
            });
          }

          if (count > 0) {
            User.findOne({ username }, (error: any, user: any) => {
              if (error) {
                return done(error);
              }
              if (!user) {
                return done(null, false, {
                  error: 'Incorrect username.',
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
    username: string;
    type: 'USER' | 'STAFF' | 'ORG';
  }

  /**
   * This is responsible for putting the username into session to be
   * gotten later, for more info:
   * https://github.com/jwalton/passport-api-docs#passportserializeuserfnuser-done--fnreq-user-done
   */
  passport.serializeUser((user: UserI | StaffI, done: any) => {
    let sessionUser: SessionUserI;
    if (user instanceof User) {
      sessionUser = {
        username: user.username,
        type: 'USER',
      };
    } else {
      sessionUser = {
        username: user.username,
        type: 'STAFF',
      };
    }
    done(null, sessionUser);
  });
  /**
   * This is responsible for getting the username from session and then get the user from
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
        Staff.findOne({ username: user.username })
          .then((document) => {
            done(null, document);
          })
          .catch((error) => {
            logger.error(JSON.stringify(error));
            done(error, null);
          });
      } else if (user.type === 'USER') {
        Staff.findOne({ username: user.username })
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
