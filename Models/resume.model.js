const mongoose = require("mongoose");
const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  firstName: String,
  lastName: String,
  jobTitle:String,
  address: String,
  phone: String,
  email: String,
  themeColor: String,
  summery: String,
  experience: [
    {
      id:Number,
      companyName: String,
      city:String,
      state:String,
      startDate:String,
      endDate:String,
      currentlyWorking:Boolean,
      workSummery:String,
    },
  ],
  education: [
    {
      id:Number,
      universityName:String,
      startDate: String,
      endDate: String,
      degree:String,
      major:String,
      description:String,
    },
  ],
  skills: [
    {
      id:Number,
      name:String,
      rating:Number,
    }
  ],
});
const Resume = mongoose.model("Resume", ResumeSchema);

module.exports = {
  Resume,
};
