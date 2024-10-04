require('dotenv').config();
const { createContainer, asClass, asValue } = require('awilix');
var container = createContainer();

// global files
container.register({
  db: asValue(require("~/config/knexfile")),
  logger: asValue(require("~/utils/logger").default),
  DateTimeUtil: asClass(require('~/utils/DateTimeUtil')).singleton(),
  passwordHash: asValue(require("~/utils/passwordHash").default),
  checkApiHeaders: asValue(require("~/middlewares/checkApiHeaders")),
  jwtVerifyToken: asValue(require("~/middlewares/jwtVerifyToken")),
  JwtAuthSecurity: asClass(require('~/libraries/JwtAuthSecurity')).singleton(),
  commonHelpers: asValue(require("~/helpers/commonHelpers").default)
});

// response handler file
container.register({
  responseHandler: asClass(require('~/middlewares/responseHandler')).singleton()
});

/* ================== salon Dependency Start ================== */
// Salon auth module related classes
container.register({
  authController: asClass(require('!/salon/auth/controllers/authController')).singleton(),
  authService: asClass(require('!/salon/auth/services/authService')).singleton(),
  authModel: asClass(require('!/salon/auth/models/AuthModel')).singleton()
});

// Salon webManager module related classes
container.register({
  webManagerController: asClass(require('!/salon/webManager/controllers/webManagerController')).singleton(),
  webManagerService: asClass(require('!/salon/webManager/services/webManagerService')).singleton(),
  webManagerModel: asClass(require('!/salon/webManager/models/WebManagerModel')).singleton()
});

// Make the container available for other parts of your application
module.exports = container;