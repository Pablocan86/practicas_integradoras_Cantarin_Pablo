const UserManager = require("../dao/classes/user.dao.js");

const userService = new UserManager();

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
      return;
    }
    if (user.rol === "user") {
      const newRol = { rol: "premium" };
      await userService.updateUserRol(user.email, newRol);
      return;
    }
    res.redirect(`/premium/${uid}`);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrió un error al procesar la solicitud" });
  }
};
