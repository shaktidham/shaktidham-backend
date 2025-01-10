const mongoose = require("mongoose");
const toIST = (date) => {
  return new Date(date.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000); // UTC + 5:30
};

const bookedseatSchema = new mongoose.Schema(
  {
    name: { type: String },
    vilage: { type: String },
    mobile: { type: Number },
    seatNumber: { type: String },
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Routeinfo" },
    date: { type: Date, default: Date.now() },
    from: { type: String },
    to: { type: String },
    pickup: { type: String },
    droptime: { type: String },
    pickuptime: { type: String },
    drop: { type: String },
    gender: { type: String },
    price: { type: Number },
    age: { type: String },
    extradetails: { type: String },

    // seatId:{type:mongoose.Schema.Types.ObjectId, ref: "SeatSchema"}
  },
  {
    timestamps: true,
  }
);
bookedseatSchema.pre("save", function (next) {
  this.createdAt = toIST(new Date());
  this.updatedAt = toIST(new Date());
  next();
});
// module.exports = mongoose.model("Key", keySchema);
module.exports = mongoose.model("BookedSeat", bookedseatSchema);
