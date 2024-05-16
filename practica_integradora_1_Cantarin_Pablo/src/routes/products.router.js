const express = require("express");
const router = express.Router();
const productModel = require("../dao/models/product.model.js");
const ProductManager = require("../dao/productManager.js");
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    let products = await productModel.find();

    res.send({ result: "success", payload: products });
  } catch (error) {
    console.error("No se encuentran productos en la Base de datos", error);
  }
});

router.post("/", async (req, res) => {
  let { title, description, price, thumbnail, code, status, stock } = req.body;
  try {
    await productManager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      status,
      stock
    );
    res
      .status(201)
      .json({ message: `Producto ${title} agregado correctamente` });
  } catch (error) {
    if (error.message === "No se han completado todos los campos") {
      res.status(400).json({ error: "No se han completado todos los campos" });
    } else if (error.message === "Número de código existente") {
      res.status(400).json({ error: "Número de código existente" });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
});

router.put("/:uid", async (req, res) => {
  let { uid } = req.params;
  let { title, description, price, thumbnail, code, status, stock } = req.body;

  try {
    await productManager.updateProduct(
      uid,
      title,
      description,
      price,
      thumbnail,
      code,
      status,
      stock
    );
    let products = await productModel.find();
    const exist = products.find((prod) => prod.id === uid);
    res.status(201).json({ message: `Producto ${exist.title} actualizado` });
  } catch (error) {
    if (error.message === "Producto no existe en la base de datos") {
      res.status(400).json({ error: "Producto no existe en la base de datos" });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
});

router.delete("/:uid", async (req, res) => {
  let { uid } = req.params;
  let products = await productModel.find();
  try {
    const exist = products.find((prod) => prod.id === uid);
    await productManager.deleteProduct(uid);
    res.status(201).json({ message: `Producto ${exist.title} borrado` });
  } catch (error) {
    if (
      error.message === "No se encuentra producto con es id en la base de datos"
    ) {
      res.status(400).json({
        error: `No se encuentra producto con ID: ${uid} en la base de datos`,
      });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
});

module.exports = router;
