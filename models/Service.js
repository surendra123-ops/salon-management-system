const mongoose = require("mongoose")
const { Schema } = mongoose

const serviceSchema = new Schema(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Salon",
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: [100, "Service name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price must be at least 0"],
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

serviceSchema.index({ salonId: 1, category: 1 })

module.exports = mongoose.models.Service || mongoose.model("Service", serviceSchema)
