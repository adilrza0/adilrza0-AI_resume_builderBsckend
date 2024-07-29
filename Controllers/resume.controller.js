const { Resume } = require("../Models/resume.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getResumebyId = async (req, res) => {
  console.log(req.params)
  try {
    const resumebyId = await Resume.findById(req.params.id);
    console.log(resumebyId)
    res.json(resumebyId);
  } catch (error) {
    res.status(500).send({ err: error });
  }
};

const getAllResumesbyUserId = async (req, res) => {
  const { id } = req.user;
  try {
    const Resumes = await Resume.find({ user: id });
    res.json(Resumes);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const createResume = async (req, res) => {
  const {
    jobTitle,
    firstName,
    lastName,
    email,
    address,
    summery,
    themeColor,
    phone,
    experience,
    education,
    skills,
  } = req.body;

  try {
    const resume = new Resume({
      user: req.user.id,
      jobTitle,
      firstName:firstName||"",
      lastName:lastName||"",
      email:email||"",
      address:address||"",
      summery:summery||"",
      themeColor:themeColor||"",
      phone:phone||"",
      experience,
      education,
      skills,
    });

    await resume.save();
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const editResume = async (req, res) => {
  const {
    jobTitle,
    firstName,
    lastName,
    email,
    address,
    summery,
    themeColor,
    phone,
    experience,
    education,
    skills
  } = req.body;
  console.log(summery)
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: "Resume not found" });
    }

    // Check if the user is authorized to edit this resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Update only the fields that are present in the request body
    if (jobTitle !== undefined) resume.jobTitle = jobTitle;
    if (firstName !== undefined) resume.firstName = firstName;
    if (lastName !== undefined) resume.lastName = lastName;
    if (email !== undefined) resume.email = email;
    if (address !== undefined) resume.address = address;
    if (summery !== undefined) resume.summery = summery;
    if (themeColor !== undefined) resume.themeColor = themeColor;
    if (phone !== undefined) resume.phone = phone;
    if (experience !== undefined) resume.experience = experience;
    if (education !== undefined) resume.education = education;
    if (skills !== undefined) resume.skills = skills;

    await resume.save();
    const resume1 = await Resume.findById(req.params.id);
    console.log(resume1)
    
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const deleteResume = async (req, res) => {
  console.log(req.params)
  try {
    const resume = await Resume.findById(req.params.id);
    console.log(resume)

    if (!resume) {
      return res.status(404).json({ msg: "Resume not found" });
    }

    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await resume.deleteOne();
    res.json({ msg: "Resume removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getAiSuggestions = async (req, res) => {
  const { jobDescription } = req.body;

  try {
    const resume = await Resume.findById(req.params.id);
    console.log(resume);

    if (!resume) {
      return res.status(404).json({ msg: "Resume not found" });
    }

    const inputData = resume;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = generatePrompt(inputData);
    const result = await model.generateContent(prompt);

    const response = await result.response;
    const suggestions = response.text();

    console.log(suggestions);
    res.json({ suggestions });
  } catch (err) {
    console.error("Error fetching AI suggestions:", err);
    res.status(500).json({ error: "Failed to get AI suggestions" });
  }
};

function generatePrompt(data) {
  return `
  

  Resume:
  Name : ${JSON.stringify(data.firstName)}  ${JSON.stringify(data.lastName)} 
  address: ${JSON.stringify(data.address)} 
  phone: ${JSON.stringify(data.phone)} 
  email:  ${JSON.stringify(data.email)} 
  summery:${JSON.stringify}
  Work Experience: ${JSON.stringify(data.experience)}
  Education: ${JSON.stringify(data.education)}
  Skills: ${JSON.stringify(data.skills)}

  Please provide review  to improve the resume for the  above resume.
  `;
}

module.exports = {
  getAllResumesbyUserId,
  getResumebyId,
  createResume,
  editResume,
  deleteResume,
  getAiSuggestions,
};
