import { Router } from "express";
import { loginValidator } from "!/superAdmin/auth/validators/loginValidator";

// create object for auth controller routes
const auth = new Router();

// Import the container
const container = require('~/dependency'),
        authController = container.resolve("saAuthController"),
        checkApiHeaders = container.resolve("checkApiHeaders")

/*
 * create routes for login method in authController
*/
auth.post('/login', checkApiHeaders, loginValidator, (req, res, next) => { authController.login(req, res, next); });

export { auth };