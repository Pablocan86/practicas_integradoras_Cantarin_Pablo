const express = require("express");
const upload = require("../middleware/multer.js");
const userController = require("../controllers/userController.js");

const router = express.Router();

const {
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
} = require("../middleware/auth.js");

router.get("/", isAuthenticated, isAdmin, userController.getUsers);
router.get("/premium/:uid", isAuthenticated, isAdmin, userController.getUser);

router.get("/documents", (req, res) => {
  // res.json({ message: __dirname });
  res.render("documents", { style: "documents.css" });
});

router.post(
  "/documents",
  upload.fields([
    { name: "identification", maxCount: 1 },
    { name: "adressVerification", maxCount: 1 },
    { name: "accountStatement", maxCount: 1 },
  ]),
  (req, res) => {
    res.json({ message: "Archivo subido exitosamente", files: req.files });
  }
);
// router.post("/upload", upload.single("myFile"), (req, res) => {
//   if (req.file) {
//     console.log("Archivo subido:", req.file);
//     res.send("Archivo subido correctamente");
//   } else {
//     res.send("No se ha seleccionado ningún archivo");
//   }
// });
router.put("/premium/:uid", userController.putRolUser);

module.exports = router;
