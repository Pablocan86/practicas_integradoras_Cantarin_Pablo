const mongoose = require("mongoose");

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
  products: [{ product: { type: Number }, quantity: { type: Number } }],
});

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = cartModel;
