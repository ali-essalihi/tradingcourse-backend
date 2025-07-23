import express from "express";
import authRouter from "./auth/auth.routes";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import env from "./env";

const app = express();

app.use(hpp());
app.use(cookieParser(env.COOKIE_SECRET));

app.use("/auth", authRouter);

app.use((req, res) => {
  res.end("Hello, world");
});

export default app;
