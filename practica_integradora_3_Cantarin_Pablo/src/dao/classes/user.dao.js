const userModel = require("../models/users.model.js");

class UserManager {
  constructor() {}

  async getUsers() {
    let users = userModel.find().lean();
    return users;
  }

  async getUserById(id) {
    let user = userModel.findById(id).lean();
    return user;
  }
  async getUserByEmail(email) {
    let user = userModel.findOne({ email: email });
    return user;
  }

  async updateUser(correo, password) {
    await userModel.updateOne({ email: correo }, password);
  }

  async updateUserRol(correo, rol) {
    await userModel.updateOne({ email: correo }, rol);
  }
}

module.exports = UserManager;
