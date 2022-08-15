const passport = require("passport");

require("./passport");

//route for user login ---
//will take username and password and run local authentication and will return token if user is validated.
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Login Failed",
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
       
        const userSession = { userID: user.Username}
        req.session.user = userSession
        return res.status(200).json({ msg: 'Success!', userSession }) 
      
      });
    })(req, res);
  });
};
