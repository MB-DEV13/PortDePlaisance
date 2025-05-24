const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: { type: Number, required: true },
    userName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    boatName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
