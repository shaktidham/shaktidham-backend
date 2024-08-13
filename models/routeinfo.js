const mongoose = require("mongoose");

const RouteinfoSchema = new mongoose.Schema(
  {
    route: 
        {type: String }
             ,
    // bookingInfo: [ {type: mongoose.Schema.Types.ObjectId, ref: "BookedSeat" }],
    busInfo: { type: String },
    date: { type: Date },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Routeinfo", RouteinfoSchema);
