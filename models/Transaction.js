const mongoose = require("mongoose")
const { Schema } = mongoose

const transactionSchema = new Schema(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Salon",
    },
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    services: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Service",
        },
        serviceName: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Service price must be at least 0"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        total: {
          type: Number,
          required: true,
          min: [0, "Line total must be at least 0"],
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal must be at least 0"],
    },
    discount: {
      type: {
        type: String,
        enum: ["fixed", "percentage"],
        required: true,
      },
      value: {
        type: Number,
        required: true,
        min: [0, "Discount value must be at least 0"],
      },
      amount: {
        type: Number,
        required: true,
        min: [0, "Discount amount must be at least 0"],
      },
    },
    finalAmount: {
      type: Number,
      required: true,
      min: [0, "Final amount must be at least 0"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "other"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "pending"],
      default: "paid",
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Amount paid must be at least 0"],
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Amount due must be at least 0"],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

transactionSchema.index({ salonId: 1, createdAt: -1 })
transactionSchema.index({ salonId: 1, transactionNumber: 1 }, { unique: true })

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema)
