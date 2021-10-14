const mongoose = require('mongoose')

const url = process.env.MONGODB_URL
mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})



// me.save().then((result) => {
//     console.log('thanh cong ',result);
// }).catch((error) => {
//     console.log('that bai ',error);
// })


// const Task = mongoose.model('task',{
//     description: {
//         type: String,
//     },
//     email:{
//         type: String,
//         require: true,
//         validate(value){
//             if(!validator.isEmail(value)){
//                 throw new Error('Email is invalid')
//             }
//         }
//     },
//     completed: {
//         type: Boolean,
//         default: false,
//     }
// })
// const me = new Task({
//     description: 'Alalo',
//     completed: true,
//     email: 'asdasd'
// })
// me.save().then((data)=> console.log(data)).catch(error => console.log(error))