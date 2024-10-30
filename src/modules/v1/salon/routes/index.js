import { Router } from "express";
import { auth } from "../auth/routes";
import { webManager } from "../webManager/routes";
import { product } from "../product/routes";

const salonRoutes = new Router();
salonRoutes.use("/v1", auth);
salonRoutes.use("/v1", webManager);
salonRoutes.use("/v1", product);
export { salonRoutes };