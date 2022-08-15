const mongoose = require("mongoose"),
  bcrypt = require("bcrypt");

//defining simple user schema for MongoDB --
//capturing Username formatted as Email Address and Password
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
});

//generating password hash with salt defined and configurable in env variable
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, parseInt(process.env.SLT));
};

//method to validate password by comparing hash
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let User = mongoose.model("User", userSchema);

module.exports.User = User;
