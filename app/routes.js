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
    
    function isAuthenticated(req, res, next)
    {
        
        if (true)
        {
            next();
        }
        else
        {
            res.redirect("/")
        }
    }
}
