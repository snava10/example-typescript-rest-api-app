/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

export interface PlaneModel {
  id?: any;
  manufacturer: string;
  name: string;
  maxRange: number;
}

interface IPlane extends PlaneModel, mongoose.Document {}

export const PlaneSchema = new mongoose.Schema(
  {
    manufacturer: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
    maxRange: {
      required: true,
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Plane: mongoose.Model<IPlane> = mongoose.model<IPlane>(
  "Plane",
  PlaneSchema
);
export default Plane;
