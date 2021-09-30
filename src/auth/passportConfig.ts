import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from '../models/user'
import bcrypt from 'bcrypt';
passport.use(new LocalStrategy.Strategy(
    (username: string, password: string, done: any) => {
        User.findOne({ username: username }, function(err: any, user: any) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { error: 'Incorrect username or password.' });
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { error: 'Incorrect username or password.' });
            }
            return done(null, user);
        });
    }
));