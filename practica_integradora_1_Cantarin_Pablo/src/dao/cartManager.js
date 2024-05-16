const cartModel = require("../dao/models/cart.model.js");
const productModel = require("../dao/models/product.model.js");

class CartManager {
  constructor() {}

  async addCart() {
    const carts = await cartModel.find();
    const newCart = { products: [] };
    await cartModel.create({ newCart });
    console.log("Carrito creado correctamente");
  }
  async addToCart(idP, idC) {
    try {
      const product = await productModel.findById(idP);
      const carts = await cartModel.find();
      const cart = await cartModel.findById(idC);
      if (!product) {
        console.log("No existe Producto en la base de datos");
        throw Error("No existe producto en la base de datos");
      } else {
        if (!cart) {
          console.log("Carrito inexistente");
          throw Error("Carrito inexistente");
        } else {
          cart.push(product);
        }
      }
    } catch (error) {}
  }

  async deleteCart(id) {
    let cart = await cartModel.findById(id);

    if (cart) {
      await cartModel.deleteOne({ _id: id });
      console.log("Carrito borrado correctamente");
    } else {
      throw Error("No se encuentra carrito con es id en la base de datos");
    }
  }
}

module.exports = CartManager;
