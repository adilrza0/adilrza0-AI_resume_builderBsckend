const mongoose = require('mongoose')

require('dotenv').config()

const connection = mongoose.connect(process.env.MongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

module.exports = connection
