module.exports = function(app, passport, config)
{
    app.get("/", function(req,res){
        
        if (req.isAuthenticated())
        {
            res.redirect("/rpi/home")
        }
        else
        {
            res.render("login.ejs");
        }
    });
    
    app.get("/rpi", function(req, res){
        res.redirect("/rpi/home")
    });
    
    app.get("/rpi/home", isAuthenticated, function(req, res){
        res.render("index.ejs");
    });
    
    app.get("/rpi/ssh", isAuthenticated, function(req, res){
        res.render("ssh.ejs");
    });
    
    app.get("/rpi/dashboard", isAuthenticated, function(req, res){
        res.render("dashboard.ejs");
    });
    
    app.post('/login', function(req, res, next) {

        passport.authenticate('local-login', function(err, user, info){
            if (err) {return next(err);}
            if (!user) {
                return res.send({login: false});
            }
            
            req.login(user, function(err){
                if (err) {
                    return next(err);
                }
                return res.send({login: true});
            });
        })(req,res,next)
                              
    });
    
    
    app.get("/logout", function(req, res){
        req.logout();
        res.redirect("/");
    });

    function isAuthenticated(req, res, next)
    {
        
        if (req.isAuthenticated())
        {
            return next();
        }
        else
        {
            res.redirect("/")
        }
    }
    
}
