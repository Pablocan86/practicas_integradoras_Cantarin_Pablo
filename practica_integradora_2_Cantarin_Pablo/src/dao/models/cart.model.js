const mongoose = require("mongoose");

const cartCollection = "carts";

const cartsSchema = new mongoose.Schema({
  products: {
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
        quantity: { type: Number },
      },
    ],
    default: [],
  },
});

// const cartSchema = new mongoose.Schema({
//   products: {
//     type: [
//       {
//         product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
//         quantity: { type: Number },
//       },
//     ],
//     default: [],
//   },
// });

const cartsModel = mongoose.model(cartCollection, cartsSchema);

module.exports = cartsModel;
