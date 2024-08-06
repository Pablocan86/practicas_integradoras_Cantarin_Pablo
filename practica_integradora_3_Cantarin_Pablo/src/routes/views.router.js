const express = require("express");
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middleware/auth.js");
const sessionController = require("../controllers/sessionController.js");

const router = express.Router();

router.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login", { style: "login.css", title: "Bienvenido" });
});

router.get("/changepassword", sessionController.changePasswordGet);

router.post("/changepassword", sessionController.changePasswordPost);

router.get("/reset_password", sessionController.reset_password);

router.get("/userregistrade", (req, res) => {
  res.render("registrade", {
    style: "login.css",
    title: "Registro Exitoso",
  });
});

router.get("/register", isNotAuthenticated, (req, res) => {
  res.render("register", { style: "register.css", title: "Registro" });
});

router.get("/profile", isAuthenticated, (req, res) => {
  res.render("profile", { user: req.session.user });
});

module.exports = router;
