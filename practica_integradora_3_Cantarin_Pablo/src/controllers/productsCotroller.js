const productManager = require("../dao/classes/product.dao.js");
const cartManager = require("../dao/classes/cart.dao.js");
const productModel = require("../dao/models/product.model.js");
const cartModel = require("../dao/models/cart.model.js");
const { generateProducts } = require("../utils.js");
const productService = new productManager();
const cartService = new cartManager();
const CustomError = require("../services/errors/CustomErrors.js");
const EErrors = require("../services/errors/enum.js");
const { iqualCode } = require("../services/errors/info.js");

exports.mockingProducts = async (req, res) => {
  let products = [];
  for (let i = 0; i < 100; i++) {
    products.push(generateProducts());
  }
  res.render("mocking", { products: products, style: "products.css" });
};

exports.getProducts = async (req, res) => {
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
    const totalProducts = await productService.totalProducts(filter);

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

    // Construir la respuestas
    const response = {
      status: "success",
      payload: products,
      userOne: req.session.user,
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

    //Renderizamos la vista
    if (req.session.user) {
      const cart = await cartService.getCartById(req.session.user.cart);
      //   const cart = await cartModel.findById(req.session.user.cart);
      res.render("products", {
        user: req.session.user,
        cart: cart.products,
        response,
        style: "products.css",
        title: "Productos",
      });
    } else {
      res.render("products", {
        response,
        style: "products.css",
        title: "Productos",
      });
    }

    // res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.productDetails = async (req, res) => {
  let { pid } = req.params;
  const product = await productService.getProductById(pid);
  if (req.session.user) {
    const cart = await cartService.getCartById(req.session.user.cart);
    if (cart) {
      res.render("productDetail", {
        cart: cart.products,
        user: req.session.user,
        product,
        style: "productDetails.css",
        title: "Detalles producto",
      });
    }

    // res.send(product)
  } else {
    res.render("productDetail", {
      product,
      style: "productDetails.css",
      title: "Detalles producto",
    });
  }
};

exports.productsAdmin = async (req, res) => {
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
};

exports.addProductToBD = async (req, res) => {
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
  result.user = req.session.user;

  try {
    await productService.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      status,
      category,
      stock
    );

    res.render("productsManager", result);
  } catch (error) {
    if (error.message === "No se han completado todos los campos") {
      result.error = "No se han completado todos los campos";
      res.render("productsManager", result);
    } else if (
      error.message ===
      `Código de producto ${code} existente en la base de datos`
    ) {
      const error = CustomError.createError({
        name: "Código ya existente en base de datos",
        cause: iqualCode(code),
        message: `Código de producto ${code} existente en la base de datos`,
        code: EErrors.DATABASE_ERROR,
      });
      result.error = error.message;

      res.render("productsManager", result);
      // res.status(400).json({ error: "Número de código existente" });
    } else {
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
};

exports.getUpdateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    let result = await productService.getProductById(pid);

    res.render("updateProduct", {
      result: result,
      title: "Actualización de productos",
      style: "products.css",
    });
  } catch (error) {}
};

exports.updateProductToDB = async (req, res) => {
  let { uid } = req.params;
  let { title, description, price, thumbnail, code, status, category, stock } =
    req.body;

  try {
    const products = await productService.onlyGetProducts();
    const productoEncontrado = products.find((prod) => prod.id === uid);

    //Creo el objeto nuevo para agregar con las opciones para que no se borre ninguna propiedad de no pasarla como parámetro
    const productoActualizado = {
      _id: productoEncontrado._id,
      title: title || productoEncontrado.title,
      description: description || productoEncontrado.description,
      price: price || productoEncontrado.price,
      thumbnail: thumbnail || productoEncontrado.thumbnail,
      code: code || productoEncontrado.code,
      status: productoEncontrado.status,
      category: category || productoEncontrado.category,
      stock: stock || productoEncontrado.stock,
    };
    const result = await productService.updateProduct(productoActualizado);
    const actualizate = await productService.getCartById(uid);
    result.agregado = "Producto actualizado";
    res.render("updateProduct", result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Ocurrió un error al procesar la solicitud" });
  }
};

exports.deleteProductToDB = async (req, res) => {
  let { uid } = req.params;

  try {
    await productService.deleteProduct(uid);

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
};
