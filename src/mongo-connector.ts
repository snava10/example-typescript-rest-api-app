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
  public connect(envVars?: MongoEnvVars): Promise<void> {
    const mongoUri = this.getMongoUri(envVars);
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

  public getMongoUri(envVars?: MongoEnvVars): string {
    envVars = envVars || loadMongoEnvVars();
    if (
      envVars.host &&
      envVars.port &&
      envVars.db &&
      envVars.username &&
      envVars.password
    ) {
      return `mongodb://${envVars.username}:${envVars.password}@${envVars.host}:${envVars.port}/${envVars.db}?authSource=admin`;
    }
    return `mongodb://localhost`;
  }
}

export interface MongoEnvVars {
  username?: string;
  password?: string;
  host: string;
  port: number;
  db: string;
}

export function loadMongoEnvVars(): MongoEnvVars {
  return {
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    host: process.env.MONGODB_HOST,
    port: Number.parseInt(process.env.MONGODB_PORT),
    db: process.env.MONGODB_INIT_DB,
  } as MongoEnvVars;
}
