import { Router } from "express";
import { signUpValidator } from "!/salon/auth/validators/signUpValidator";
import { loginValidator } from "!/salon/auth/validators/loginValidator";
import { resetPasswordValidator } from "!/salon/auth/validators/resetPasswordValidator";
import { updatePassworddValidator } from "!/salon/auth/validators/updatePassworddValidator";


// create object for auth controller routes
const auth = new Router();

// Import the container
const container = require('~/dependency'),
        authController = container.resolve("authController"),
        checkApiHeaders = container.resolve("checkApiHeaders"),
        jwtVerifyToken = container.resolve("jwtVerifyToken")

/*
* create routes for signup method in authController
*/
auth.post('/signup', checkApiHeaders, signUpValidator, (req, res, next) => { authController.signup(req, res, next); });

/*
 * create routes for login method in authController
*/
auth.post('/login', checkApiHeaders, loginValidator, (req, res, next) => { authController.login(req, res, next); });

/*
 * create routes for login method in authController
*/
auth.get('/confirm-signup', jwtVerifyToken, (req, res, next) => { authController.confirmSignup(req, res, next); });

/*
 * create routes for request reset password method in authController
*/
auth.post('/request-reset-password', checkApiHeaders, resetPasswordValidator, (req, res, next) => { authController.requestResetPassword(req, res, next); });

/*
 * create routes for reset password method in authController
*/
auth.post('/reset-password', checkApiHeaders, jwtVerifyToken, updatePassworddValidator, (req, res, next) => { authController.resetPassword(req, res, next); });

export { auth };