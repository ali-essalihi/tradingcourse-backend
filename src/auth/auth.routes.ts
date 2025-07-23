import express from "express";
import * as authController from "./auth.controller";
import { ensureAuthenticated } from "./auth.middlewares";

const router = express.Router();

router.get("/google/url", authController.getGoogleAuthUrl);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/refresh", authController.handleTokenRefresh);
router.get("/me", ensureAuthenticated(), authController.getAuthenticatedUser);
router.post("/logout", authController.logout);

export default router;
