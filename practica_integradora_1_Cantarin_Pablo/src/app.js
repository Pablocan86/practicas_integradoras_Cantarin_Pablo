const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const messageRouter = require("./routes/messages.router.js");
const dotenv = require("dotenv");

dotenv.config();
console.log(process.env.MONGO_URL);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Conectado a la base de datos");
  })
  .catch((error) => {
    console.error("Error en la conexión", error);
  });

app.use("/api", productsRouter);
app.use("/", cartsRouter);
app.use("/api", messageRouter);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
