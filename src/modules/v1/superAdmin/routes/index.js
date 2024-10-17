import { Router } from "express";
import { auth } from "../auth/routes";
import { product } from "../product/routes";

const superAdminRoutes = new Router();
superAdminRoutes.use("/v1", auth);
superAdminRoutes.use("/v1", product);
export { superAdminRoutes };