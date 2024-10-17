import { Router } from "express";

// create object for product controller routes
const product = new Router();

// Import the container
const container = require('~/dependency'),
        productController = container.resolve("saProductController"),
        checkApiHeaders = container.resolve("checkApiHeaders")

/*
 * create routes for login method in authController
*/
product.post('/product', (req, res, next) => { productController.saveProduct(req, res, next); });

export { product };