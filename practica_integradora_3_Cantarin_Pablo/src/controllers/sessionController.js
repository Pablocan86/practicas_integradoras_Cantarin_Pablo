const passport = require("passport");
const userDTO = require("../dao/DTOs/user.dto");
const { createHash } = require("../utils.js");
const nodemailer = require("nodemailer");
const { devLogger, prodLogger } = require("../middleware/logger.js");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const TokenManager = require("../dao/classes/token.dao.js");
const UserManager = require("../dao/classes/user.dao.js");

const tokenService = new TokenManager();
const userService = new UserManager();

dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: process.env.usermail,
    pass: process.env.pass,
  },
});

exports.register = async (req, res) => {
  res.redirect("/userregistrade");
};

exports.failregister = async (req, res) => {
  res.render("register", {
    style: "register.css",
    title: "Registro",
    error: "No se puede registar al usuario",
  });
};

exports.login = async (req, res) => {
  if (!req.user)
    return res
      .status(400)
      .send({ status: "error", error: "Credenciales invalidas" });
  try {
    if (!req.user) return res.redirect("/register");
    req.session.user = {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      cart: req.user.cart,
      rol: req.user.rol,
    };

    if (req.session.user.rol === "admin") {
      res.redirect("/productsManager");
    } else {
      res.redirect("/products");
    }
  } catch (err) {
    res.status(500).send("Error al iniciar sesión");
  }
};

exports.changePasswordGet = async (req, res) => {
  res.render("changePassword");
};

exports.changePasswordPost = async (req, res) => {
  let correo = req.body.correo;
  let token = uuidv4();
  let expirationTime = Date.now() + 3600 * 1000;
  let newToken = {
    token: token,
    email: correo,
    expirationTime: expirationTime,
  };
  await tokenService.createToken(newToken);

  let mail = await transport.sendMail({
    from: "pablo.cantarin86@gmail.com",
    to: correo,
    subject: "Restablecimiento de contraseña",
    text: `http://localhost:8080/reset_password?token=${token}`,
  });
  res.send({
    message: `Correo enviado, ingrese a ${correo} y entre al enlace`,
  });
};

exports.reset_password = async (req, res) => {
  const token = req.query.token;
  let existToken = await tokenService.getToken(token);
  let currentTime = Date.now();
  if (currentTime > existToken.expirationTime) {
    res.send({ message: "Link expiró" });
  } else {
    res.render("resetPassword", { token: token, correo: existToken.email });
  }
};

exports.changePasswordPut = async (req, res) => {
  const { correo, password } = req.body;
  try {
    let newPassword = createHash(password);
    let change = { password: newPassword };
    await userService.updateUser(correo, change);

    res.send({ message: "contraseña modificada" });
  } catch (error) {}
};

exports.current = async (req, res) => {
  try {
    if (req.session.user) {
      let user = new userDTO(req.session.user);
      res.render("profile", { user: user, style: "profile.css" });
    } else {
      res.render("profile", {
        style: "profile.css",
        error: "No ha iniciado sesión",
      });
    }
  } catch (error) {
    prodLogger.warning("No ha iniciado sesión");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      prodLogger.error("Error al cerrar cesión");
      return res.status(500).send("Error al cerrar sesión");
    }
    res.redirect("/login");
  });
};

exports.googleCallback = async (req, res) => {
  req.session.user = req.user;
  if (req.session.user.rol === "admin") {
    res.redirect("/productsManager");
  }
  if (req.session.user.rol === "user") {
    res.redirect("/products");
  }
};

exports.githubCallback = async (req, res) => {
  req.session.user = req.user;
  if (req.session.user.rol === "admin") {
    res.redirect("/productsManager");
  } else {
    res.redirect("/products");
  }
};
