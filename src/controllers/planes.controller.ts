import {
  DELETE,
  GET,
  Path,
  PathParam,
  POST,
  PUT,
  Security,
} from "typescript-rest";
import Plane, { PlaneModel } from "../models/plane.model";

@Path("api/planes/")
export class PlanesController {
  @GET
  getAll(): Promise<Array<PlaneModel>> {
    return Plane.find().exec();
  }

  @GET
  @Path(":name")
  getByName(@PathParam("name") name: string): Promise<Array<PlaneModel>> {
    return Plane.find({ name: name }).exec();
  }

  @POST
  create(plane: PlaneModel): Promise<PlaneModel> {
    return Plane.create(plane);
  }

  @PUT
  update(plane: PlaneModel): Promise<PlaneModel> {
    return Plane.findByIdAndUpdate(plane.id, plane).exec();
  }

  @DELETE
  @Security(["ADMIN"])
  delete(planeId: string): Promise<PlaneModel> {
    return Plane.findByIdAndDelete(planeId).exec();
  }
}
