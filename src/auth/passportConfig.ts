import LocalStrategy from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import bcrypt from 'bcrypt';
import Staff from '../models/staff';
import { logger } from '../logging';

module.exports = (passport: any) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SESSION_SECRET,
    issuer: 'accounts.examplesoft.com',
    audience: 'yoursite.net',
  };

  passport.use(
    'jwt',
    new JWTStrategy(opts, (jwtToken, done) => {
      done(jwtToken, done);
    }),
  );

  passport.use(
    'local',
    new LocalStrategy.Strategy(
      (username: string, password: string, done: any) => {
        Staff.countDocuments({ username }, (err, count) => {
          if (err) {
            const errorString: String = JSON.stringify(err);
            logger.error(errorString);
            done(null, null, {
              error: errorString,
            });
          }

          if (count > 0) {
            Staff.findOne({ username }, (error: any, user: any) => {
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
              return done(null, user, null);
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

  passport.serializeUser((user: any, done: any) => {
    const { username } = user;
    done(null, username);
  });

  passport.deserializeUser((username: string, done: any) => {
    Staff.findOne({ username })
      .then((document) => {
        done(null, document);
      })
      .catch((error) => {
        logger.error(JSON.stringify(error));
        done(error, null);
      });
  });
};
