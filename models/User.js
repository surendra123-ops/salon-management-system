const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { Schema } = mongoose

const userSchema = new Schema(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Salon",
    },
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, "Email cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: ["owner"],
      default: "owner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for tenant isolation and email lookup
userSchema.index({ salonId: 1, email: 1 }, { unique: true })

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next()

  const saltRounds = 12
  this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds)
  next()
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Set toJSON transform to exclude passwordHash
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash
    return {
      id: doc._id,
      salonId: doc.salonId,
      name: doc.name,
      email: doc.email,
      role: doc.role,
    }
  },
})

module.exports = mongoose.models.User || mongoose.model("User", userSchema)