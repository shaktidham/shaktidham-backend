const mongoose = require('mongoose');

const bookedseatSchema=new mongoose.Schema({
    name:{type:String},
    vilage:{type:String},
    mobile:{type:Number},
    seatNumber:{type:String},
    route: {type: mongoose.Schema.Types.ObjectId, ref: "Routeinfo" },
    date:{type:Date,default:Date.now()}
    // seatId:{type:mongoose.Schema.Types.ObjectId, ref: "SeatSchema"}
},
{
    timestamps:true
})
// module.exports = mongoose.model("Key", keySchema);
module.exports=mongoose.model("BookedSeat",bookedseatSchema)