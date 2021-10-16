const express = require('express')
const app = express()

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
require('./config/db/mongoose')
app.use(express.static('public'))
app.use(express.json())
app.use(taskRouter)
app.use(userRouter)

module.exports = app