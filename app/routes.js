module.exports = function(app, passport, config)
{
    app.get("/", function(req, res){
        res.render("login.ejs");
    });
    
    app.get("/rpi", isAuthenticated, function(req, res){
        res.render("index.ejs")
    });
    
    app.get("/ssh", isAuthenticated, function(req, res){
        res.render("ssh.ejs")
    });
    
    app.get("/dashboard", isAuthenticated, function(res, req){
        res.render("dashboard.ejs")
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
