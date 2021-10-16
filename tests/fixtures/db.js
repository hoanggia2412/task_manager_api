const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/User')
const Task = require('../../src/models/Task')


const userOneId = new mongoose.Types.ObjectId()

const userOne = {  
    _id: userOneId, 
    username: 'Mike',
    email: 'mike@gmail.com',
    password: '123456',
    tokens: [
        {
            token: jwt.sign({_id: userOneId, username: 'Mike'},process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRED})
        }
    ]
}
const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {  
    _id: userTwoId, 
    username: 'ANDRES',
    email: 'ANDRESS@gmail.com',
    password: '123456',
    tokens: [
        {
            token: jwt.sign({_id: userTwoId, username: 'Mike'},process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRED})
        }
    ]
}

const taskOne = {
        _id: mongoose.Types.ObjectId(),
        description: 'This is first description',
        // isCompleted: true,
         owner: userOneId
}

const taskTwo = {
    _id: mongoose.Types.ObjectId(),
    description: 'This is second description',
    // isCompleted: true,
     owner: userOneId
}

const taskThree = {
    _id: mongoose.Types.ObjectId(),
    description: 'This is three description',
    // isCompleted: true,
     owner: userTwoId
}

const setupDB = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
    
}

module.exports = {
    taskOne,
    userOneId,
    userOne,
    setupDB,
    userTwo,
}