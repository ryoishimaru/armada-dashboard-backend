import { Router } from "express";
import { auth } from "../auth/routes";

const superAdminRoutes = new Router();
superAdminRoutes.use("/v1", auth);
export { superAdminRoutes };