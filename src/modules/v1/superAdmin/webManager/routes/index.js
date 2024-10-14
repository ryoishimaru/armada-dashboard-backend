import { Router } from "express";

// create object for webManager controller routes
const webManager = new Router();

// Import the container
const container = require('~/dependency'),
        webManagerController = container.resolve("webManagerController"),
        checkApiHeaders = container.resolve("checkApiHeaders")
/*
* create routes for uploadToServer method in webManagerController
*/
webManager.post('/uploadToServer', (req, res, next) => { webManagerController.uploadToServer(req, res, next); });

export { webManager };