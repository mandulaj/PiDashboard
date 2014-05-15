module.exports = function(app, passport, config)
{
    app.get("/", function(req, res){
        res.render("index.ejs");
    })    
}
