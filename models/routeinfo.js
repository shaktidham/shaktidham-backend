const mongoose = require("mongoose");

const RouteinfoSchema = new mongoose.Schema(
  {
    fromtime: { type: String },
    totime: { type: String },
    first: { type: String },
    last: { type: String },
    Busname:{type:String},
    price: { type: Number },
    date: { type: Date },
    location:{type:String},
    driver:{type:String},
    cabinprice:{type:Number},
    
    // Updated 'from' to be an array of objects with village, point, and time
    from: [
      {
        village: { type: String },
        point: [{ type: String }],
        time: { type: String },
      }
    ],

    // Updated 'to' to be an array of objects with village, point, and time
    to: [
      {
        village: { type: String },
        point: [{ type: String }],
        time: [{ type: String }],
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Routeinfo", RouteinfoSchema);
