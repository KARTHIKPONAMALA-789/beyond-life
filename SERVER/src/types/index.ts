import { Schema } from "mongoose";

export type Role = "ADMIN" | "USER" | "NOMINEE";

export type TokenInfo = {
  _id: Schema.Types.ObjectId;
  email: string;
  name: string;
  role: Role;
};

export enum RoleEnum {
  ADMIN = "ADMIN",
  USER = "USER",
  NOMINEE = "NOMINEE",
}

export enum Status{
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

// export enum PaymentStatus{
//   PENDING = "PENDING",
//   SUCCESS = "SUCCESS",
//   FAILED = "FAILED",
//   REFUNDED = "REFUNDED",
// }

