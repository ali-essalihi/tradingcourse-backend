import express from "express";
import * as controller from "./course.controller";

const router = express.Router();

router.get("/", controller.getCourse);

export default router;
