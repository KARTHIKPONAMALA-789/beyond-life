import { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";



export interface IUser extends IBaseUser {
  mobile: string;
  address: string;
  photo: string;
  date_of_birth: Date;
  gender: "Male" | "Female" | "Other";
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}


const customerSchema = new Schema<IUser>(
  {
    ...IbaseUserSchema,
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    photo: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  { timestamps: true }
);

// Export the model
export const User = model<IUser>("User", customerSchema);
