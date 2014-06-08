module.exports = function(app, passport, config)
{
    app.get("/", function(req, res){
        res.render("login.ejs");
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
