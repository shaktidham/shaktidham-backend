const mongoose = require("mongoose");

const RouteinfoSchema = new mongoose.Schema(
  {
    fromtime: { type: String },
    droptime: { type: String },
    first: { type: String },
    last: { type: String },
    Busname: { type: String },
    price: { type: Number },
    date: { type: Date },
    enddate: { type: Date },
    location: { type: String },
    driver: { type: String },
    cabinprice: { type: Number },

    from: [
      {
        village: { type: String },
        evillage: { type: String },
        point: [
          {
            pointName: { type: String },
            time: { type: String },
          },
        ],
      },
    ],

    // Updated 'to' to be an array of objects with village, point, and time
    to: [
      {
        village: { type: String },
        evillage: { type: String },
        point: [
          {
            pointName: { type: String },
            time: { type: String },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Routeinfo", RouteinfoSchema);
