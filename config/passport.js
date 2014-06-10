var LocalStrategy = require('passport-local').Strategy;
var User = require("../lib/User.js");

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
            if (!username)
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            
            if (!password)
                return done(null, false, req.flash('loginMessage', 'No password found.'));
            
            var user = new User(username);
            user.passwordVerification(password, function(err, user){
                return done(err, user);
            });
        })
   );
}
