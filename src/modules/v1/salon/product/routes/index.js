import { Router } from "express";

// create object for product controller routes
const product = new Router();

// Import the container
const container = require('~/dependency'),
        productController = container.resolve("productController"),
        checkApiHeaders = container.resolve("checkApiHeaders"),
        jwtVerifyToken = container.resolve("jwtVerifyToken")

/*
 * create routes for saveProduct method in productController
*/
product.post('/product', (req, res, next) => { productController.saveProduct(req, res, next); });

export { product };