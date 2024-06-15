const express = require("express");
const userModel = require("../../dao/models/users.model.js");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const {
  generateToken,
  authToken,
  passportCall,
  authorization,
} = require("../../utils.js");
const router = express.Router();

const PRIVATE_KEY = "CoderKeyQueFuncionaComoUnSecret";
const users = [];

router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "failregister" }),
  async (req, res) => {
    res.redirect("/userregistrade");
  }
);

// JWT
// router.post("/registerJWT", (req, res) => {
//   const { name, email, password } = req.body;
//   const exists = users.find((user) => user.email === email);
//   if (exists)
//     return res
//       .status(400)
//       .send({ status: "error", error: "User already exists" });
//   const user = {
//     name,
//     email,
//     password,
//   };
//   users.push(user);
//   const access_token = generateToken(user);
//   res.send({ status: "success", access_token });
// });

// router.post("/loginJWT", (req, res) => {
//   const { email, password } = req.body;
//   const user = users.find(
//     (user) => user.email === email && user.password === password
//   );
//   if (!user)
//     return res
//       .status(400)
//       .send({ status: "error", error: "Invalid credentials" });
//   const access_token = generateToken(user);
//   res.send({ status: "success", access_token });
// });

// router.get("/current", authToken, (req, res) => {
//   res.send({ status: "success", payload: req.user });
// });

// router.post("/loginJWT", (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);
//   if (email == "admin@coder.com" && password == "CODER1234") {
//     let token = jwt.sign({ email, password /*role*/ }, "secretCode", {
//       expiresIn: "24h",
//     });

//     res.send({ message: "Inicio de sesión exitoso", token });
//   }
// });

// router.get(
//   "/current",
//   passportCall("jwt"),
//   authorization("user"),
//   (req, res) => {
//     res.send(req.user);
//   }
// );

// FIN DE JWT

router.get("/failregister", async (req, res) => {
  console.log("Estrategia fallida");
  res.send({ error: "Falló" });
});

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "faillogin" }),
  async (req, res) => {
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
  }
);

router.get("/current", async (req, res) => {
  try {
    if (req.session.user) {
      res.render("profile", { user: req.session.user, style: "profile.css" });
    } else {
      res.send({ message: "No hay usuario inciado" });
    }
  } catch (error) {
    console.error("No se ha iniciado sesión", error);
  }
});

// router.get(
//   "/current",
//   passportCall("jwt"),
//   authorization("user"),
//   (req, res) => {
//     res.send(req.user);
//   }
// );

router.get("/faillogin", (req, res) => {
  res.render("login", {
    style: "login.css",
    title: "Bienvenido",
    Error: "Usuario y/o contraseña incorrectos",
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");
    res.redirect("/login");
  });
});

router.get("/auth/google", passport.authenticate("google", { scope: "email" }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "login" }),
  async (req, res) => {
    req.session.user = req.user;
    if (req.session.user.rol === "admin") {
      res.redirect("/productsManager");
    } else {
      res.redirect("/products");
    }
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: "user.email" }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "login" }),
  async (req, res) => {
    req.session.user = req.user;
    if (req.session.user.rol === "admin") {
      res.redirect("/productsManager");
    } else {
      res.redirect("/products");
    }
  }
);
module.exports = router;
