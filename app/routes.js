var jwt = require('jsonwebtoken'),
  express = require('express');

module.exports = function(app, passport, config) {
  app.get("/", function(req, res) {

    if (req.isAuthenticated()) {
      res.redirect("/rpi/home"); // if we are authenticated, redirect home
    } else {
      res.render("login.ejs"); // else we need to login...
    }
  });

  var rpiRouter = express.Router();

  rpiRouter.use(isAuthenticated);


  rpiRouter.get("/", function(req, res) {
    res.redirect("/rpi/home");
  });

  rpiRouter.get("/home", isAuthenticated, function(req, res) {
    res.render("index.ejs");
  });

  rpiRouter.get("/ssh", isAuthenticated, function(req, res) {
    res.render("ssh.ejs");
  });

  rpiRouter.get("/dashboard", isAuthenticated, function(req, res) {
    res.render("dashboard.ejs");
  });

  app.use("/rpi", rpiRouter);

  app.post('/login', function(req, res, next) {

    passport.authenticate('local-login', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send({
          login: false
        });
      }
      req.login(user, function(err) {
        if (err) {
          return next(err);
        }

        var token = jwt.sign({
          name: user
        }, config.socketIOSecret, {
          expiresInMinutes: 60
        });

        return res.send({
          login: true,
          token: token
        });
      });
    })(req, res, next);

  });


  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  function isAuthenticated(req, res, next) {

    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/"); // send the user to the landing page if he is not logged in...
    }
  }

};