// server/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // creates a unique index (ensure you run once to build)
      match: [/^([\w.-]+@([\w-]+\.)+[\w-]{2,})$/, "{VALUE} is not a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // hide by default
    },
  },
  { timestamps: true }
);

// Remove sensitive fields when serializing
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = { UserModel, UserSchema };
