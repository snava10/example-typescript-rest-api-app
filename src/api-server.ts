import logger from "./logger-factory";
import cors from "cors";
import express from "express";
import * as http from "http";
import * as path from "path";
import { PassportAuthenticator, Server } from "typescript-rest";
import { MongoConnector } from "./mongo-connector";
import { BasicStrategy, BasicVerifyFunction } from "passport-http";

export class ApiServer {
  public PORT: number = +process.env.PORT || 3000;

  private readonly app: express.Application;
  private server: http.Server = null;

  constructor(private mongoConnector: MongoConnector, port?: number) {
    if (port) {
      this.PORT = port;
    }
    this.app = express();
    this.config();
    this.app.use(
      cors({
        credentials: true,
        origin: "http://localhost:4200",
      })
    );
    Server.loadServices(this.app, "controllers/*", __dirname);
    Server.swagger(this.app, {
      filePath: "./dist/swagger.json",
      endpoint: "api/swagger",
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.server = this.app.listen(this.PORT, () => {
          logger.info(`Starting server on ${new Date().toLocaleString()}`);
          logger.info(`Listening to http://localhost:${this.PORT}`);
          logger.info(
            `Open http://localhost:${this.PORT}/api/swagger for documentation`
          );
        });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Stop the server (if running).
   * @returns {Promise<boolean>}
   */
  public async stop(): Promise<boolean> {
    const stopServerPromise = new Promise<boolean>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        return resolve(true);
      }
    });

    if (this.mongoConnector) {
      logger.info("Disconnecting mongo connector");
      return this.mongoConnector
        .disconnect()
        .then(() => stopServerPromise)
        .catch(() => stopServerPromise);
    }
    return stopServerPromise;
  }

  /**
   * Configure the express app.
   */
  private config(): void {
    // Native Express configuration
    this.app.use(
      express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
    );
    this.app.use(cors());
    this.configureAuthenticator();
  }

  private configureAuthenticator(): void {
    const basicStrategy = new BasicStrategy(this.verifyFunction);
    Server.registerAuthenticator(
      new PassportAuthenticator(basicStrategy, {
        authOptions: {
          session: false,
          failWithError: false,
        },
        rolesKey: "roles", // change the name of the property used to access the user role(s)
      })
    );
  }

  private verifyFunction: BasicVerifyFunction = async (
    email: string,
    password: string,
    done: (error: unknown, user: unknown) => void
  ) => {
    logger.info("verifying email and password");
    if (email === "test@test.com" && password === "p@ssword") {
      done(null, true);
    } else {
      done(null, false);
    }
  };
}
