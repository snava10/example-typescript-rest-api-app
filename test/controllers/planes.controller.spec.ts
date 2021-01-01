import { ApiServer } from "../../src/api-server";
import mongoose from "mongoose";
import { start } from "../../src/start";
import { ajax } from "rxjs/ajax";
import { map } from "rxjs/operators";
import Plane, { PlaneModel } from "../../src/models/plane.model";
import logger from "../../src/logger-factory";
import * as http from "http";
import * as rm from "typed-rest-client/RestClient";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xMLHttpRequest = require("xmlhttprequest");
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { MongoEnvVars } from "../../src/mongo-connector";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createXHR() {
  return new xMLHttpRequest.XMLHttpRequest();
}

describe("Planes controller", () => {
  let apiServer: ApiServer;
  let mongoContainer: StartedTestContainer;
  const serverBaseUrl = "http://localhost:3000";
  beforeAll(async () => {
    logger.debug("Before all ...");

    if (process.env.NODE_ENV === "ci") {
      logger.info("Running continuous integration");
      apiServer = await start();
    } else {
      try {
        mongoContainer = await new GenericContainer("mongo", "latest")
          .withExposedPorts(27017)
          .withEnv("MONGO_INITDB_ROOT_USERNAME", "root")
          .withEnv("MONGO_INITDB_ROOT_PASSWORD", "passw0rd")
          .withEnv("MONGO_INITDB_DATABASE", "test")
          .start();
      } catch (e) {
        logger.error(e);
      }
      const mongoEnvVars: MongoEnvVars = {
        username: "root",
        password: "passw0rd",
        host: mongoContainer.getHost(),
        port: mongoContainer.getMappedPort(27017),
        db: "test",
      };
      apiServer = await start(3000, mongoEnvVars);
    }
  });

  afterAll(async () => {
    logger.debug("After all ...");
    try {
      await mongoose.connection.dropCollection("planes");
      // This line must come after dropping the collection because stop() will close the connection.
      await apiServer.stop();
    } catch (error) {
      logger.error(error.message);
    }
    mongoContainer.stop();
  });

  const boeing747 = {
    manufacturer: "Boeing",
    name: "747",
  } as PlaneModel;

  beforeEach(async () => {
    logger.debug("Before each ...");
    await Plane.deleteMany({}).exec();
    await Plane.create(boeing747);
  });

  afterEach(async () => {
    logger.debug("After each ...");
    await Plane.deleteMany({}).exec();
  });

  it("get all", async () => {
    return ajax({
      createXHR: createXHR, // This is needed to avoid CORS errors.
      url: `${serverBaseUrl}/api/planes`,
      method: "GET",
    })
      .pipe(
        map((response) => {
          expect(response.status).toBe(200);
          expect(response.response.length).toBe(1);
        })
      )
      .toPromise()
      .catch((reason) => fail(reason));
  });

  it("get by manufacturer", async () => {
    const rest: rm.RestClient = new rm.RestClient("test-agent");
    const res: rm.IRestResponse<Array<PlaneModel>> = await rest.get<
      Array<PlaneModel>
    >(`${serverBaseUrl}/api/planes/747`);

    expect(res.statusCode).toBe(200);
    expect(res.result[0]).toMatchObject(boeing747);
  });

  it("get by name", async () => {
    return new Promise((resolve) => {
      http
        .get(`${serverBaseUrl}/api/planes/747`, (response) => {
          expect(response.statusCode).toBe(200);
          response.on("data", (data) => {
            expect(data).toBeTruthy();
            resolve(JSON.parse(data));
          });
        })
        .end();
    }).then((value: Array<PlaneModel>) => {
      expect(value.length).toBe(1);
      expect(value[0]).toMatchObject(boeing747);
    });
  });

  xit("create", () => {
    expect(false).toBeTruthy();
  });

  xit("update", () => {
    expect(false).toBeTruthy();
  });
});
