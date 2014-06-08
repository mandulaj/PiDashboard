var LocalStrategy = require('passport-local').Strategy;
var User = require("./lib/User.js");

module.exports = function(passport, config) 
{
    
    passport.serializeUser(function(user, done) 
    {
        done(null, user);
    });
 
    passport.deserializeUser(function(obj, done)
    {
        done(null, obj);
    });
    
    passport.use('local-login', new LocalStrategy(
    {
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) 
    {
        if (!user)
            return done(null, false, req.flash('loginMessage', 'No user found.'));
        if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        return done(null, user);
        });

    }));)
}
