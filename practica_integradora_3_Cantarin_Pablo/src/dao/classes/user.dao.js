const userModel = require("../models/users.model.js");

class UserManager {
  constructor() {}
  async getUserByEmail(email) {
    let user = userModel.findOne({ email: email });
    return user;
  }

  async updateUser(correo, password) {
    await userModel.updateOne({ email: correo }, password);
    // await userModel.updateOne(correo, password);
  }
}

module.exports = UserManager;
