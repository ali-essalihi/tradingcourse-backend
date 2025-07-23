import "dotenv/config";
import app from "./app";
import env from "./env";

app.listen(env.PORT, "0.0.0.0", err => {
  if (err) throw err;
  console.log(`Server is listening on port ${env.PORT}`);
});
