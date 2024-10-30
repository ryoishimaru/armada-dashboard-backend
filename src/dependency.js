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
  commonHelpers: asValue(require("~/helpers/commonHelpers").default),
  Email: asClass(require('~/libraries/Email')).singleton(),
  FileUpload: asClass(require('~/libraries/FileUpload')).singleton(),
  commonService: asValue(require("~/services/commonServices"))
});

// response handler file
container.register({
  responseHandler: asClass(require('~/middlewares/responseHandler')).singleton()
});

/* ================== Super Admin Dependency Start ================== */

// super admin auth module related classes
container.register({
  saAuthController: asClass(require('!/superAdmin/auth/controllers/authController')).singleton(),
  saAuthService: asClass(require('!/superAdmin/auth/services/authService')).singleton(),
  saAuthModel: asClass(require('!/superAdmin/auth/models/AuthModel')).singleton()
});

// super admin product module related classes
container.register({
  saProductController: asClass(require('!/superAdmin/product/controllers/productController')).singleton(),
  saProductService: asClass(require('!/superAdmin/product/services/productService')).singleton(),
  saProductModel: asClass(require('!/superAdmin/product/models/ProductModel')).singleton()
});

/* ================== Super Admin Dependency End ==================*/

/* ================== Salon Dependency Start ================== */

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

// Salon product module related classes
container.register({
  productController: asClass(require('!/salon/product/controllers/productController')).singleton(),
  productService: asClass(require('!/salon/product/services/productService')).singleton(),
  ProductModel: asClass(require('!/salon/product/models/ProductModel')).singleton()
});
/* ================== Salon Dependency Start ================== */

// Make the container available for other parts of your application
module.exports = container;