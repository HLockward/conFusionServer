const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const FacebookTokenStrategy = require('passport-facebook-token');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, process.env.SECRETKEY,{expiresIn: 3600});
};

const opts = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.SECRETKEY
};

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) =>{
            if(err){
                return done(err, false);
            }
            else if(user){
                return done(null, user);
            }
            else{
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin){
        next();
    }
    else{
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        next(err);
    }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) =>{
            if(err){
                return done(err, false);
            }
            if(!err && user !== null){
                return done(null, user);
            }
            else{
                newUser = new User({ username: profile.displayName });
                newUser.facebookId = profile.id;
                newUser.firstname = profile.name.givenName;
                newUser.lastname = profile.name.familyName;
                newUser.save((err, user) => {
                    if(err){
                        return done(err, false);
                    }
                    else{
                        return done(null, user);
                    }
                });
            }
        });
    } 
));