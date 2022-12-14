const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("../models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;


  //setting up local strategty 
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },

    (username, password, callback) => {
      Users.findOne({ Username: username }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        if (!user) {
          console.log("Incorrect Username");
          return callback(null, false, {
            message: "Incorrect username or password",
          });
        }
        if (!user.validatePassword(password)) {
          console.log("Incorrect Password");
          return callback(null, false, { message: "Incorrect Password" });
        }
        return callback(null, user);
      });
    }
  )
);

//authenticating JWT tokens once user is logged in for other endpoints
// passport.use(
//   new JWTStrategy(
//     {
//       jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT,
//     },
//     (jwtPayload, callback) => {
//       return Users.findById(jwtPayload._id)
//         .then((user) => {
//           return callback(null, user);
//         })
//         .catch((error) => {
//           return callback(error);
//         });
//     }
//   )
// );
