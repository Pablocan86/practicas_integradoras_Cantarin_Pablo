const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");

const {
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
} = require("../middleware/auth.js");

router.get("/", isAuthenticated, isAdmin, userController.getUsers);
router.get("/premium/:uid", isAuthenticated, isAdmin, userController.getUser);

router.put("/premium/:uid", userController.putRolUser);

module.exports = router;
