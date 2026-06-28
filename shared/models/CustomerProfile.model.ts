import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IAddress {
  _id: Types.ObjectId;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface ICustomerProfile extends Document {
  user: Types.ObjectId;
  phone: string | null;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  label: { type: String, default: "Home" },
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const customerProfileSchema = new Schema<ICustomerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, default: null },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

export const CustomerProfile: Model<ICustomerProfile> =
  mongoose.models.CustomerProfile ||
  mongoose.model<ICustomerProfile>("CustomerProfile", customerProfileSchema);
