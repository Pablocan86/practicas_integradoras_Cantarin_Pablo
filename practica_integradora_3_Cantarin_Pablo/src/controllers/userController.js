const UserManager = require("../dao/classes/user.dao.js");

const userService = new UserManager();

exports.getUsers = async (req, res) => {
  try {
    let users = await userService.getUsers();
    res.render("users", { users: users });
  } catch (error) {}
};
exports.getUser = async (req, res) => {
  let { uid } = req.params;
  try {
    let user = await userService.getUserById(uid);

    res.render("changeRol", { user: user, style: "products.css" });
  } catch (error) {}
};

exports.putRolUser = async (req, res) => {
  let { uid } = req.params;
  try {
    let user = await userService.getUserById(uid);
    if (user.rol === "premium") {
      const newRol = { rol: "user" };
      await userService.updateUserRol(user.email, newRol);

      return res
        .status(202)
        .json({ message: `Se cambio rol de usuario a ${newRol.rol}` });
    }
    if (user.rol === "user") {
      const newRol = { rol: "premium" };
      await userService.updateUserRol(user.email, newRol);
      return res
        .status(202)
        .json({ message: `Se cambio rol de usuario a ${newRol.rol}` });
    }
    res.redirect(`/premium/${uid}`);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrió un error al procesar la solicitud" });
  }
};
