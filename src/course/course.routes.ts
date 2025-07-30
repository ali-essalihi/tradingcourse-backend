import express from "express";
import * as controller from "./course.controller";

const router = express.Router();

router.get("/", controller.getCourse);
router.get("/:videoId/embed", controller.getVideoEmbedUrl);

export default router;
