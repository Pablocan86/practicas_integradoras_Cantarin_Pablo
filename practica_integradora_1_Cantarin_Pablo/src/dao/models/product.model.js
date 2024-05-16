const mongoose = require("mongoose");

const productCollection = "products";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, max: 30 },
  description: { type: String, required: true, max: 50 },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  code: { type: String, required: true, max: 6 },
  status: { type: Boolean, required: true },
  stock: { type: Number, required: true },
});

const productModel = mongoose.model(productCollection, productSchema);

module.exports = productModel;
