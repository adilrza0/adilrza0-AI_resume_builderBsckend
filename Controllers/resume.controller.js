const { Resume } = require("../Models/resume.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

// AI helpers: delay, rate-limit detection, and retry wrapper
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const isRateLimitError = (e) => {
  const msg = String(e?.message || "");
  return e?.status === 429 || msg.includes("429") || msg.includes("RATE_LIMIT_EXCEEDED");
};

async function callGeminiWithRetry(prompt, { modelName = "gemini-1.5-flash-8b", maxOutputTokens = 768 } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("AI not configured: missing GEMINI_API_KEY");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });
  let attempt = 0;
  const maxRetries = 2;
  const baseDelay = 800;
  while (true) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens },
      });
      return result?.response?.text?.() ?? "";
    } catch (e) {
      if (isRateLimitError(e) && attempt < maxRetries) {
        const jitter = Math.floor(Math.random() * 200);
        const wait = baseDelay * Math.pow(2, attempt) + jitter;
        await delay(wait);
        attempt += 1;
        continue;
      }
      throw e;
    }
  }
}

const getResumebyId = async (req, res) => {
  try {
    const resumebyId = await Resume.findById(req.params.id);
    if (!resumebyId) {
      return res.status(404).json({ msg: "Resume not found" });
    }
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
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

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
  const { jobDescription } = req.body || {};

  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: "Resume not found" });
    }

    const modelName = req.query.model || "gemini-1.5-flash-8b";
    const prompt = generatePrompt(resume, jobDescription);
    const suggestions = await callGeminiWithRetry(prompt, { modelName, maxOutputTokens: 768 });
    res.json({ suggestions });
  } catch (err) {
    if (err.code === "AI_NOT_CONFIGURED") {
      return res.status(503).json({ error: "AI is not configured on the server" });
    }
    if (isRateLimitError(err)) {
      return res.status(429).json({ error: "AI rate limit exceeded. Please try again later." });
    }
    console.error("Error fetching AI suggestions:", err);
    res.status(500).json({ error: "Failed to get AI suggestions" });
  }
};

function generatePrompt(data, jobDescription) {
  return `
  Resume:
  Name: ${JSON.stringify(data.firstName)} ${JSON.stringify(data.lastName)}
  Address: ${JSON.stringify(data.address)}
  Phone: ${JSON.stringify(data.phone)}
  Email: ${JSON.stringify(data.email)}
  Summary: ${JSON.stringify(data.summery)}
  Work Experience: ${JSON.stringify(data.experience)}
  Education: ${JSON.stringify(data.education)}
  Skills: ${JSON.stringify(data.skills)}
  ${jobDescription ? `\nJob Description (target role): ${JSON.stringify(jobDescription)}` : ""}

  Provide specific, actionable suggestions to improve this resume for the target role.
  Focus on impact verbs, quantifiable outcomes, and relevance. Output 5-8 concise bullet points.
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
