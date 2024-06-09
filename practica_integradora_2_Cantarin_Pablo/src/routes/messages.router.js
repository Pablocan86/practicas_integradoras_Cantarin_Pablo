const express = require("express");
const router = express.Router();
const messageModel = require("../dao/models/message.model.js");
const MessageManager = require("../dao/messageManager.js");

const messageM = new MessageManager();
router.get("/messages", async (req, res) => {
  try {
    const listMessages = await messageModel.find().lean();

    res.render("chat", { listMessages, style: "message.css" });
  } catch (error) {
    console.error("No se encuentas mensajes en la Base de datos", error);
  }
});

router.post("/messages", async (req, res) => {
  let { usuario, mensaje } = req.body;
  await messageM.addMessage(usuario, mensaje);
  const listMessages = await messageModel.find().lean();
  res.render("chat", { listMessages, style: "message.css" });
});

router.put("/", (req, res) => {
  res.send("Estoy llegando desde Put de messages.router");
});

router.delete("/messages/:uid", async (req, res) => {
  let { uid } = req.params;
  let messages = await messageModel.find();
  try {
    const exist = messages.find((m) => m.id === uid);
    await messageM.deleteMessage(uid);
    res.status(201).json({ message: `Mensaje borrado` });
  } catch (error) {
    if (error.message === "No se encuentra mensaje en la base de datos") {
      res.status(400).json({
        error: `No se encuentra mensaje con ID: ${uid} en la base de datos`,
      });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
});

module.exports = router;
