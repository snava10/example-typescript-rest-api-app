import { ApiServer } from "../../src/api-server";
import mongoose from "mongoose";
import { start } from "../../src/start";
import { ajax } from "rxjs/ajax";
import { map } from "rxjs/operators";
import Plane, { PlaneModel } from "../../src/models/plane.model";
import logger from "../../src/logger-factory";
import * as http from "http";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xMLHttpRequest = require("xmlhttprequest");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createXHR() {
  return new xMLHttpRequest.XMLHttpRequest();
}

describe("Planes controller", () => {
  let apiServer: ApiServer;
  const serverBaseUrl = "http://localhost:3000";
  beforeAll(async () => {
    logger.debug("Before all ...");
    apiServer = await start();
  });

  afterAll(async () => {
    logger.debug("After all ...");
    await mongoose.connection.collections.planes.drop().then(
      (value) => logger.debug(value),
      (error) => logger.error(error)
    );
    // This line must come after dropping the collection because stop() will close the connection.
    await apiServer.stop();
  });

  const boing747 = {
    manufacturer: "Boeing",
    name: "747",
  } as PlaneModel;

  beforeEach(async () => {
    logger.debug("Before each ...");
    await Plane.deleteMany({}).exec();
    await Plane.create(boing747);
  });

  afterEach(async () => {
    logger.debug("After each ...");
    // await Plane.deleteMany({}).exec();
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
      expect(value[0]).toMatchObject(boing747);
    });
  });

  xit("create", () => {
    expect(false).toBeTruthy();
  });

  xit("update", () => {
    expect(false).toBeTruthy();
  });
});
