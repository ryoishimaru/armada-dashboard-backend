import { Router } from "express";
import { addProductValidator } from "!/superAdmin/product/validators/addProductValidator";

// create object for product controller routes
const product = new Router();

// Import the container
const container = require('~/dependency'),
        productController = container.resolve("saProductController"),
        checkApiHeaders = container.resolve("checkApiHeaders"),
        jwtVerifyToken = container.resolve("jwtVerifyToken")

/*
 * create routes for saveProduct method in productController
*/
product.post('/product', checkApiHeaders, jwtVerifyToken, addProductValidator, (req, res, next) => { productController.saveProduct(req, res, next); });

/*
 * create routes for getProducts method in productController
*/
product.get('/product', checkApiHeaders, jwtVerifyToken, (req, res, next) => { productController.getProducts(req, res, next); });

/*
 * create routes for deleteProduct method in productController
*/
product.delete('/product/:productId', checkApiHeaders, jwtVerifyToken, (req, res, next) => { productController.deleteProduct(req, res, next); });

/*
* create routes for getProductDetail method in productController
*/
product.get('/product/:productId', checkApiHeaders, jwtVerifyToken, (req, res, next) => { productController.getProductDetail(req, res, next); });

export { product };