import app from "./src/app.ts";
import { config } from "./src/config/config.ts";
import connectDB from "./src/config/db.ts";

const startServer = async () => {
  //connect database
  await connectDB();

  const port = config.port || 3000;

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
