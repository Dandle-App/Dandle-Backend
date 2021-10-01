import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/user';
import { logger } from '../logging';

module.exports = (passport: any) => {
  passport.use(
    'local',
    new LocalStrategy.Strategy(
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
    User.findOne({ username })
      .then((document) => {
        done(null, document);
      })
      .catch((error) => {
        logger.error(JSON.stringify(error));
        done(error, null);
      });
  });
};
