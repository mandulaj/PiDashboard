var LocalStrategy = require('passport-local').Strategy; // we are using local authentication
var User = require("../lib/User.js"); // user description and authentication methodes

module.exports = function(passport, config) 
{
    // We are not going to do anything with the user - keep it simple
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
            // Check for the fields in the form that we have recieved
            if (!username)
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            
            if (!password)
                return done(null, false, req.flash('loginMessage', 'No password found.'));
            
            // Ok we have all the data so lets make an object out of this
            var user = new User(username);
           
            user.passwordVerification(password, function(err, user)  // run the cool, slick function to verify the password
            {
                return done(err, user);// ok we are done here, pass everything to passport and let it do the dirty work...
            })
        })
   );
}
