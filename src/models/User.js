const mongoose = require('mongoose')
const validator = require('validator')
const bcript = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./Task')

const userSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type:String,
        required: true,
        minLength: 6,
        validate(value){
            if(value.toLowerCase().includes('password'))
            throw new Error('Password doesn\'t include \'password\'')
        }
    },
    email : {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error(`The email '${value}' is invalid`)
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: String,
        default: null
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (username,password) => {
    const user = await User.findOne({ username: username})
    if(!user)
       throw new Error('Username is not existed')
    const isMatch = await bcript.compare(password,user.password)
    if(!isMatch)
        throw new Error('Wrong password')
    return user
}

//generate JWT
userSchema.methods.generateAuthToken = async function(){
    const secret = process.env.JWT_SECRET_KEY
    const user = this
    const token = jwt.sign({_id: user._id.toString(), username: user.username },secret,{ expiresIn: process.env.JWT_EXPIRED})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}
//Hash the text of password before saving
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcript.hash(user.password,8)
    }
    next()
})

//Delete user tasks when user is removed
userSchema.pre('remove',async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})
const User = mongoose.model('user',userSchema)
module.exports = User