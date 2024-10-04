import { Router } from "express";
import { auth } from "../auth/routes";
import { webManager } from "../webManager/routes";

const salonRoutes = new Router();
salonRoutes.use("/v1", auth);
salonRoutes.use("/v1", webManager);
export { salonRoutes };