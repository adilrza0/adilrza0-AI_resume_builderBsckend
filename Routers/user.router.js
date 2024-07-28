const express = require('express');
const { register, login } = require('../Controllers/user.controller');
const userRouter = express.Router();


// @route POST api/auth/register
// @desc Register user
userRouter.post('/register', register );

// @route POST api/auth/login
// @desc Authenticate user & get token
userRouter.post('/login', login);

module.exports = {userRouter};
