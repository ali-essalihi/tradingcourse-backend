import "dotenv/config";
import env from "./env";
import { initBunny } from "./course/bunny/bunny.utils";
import app from "./app";

async function start() {
  await initBunny();

  app.listen(env.PORT, "0.0.0.0", err => {
    if (err) throw err;
    console.log(`Server is listening on port ${env.PORT}`);
  });
}

start();
