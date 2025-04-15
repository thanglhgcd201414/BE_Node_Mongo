import { UserRole } from "@/constants/role";
import { logger } from "@/server";
import * as bcrypt from "bcrypt";
import mongoose, { Schema, model, Document } from "mongoose";

export interface IShippingAddress {
  city: string;
  district: string;
  ward: string;
  street: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  avatar?: string;
  role: UserRole;
  shippingAddress: IShippingAddress[];
  favoriteProducts: any[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: (pass: string) => /[A-Za-z\d@$!%*?&]{8,}/.test(pass),
        message: "Password does not meet requirements",
      },
    },
    phoneNumber: { type: String, required: false },
    avatar: { type: String, required: false },
    shippingAddress: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
      },
    ],
    favoriteProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    role: { type: String, enum: UserRole, default: UserRole.USER },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const deleteMany = async () => {
  try {
    const result = await User.deleteMany({});
    logger.info(`Delete ${result.deletedCount} item successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (users: any) => {
  try {
    const result = await User.insertMany(users);
    logger.info(`Insert ${result.length} item successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

const User = model("User", UserSchema);

export { User, deleteMany, insertMany };
