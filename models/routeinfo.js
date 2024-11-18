const mongoose = require("mongoose");

const RouteinfoSchema = new mongoose.Schema(
  {
    fromtime:{type:String},
    totime:{type:String},
    // bookingInfo: [ {type: mongoose.Schema.Types.ObjectId, ref: "BookedSeat" }],
    busInfo: { type: String },
    price: { type: Number },
    date: { type: Date },
    from: [{ type: String }],
    to: [{ type: String }],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Routeinfo", RouteinfoSchema);
