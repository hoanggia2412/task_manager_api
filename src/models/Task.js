const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        maxLength: 255    
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'user'
    }
},{
   timestamps: true
})

taskSchema.pre('save',function(next){
    let task = this
    if(task.isModified('description'))
    task.description =  task.description + ' - '+ new Date() 
    next()
})
const Task = mongoose.model('task',taskSchema)
module.exports = Task