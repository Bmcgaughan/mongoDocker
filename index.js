const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  cookieParser = require("cookie-parser"),
  session = require("express-session")



const MongoDBStore = require('connect-mongodb-session')(session)

const { check, validationResult } = require("express-validator");

const app = express();

app.use(
  session({
    secret: process.env.SESSION ,
    name: 'session-id', // cokies name to be put in "key" field in postmano
    store: new MongoDBStore({ uri: 'mongodb://localhost:27017/demo'}),
    cookie: {
      maxAge: 1000 * 60 * 60 * 1, // set to 1 hour
      sameSite: false,
      secure: false, 
    },
    resave: true,
    saveUninitialized: false,
  })
)

//setting up cors - but defaulting to allow any request '*' for testing
const cors = require("cors");
app.use(cors());

const allowedOrigins = process.env.ALLOWED_ORIGIN.split(",");

const passport = require("passport");
const { ResultWithContext } = require("express-validator/src/chain");

require("./auth/passport");

const Users = Models.User;

//connecting to my MongoAtlas database to store user data
//I had tried to add MongoDB in Gitpod but could not generate a new image.
mongoose.connect('mongodb://localhost:27017/demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//setting up logging using Morgan to assist in tracking requests and troubleshooting
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access_log.txt"),
  {
    flags: "a",
  }
);

app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error");
});

//pushing express to auth
//login route handled in auth
let auth = require("./auth/auth")(app);

//user registration route
//accepts two paremters -- username as email address and password
app.post(
  "/users",
  //validating inputs
  [
    check("Username", "Username cannot be empty").not().isEmpty(),
    check("Username", "Username must be an email address").isEmail(),
    check("Password", "Password is required").not().isEmpty(),
    check(
      "Password",
      "Pasworword must meet requirements - 8 characters, One Uppercase, One Symbol"
    ).isStrongPassword(),
  ],
  (req, res) => {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(422).json({ errors: validationErrors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username }).then((user) => {
      if (user) {
        return res.status(400).send(`${req.body.Username} already exists`);
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
        })
          .then((user) => {
            //kicking back the user result just for postman validation for this exercise.
            //would send a generic success result in production.
            res.status(201).json(user);
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send(`Error creating user: ${error}`);
          });
      }
    });
  }
);


//clearing sessions and logging user out
app.delete("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Error Logging Out");
      } else {
        res.status(200).send("Successfully Logged Out");
      }
    });
  } else {
    res.end();
  }
});


//just sitting to validate sessions for the video
app.get("/valid", (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ msg: 'Validated by session', user: req.session.user}) 
  } else {
    return res.status(401).json("unauthorized");
  }
});

//allowing for dev and production ports if env variables are set and depending on where it is deployed
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on ${port}`);
});
