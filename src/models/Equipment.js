const mongoose = require("mongoose");
const STATES = require("../constants/equipmentStates");

const EquipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categorie: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    etatMateriel: {
      type: String,
      enum: Object.values(STATES),
      default: STATES.GOOD,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Equipment", EquipmentSchema);
