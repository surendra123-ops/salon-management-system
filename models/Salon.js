const mongoose = require("mongoose")
const { Schema } = mongoose

const salonSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Salon name is required"],
      trim: true,
      maxlength: [100, "Salon name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Salon phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Salon address is required"],
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
salonSchema.index({ name: 1 })

module.exports = mongoose.models.Salon || mongoose.model("Salon", salonSchema)