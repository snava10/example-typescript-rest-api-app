import { config } from "dotenv";
import { MongoConnector } from "./mongo-connector";
import { ApiServer } from "./api-server";

export async function start(port?: number): Promise<ApiServer> {
  const envFile: string = process.env.ENVFILE || ".env";
  config({ path: envFile });
  assertEnvironment();

  const mongoConnector = new MongoConnector(envFile);
  const apiServer = new ApiServer(mongoConnector, port);
  await apiServer.start();
  await mongoConnector.connect();
  const graceful = async () => {
    await mongoConnector.disconnect();
    await apiServer.stop();
    process.exit(0);
  };

  // Stop graceful
  process.on("SIGTERM", graceful);
  process.on("SIGINT", graceful);
  return apiServer;
}

export function assertEnvironment() {
  const errMessage = " variable not set";

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI" + errMessage);
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET" + errMessage);
  }
}
