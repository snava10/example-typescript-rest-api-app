import { GET, Path, Security } from "typescript-rest";

@Path("/api")
export class HelloController {
  @GET
  get(): string {
    return "Hello World!";
  }

  @GET
  @Security()
  @Path("/secure")
  getSecure(): string {
    return "Hello world!";
  }
}
