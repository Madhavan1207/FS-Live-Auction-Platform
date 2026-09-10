import mongoose from "mongoose";

// Scope note: `password` is stored as plain text here on purpose. Hashing
// it (bcrypt) and issuing/verifying JWTs is Experiment 6's job. This
// experiment only defines the shape of a user and basic CRUD around it.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
