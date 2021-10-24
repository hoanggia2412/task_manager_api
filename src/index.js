const app = require('./app')
// const express = require('express')
// const app = express()
const port = 8000
// const userRouter = require('./routers/user')
// const taskRouter = require('./routers/task')
// require('./config/db/mongoose')
// app.use(express.static('public'))
// app.use(express.json())
// app.use(taskRouter)
// app.use(userRouter)

app.listen(port,()=>{
    console.log('App listening at port:',port);
})