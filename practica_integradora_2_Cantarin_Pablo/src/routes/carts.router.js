const express = require("express");
const router = express.Router();
const cartModel = require("../dao/models/cart.model.js");
const productModel = require("../dao/models/product.model.js");
const CartManager = require("../dao/cartManager.js");

const cartManager = new CartManager();

//Muesra todos los carritos
router.get("/carts", async (req, res) => {
  try {
    let carts = await cartModel.find();
    res.send({ result: "success", payload: carts });
  } catch (error) {
    console.error("No se encuentas carritos en la Base de datos", error);
  }
});

//Crea un carrito
router.post("/carts", async (req, res) => {
  await cartManager.addCart();
  let carts = await cartModel.find();
  res.send({ result: "success", payload: carts });
});

//Muestra carrito con productos detallados
//(lo comento para que no tenga problemas con el otro router del handlebar)
// router.get("/carts/:cid", async (req, res) => {
//   try {
//     let { cid } = req.params;
//     let cart = await cartModel.findById(cid).populate("products.product");
//     if (cart) {
//       res.send({ products: cart });
//     } else {
//       res.send({ message: "No existe 🛒" });
//     }
//   } catch (error) {
//     console.error("No existe carrito");
//     res.json({ message: "No existe carrito" });
//   }
// });

router.get("/carts/:cid", async (req, res) => {
  let { cid } = req.params;
  try {
    let cart = await cartModel
      .findById(cid)
      .populate("products.product")
      .lean();
    res.render("cart", { cart, style: "cart.css", title: "Carrito" });
  } catch (error) {
    res.status(500).send("Error al obtener el carrito");
  }
});

//No se pide en las cosignas, de todos modos tratar de adaptar

router.post("/carts/:cid/products/:pid", async (req, res) => {
  try {
    let { cid, pid } = req.params;
    await cartManager.addToCart(pid, cid);
    const carts = await cartModel.find();
    res.redirect("/products");
  } catch (error) {
    console.error("No se puede agregar el producto", error);
    res.status(500).send("Error de conexión");
  }
});

/*Ruta que agrega solo la cantidad pasada por body
{
  quantity:Number
}
*/

router.put("/carts/:cid/products/:pid", async (req, res) => {
  let { quantity } = req.body;

  try {
    let { cid, pid } = req.params;
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ Respusta: "Carrito no encontrado" });
    }

    let existProduct = cart.products.find((p) => p.product.toString() === pid);

    if (!existProduct) {
      return res
        .status(404)
        .send({ Respuesta: "Producto no encontrado en el carrito" });
    } else {
      existProduct.quantity += quantity;
      let result = await cartModel.updateOne(
        { _id: cid },
        { products: cart.products }
      );
      res.send({ cart });
    }
  } catch (error) {
    res.status(504).send(error);
  }
});

//Prueba para acceder a los productos
router.get("/carrito/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  console.log(pid);
  const cart = await cartModel.findById(cid);
  const producto = cart.products.find((p) => (p.product.id = pid));
  res.send({ producto: producto });
});
//Ruta que borra todo el carrito

router.delete("/carts/:uid", async (req, res) => {
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

//Ruta que solo borra el producto del carrito seleccionado
router.delete("/carts/:cid/products/:pid", async (req, res) => {
  try {
    let { cid, pid } = req.params;

    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ Respuesta: "Carrito no encontrado" });
    }

    let product = cart.products.find((p) => p.product.toString() === pid);
    if (!product) {
      return res
        .status(404)
        .send({ Respuesta: "No existe producto en el carrito" });
    }

    // Eliminar el producto del array de productos
    cart.products = cart.products.filter((p) => p.product != pid);

    // Guardar los cambios en el carrito
    await cart.save();

    res.send({ Respuesta: "Producto borrado" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
