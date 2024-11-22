import express from "express";
var http = require('http');
import bodyParser from "body-parser";
import { salonRoutes } from '!/salon/routes';
import { superAdminRoutes } from '!/superAdmin/routes';
import { notFound } from "./middlewares/errorHandler";
import Path from "path";
import logger from "~/utils/logger";
const fileUpload = require("express-fileupload");
import swaggerUI from "swagger-ui-express";
const swaggerDefination = require('~/api-doc/v1/_build/main_doc.json');
const cors = require('cors');

var dotenv = require('dotenv').config();
const app = express(),
    APP_PORT = process.env.PORT || process.env.APP_PORT,
    APP_HOST = process.env.APP_HOST;
app.set("port", APP_PORT);
app.set("host", APP_HOST);
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(fileUpload());
app.use('/api/doc', swaggerUI.serve, swaggerUI.setup(swaggerDefination));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());
app.use('/api/product', express.static('uploads/product'));
// set path for public folder
app.use(express.static(Path.join(__dirname, 'public')));

var allowedDomains = process.env.CORS_ALLOW_DOMAIN;
allowedDomains = allowedDomains.split(',');
app.use(
    cors({
        origin: allowedDomains,
        credentials: true
    })
)

/**
 * router managment for v1
 */
app.use("/api/superAdmin", superAdminRoutes);
app.use("/api/salon", salonRoutes);

/*set error middleware*/
app.use(notFound); //return default error message not found

global.errorObj = { "status_code": 500, "message": "Internal server error" };
if (process.env.NODE_ENV !== 'test') {
    app.listen(app.get("port"), () => {
        console.log(`Server listing at http://${app.get("host")}:${app.get("port")}`)
    })
}

process.on('uncaughtException', ex => {
    console.log("uncaughtException", ex);
    logger.error("uncaughtException: ", ex.message)
    process.exit(1);
})

process.on('unhandledRejection', reason => {
    logger.error("unhandledRejection: " + reason)
    process.exit(1);
})

export default app;