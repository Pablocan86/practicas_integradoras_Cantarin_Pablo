const express = require("express");
const router = express.Router();
const productModel = require("../dao/models/product.model.js");
const cartModel = require("../dao/models/cart.model.js");
const ProductManager = require("../dao/productManager.js");
const productManager = new ProductManager();
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middleware/auth.js");
//Ruta raíz que devuelve el objeto de la primer consigna
router.get("/", async (req, res) => {
  let { limit = 3, page = 1, sort, category } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);

  try {
    // Construir filtro de búsqueda
    let filter = {};
    if (category) {
      // Buscar por categoría o disponibilidad
      filter = {
        $or: [
          { category: category.toUpperCase() },
          { available: category.toLowerCase() === "true" }, // Comparar como booleano
        ],
      };
    }

    // Opciones de sorteo
    let sortOptions = {};
    if (sort) {
      sortOptions.price = sort === "asc" ? 1 : -1;
    }

    // Obtener el total de productos que coinciden con el filtro
    const totalProducts = await productModel.countDocuments(filter);

    // Calcular la paginación
    const totalPages = Math.ceil(totalProducts / limit);
    const offset = (page - 1) * limit;

    // Obtener productos paginados
    const products = await productModel
      .find(filter)
      .lean()
      .sort(sortOptions)
      .skip(offset)
      .limit(limit);

    // Construir la respuesta
    const response = {
      status: "success",
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink:
        page > 1
          ? `/products?limit=${limit}&page=${page - 1}&sort=${
              sort || ""
            }&category=${category || ""}`
          : null,
      nextLink:
        page < totalPages
          ? `/products?limit=${limit}&page=${page + 1}&sort=${
              sort || ""
            }&category=${category || ""}`
          : null,
    };

    res.json({ response });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

//Ruta que renderiza en el handlebar products
router.get("/products", async (req, res) => {
  let { limit = 3, page = 1, sort, category } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);

  try {
    // Construir filtro de búsqueda
    let filter = {};
    if (category) {
      // Buscar por categoría o disponibilidad
      filter = {
        $or: [
          { category: category.toUpperCase() },
          { available: category.toLowerCase() === "true" }, // Comparar como booleano
        ],
      };
    }

    // Opciones de sorteo
    let sortOptions = {};
    if (sort) {
      sortOptions.price = sort === "asc" ? 1 : -1;
    }

    // Obtener el total de productos que coinciden con el filtro
    const totalProducts = await productModel.countDocuments(filter);

    // Calcular la paginación
    const totalPages = Math.ceil(totalProducts / limit);
    const offset = (page - 1) * limit;

    // Obtener productos paginados
    const products = await productModel
      .find(filter)
      .lean()
      .sort(sortOptions)
      .skip(offset)
      .limit(limit);

    // Construir la respuesta
    const response = {
      status: "success",
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink:
        page > 1
          ? `/products?limit=${limit}&page=${page - 1}&sort=${
              sort || ""
            }&category=${category || ""}`
          : null,
      nextLink:
        page < totalPages
          ? `/products?limit=${limit}&page=${page + 1}&sort=${
              sort || ""
            }&category=${category || ""}`
          : null,
    };
    const cart = await cartModel.findById("664fa5d4d2c40fa1c15d6a58");
    //Renderizamos la vista
    res.render("products", {
      user: req.session.user,
      cart: cart.products,
      response,
      style: "products.css",
      title: "Productos",
    });
    // res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

router.get("/productDetails/:pid", isAuthenticated, async (req, res) => {
  let { pid } = req.params;
  const cart = await cartModel.findById("664fa5d4d2c40fa1c15d6a58");
  const product = await productModel.findById(pid).lean();
  // res.send(product)
  res.render("productDetail", {
    cart: cart.products,
    product,
    style: "productDetails.css",
    title: "Detalles producto",
  });
});

router.get("/productsManager", isAuthenticated, async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    if (!page) page = 1;
    let result = await productModel.paginate(
      {},
      { page, limit: 3, lean: true }
    );
    result.prevLink = result.hasPrevPage ? `?page=${result.prevPage}` : "";
    result.nextLink = result.hasNextPage ? `?page=${result.nextPage}` : "";
    result.isValid = !(page <= 0 || page > result.totalPages);
    result.style = "products.css";
    result.title = "Administrador de productos";
    result.user = req.session.user;

    res.render("productsManager", result);
    // res.send({ result: "success", payload: products });
  } catch (error) {
    console.error("No se encuentran productos en la Base de datos", error);
  }
});

router.post("/productsManager", async (req, res) => {
  let { title, description, price, thumbnail, code, status, category, stock } =
    req.body;
  let page = parseInt(req.query.page);
  if (!page) page = 1;
  let result = await productModel.paginate({}, { page, limit: 3, lean: true });
  result.prevLink = result.hasPrevPage ? `?page=${result.prevPage}` : "";
  result.nextLink = result.hasNextPage ? `?page=${result.nextPage}` : "";
  result.isValid = !(page <= 0 || page > result.totalPages);
  result.style = "products.css";
  result.agregado = "Producto agregado correctamente";

  try {
    await productManager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      status,
      category,
      stock
    );

    res.render("productsManager", { result: result, user: req.session.user });
  } catch (error) {
    if (error.message === "No se han completado todos los campos") {
      result.error = "No se han completado todos los campos";
      res.render("productsManager", result);
    } else if (error.message === "Número de código existente") {
      result.error = "Número de código existente";
      res.render("productsManager", result);
      // res.status(400).json({ error: "Número de código existente" });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
});

router.put("/:uid", async (req, res) => {
  let { uid } = req.params;
  let { title, description, price, thumbnail, code, status, category, stock } =
    req.body;

  try {
    await productManager.updateProduct(
      uid,
      title,
      description,
      price,
      thumbnail,
      code,
      status,
      category,
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

router.delete("/productsManager/:uid", async (req, res) => {
  let { uid } = req.params;
  let products = await productModel.find();
  try {
    await productManager.deleteProduct(uid);
    res.render("productsManager");
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
