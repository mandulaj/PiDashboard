var LocalStrategy = require('passport-local').Strategy;
var User = require("../lib/User.js");

module.exports = function(passport, config) 
{
    
    passport.serializeUser(function(user, done) 
    {
        console.log("User: " + JSON.stringify(user))
        done(null, user);
    });
 
    passport.deserializeUser(function(obj, done)
    {
        console.log("Obj: "+ JSON.stringify(obj))
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
            console.log("Username:" + JSON.stringify(username))
            console.log("Pass" + JSON.stringify(password))
            //if (!username)
                //return done(null, false, req.flash('loginMessage', 'No user found.'));
            //if (!username.validPassword(password))
                //return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            return done(null, username);
        })
   );
}
