module.exports = function(app, passport, config)
{
    app.get("/", function(){
        res.render(index.ejs);
    })    
}
