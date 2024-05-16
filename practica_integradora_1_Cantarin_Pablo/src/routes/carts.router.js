const express = require("express");
const router = express.Router();
const cartModel = require("../dao/models/cart.model.js");
const productModel = require("../dao/models/product.model.js");
const CartManager = require("../dao/cartManager.js");

const cartManager = new CartManager();
router.get("/api/carts", async (req, res) => {
  try {
    let carts = await cartModel.find();
    res.send({ result: "success", payload: carts });
  } catch (error) {
    console.error("No se encuentas carritos en la Base de datos", error);
  }
});

router.post("/api/carts", async (req, res) => {
  await cartManager.addCart();
  let carts = await cartModel.find();
  res.send({ result: "success", payload: carts });
});

router.put("/api/carts/:uid", async (req, res) => {
  let { uid } = req.params;
  let cartToReplace = req.body;
  let result = await cartModel.updateOne({ _id: uid }, cartToReplace);
  res.send({ status: "success", payload: result });
});

// RUTA DE LA PRIMER PRE ENTREGA PARA ADAPATAR
router.get("/api/carts/:cid", async (req, res) => {
  try {
    const idBuscado = req.params.cid;
    s;
    const cartForId = await cartModel.findById(idBuscado);
    if (cartForId) {
      res.send({ products: cartForId });
    } else {
      res.send({ message: "No existe 🛒" });
    }
  } catch (error) {
    console.error("No existe carrito");
    res.json({ message: "No existe carrito" });
  }
});

// RUTA DE LA PRIMER PRE ENTREGA PARA ADAPATAR
router.post("/api/carts/:cid/product/:pid", async (req, res) => {
  try {
    // const db = await managerC.readBD();
    const products = await productModel.find();
    // const cartId = parseInt(req.params.cid);
    const cartId = req.params.cid;
    // const productId = parseInt(req.params.pid);
    const productId = req.params.pid;
    const addedProduct = products.find((prod) => prod.id === productId);
    if (addedProduct) {
      const existCart = await cartModel.find({ _id: cartId });

      if (existCart) {
        res.send(
          `Producto ${addedProduct.title} agregado al carrito con id: ${existCart.id}`
        );
        // await managerC.addToCart(productId, cartId);
      } else {
        res.send(`No existe carrito con id ${cartId}`);
        return;
      }
    } else {
      res.send(`Producto con ID: ${productId} inexistente en la base de datos`);
    }
  } catch (error) {
    console.error("No se puede agregar el producto", error);
    res.status(500).send("Error de conexión");
  }
});

router.delete("/:uid", async (req, res) => {
  let { uid } = req.params;
  try {
    await cartManager.deleteCart(uid);

    res
      .status(201)
      .json({ message: `Carrito con ID: '${uid}' borrado correctamente` });
  } catch (error) {
    if (
      error.message === "No se encuentra carrito con es id en la base de datos"
    ) {
      res.status(400).json({
        error: "No se encuentra carrito con es id en la base de datos",
      });
    } else if (error.message === "No hay carritos para borrar") {
      res.status(401).json({ error: "No hay carritos para borrar" });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
});

module.exports = router;
