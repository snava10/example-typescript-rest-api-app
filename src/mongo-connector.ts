import { config } from "dotenv";
import mongoose from "mongoose";
import { Connection, ConnectionOptions } from "mongoose";
import logger from "./logger-factory";

export class MongoConnector {
  private mongoConnection: Connection;

  constructor(envfile?: string) {
    /**
     * Load environment variables from .env file, where API keys and passwords are configured.
     */
    const envFile: string = envfile || process.env.ENVFILE || ".env";
    config({ path: envFile, debug: true });

    mongoose.Promise = global.Promise;
  }

  /**
   * Initiate connection to MongoDB
   * @returns {Promise<void>}
   */
  public connect(mongoUri?: string): Promise<void> {
    mongoUri =
      mongoUri ||
      process.env.MONGODB_URI ||
      "mongodb://root:passw0rd@localhost:27017/test?authSource=admin";
    return new Promise<void>((resolve, reject) => {
      const options: ConnectionOptions = {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };
      this.mongoConnection = mongoose.connection;

      mongoose
        .connect(mongoUri, options)
        .then(() => {
          const indexOfA = mongoUri.indexOf("@");
          const db =
            indexOfA !== -1
              ? mongoUri.substring(0, 10) +
                "!_:_!" +
                mongoUri.substring(indexOfA)
              : mongoUri;
          logger.info("MongoDB connected [%s]", db);
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Disconnects from MongoDB
   * @returns {Promise<void>}
   */
  public disconnect(): Promise<void> {
    return this.mongoConnection.close();
  }
}
