import { ApiServer } from "../../src/api-server";
import mongoose from "mongoose";
import { start } from "../../src/start";
import { ajax } from "rxjs/ajax";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";
import Plane from "../../src/models/plane.model";
import logger from "../../src/logger-factory";
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
    await apiServer.stop();
    try {
      const res = await mongoose.connection.collections.planes.drop();
      expect(res).toBeTruthy();
    } catch (err) {
      logger.error(err);
    }
  });

  beforeEach(async () => {
    logger.debug("Before each ...");
    const p = new Plane({
      manufacturer: "Boeing",
      name: "747",
    });
    await Plane.create(p);
  });

  afterEach(async () => {
    logger.debug("After each ...");
    await Plane.deleteMany({}).exec();
  });

  it("get all", async () => {
    await ajax({
      createXHR: createXHR,
      crossDomain: true,
      url: `${serverBaseUrl}/api/planes`,
      method: "GET",
    })
      .pipe(
        map((response) => {
          expect(response.status).toBe(200);
          expect(response.response.length).toBe(1);
        }),
        catchError((error) => {
          console.log(JSON.stringify(error));
          return of(error);
        })
      )
      .toPromise();
  });

  xit("get by name", () => {
    expect(false).toBeTruthy();
  });

  xit("create", () => {
    expect(false).toBeTruthy();
  });

  xit("update", () => {
    expect(false).toBeTruthy();
  });
});
