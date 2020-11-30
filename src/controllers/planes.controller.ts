import { GET, Path, PathParam, POST, PUT } from "typescript-rest";
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
    return Plane.replaceOne({ _id: plane.id }, plane).exec();
  }

  delete(planeId: string): Promise<{ deletedCount?: number }> {
    return Plane.deleteOne({ _id: planeId }).exec();
  }
}
