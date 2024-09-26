import { Router } from "express";
import { auth } from "../auth/routes";

const suAdminRoutes = new Router();
suAdminRoutes.use("/v1", auth);
export { suAdminRoutes };