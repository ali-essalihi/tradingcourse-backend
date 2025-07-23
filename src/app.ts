import type { ErrorRequestHandler } from "express";
import express from "express";
import authRouter from "./auth/auth.routes";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import env from "./env";

const app = express();

app.disable("x-powered-by");
app.disable("etag");

app.use(helmet.xContentTypeOptions());
app.use(helmet.xFrameOptions({ action: "deny" }));

app.use(
  cors({
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "PUT"],
    // Cache results of a preflight request for 1 day (86400 seconds)
    maxAge: 60 * 60 * 24,
    allowedHeaders: ["Content-Type"],
    credentials: true,
    exposedHeaders: [],
    origin: env.CLIENT_ORIGIN
  })
);

app.use(hpp());
app.use(cookieParser(env.COOKIE_SECRET));

app.use("/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
} as ErrorRequestHandler);

export default app;
