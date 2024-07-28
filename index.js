const express =require('express')
const connection = require('./db')
const { userRouter } = require('./Routers/user.router')
const resumeRouter = require('./Routers/resume.router')
const cors = require('cors')


require('dotenv').config()

const app=express()

app.use(cors())
app.use(express.json())

app.use('/auth',userRouter)
app.use('/resume', resumeRouter)

app.listen(process.env.port, async ()=>{
    try {
        await connection
        console.log("Connected to DB")
        console.log(`server running at ${process.env.port} port` )
    } catch (error) {
        console.log(error)
    }
})