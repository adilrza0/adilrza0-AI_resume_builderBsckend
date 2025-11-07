const express = require('express');
const resumeRouter = express.Router();
const { createResume, editResume, deleteResume, getAiSuggestions, getAllResumesbyUserId, getResumebyId } = require('../Controllers/resume.controller');
const auth = require('../Middlewares/auth');

// @route POST api/resumes
// @desc Create a new resume
resumeRouter.get("/",auth,getAllResumesbyUserId)


// @route POST api/resumes
// @desc Create a new resume
// Public read: allow sharing resume view by id
resumeRouter.get('/:id', getResumebyId)

// @route POST api/resumes
// @desc Create a new resume
resumeRouter.post('/', auth, createResume);

// @route PUT api/resumes/:id
// @desc Edit a resume
resumeRouter.patch('/:id', auth, editResume);

// @route DELETE api/resumes/:id
// @desc Delete a resume
resumeRouter.delete('/:id', auth, deleteResume);

// @route POST api/resumes/:id/ai-suggestions
// @desc Get AI-powered suggestions for a resume
resumeRouter.post('/:id/ai-suggestions', auth,  getAiSuggestions);

module.exports =resumeRouter;
