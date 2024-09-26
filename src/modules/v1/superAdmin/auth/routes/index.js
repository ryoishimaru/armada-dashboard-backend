import { Router } from "express";
import { signUpValidator } from "!/superAdmin/auth/validators/signUpValidator";
import { loginValidator } from "!/superAdmin/auth/validators/loginValidator";

// create object for auth controller routes
const auth = new Router();

// Import the container
const container = require('~/dependency'),
        authController = container.resolve("authController"),
        checkApiHeaders = container.resolve("checkApiHeaders")
/*
* create routes for signup method in authController
*/
auth.post('/signup', checkApiHeaders, signUpValidator, (req, res, next) => { authController.signup(req, res, next); });

/*
 * create routes for login method in authController
*/
auth.post('/login', checkApiHeaders, loginValidator, (req, res, next) => { authController.login(req, res, next); });

export { auth };