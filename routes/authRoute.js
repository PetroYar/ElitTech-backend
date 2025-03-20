import { Router } from "express";

import authController from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/auth/registration", authController.registration);
authRouter.post("/auth/login", authController.login);
authRouter.get("/user", authMiddleware, authController.getUser);

export default authRouter;
