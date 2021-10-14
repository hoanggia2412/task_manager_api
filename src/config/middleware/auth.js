const jwt = require('jsonwebtoken')
const User = require('../../models/User')

const auth = async(req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({_id: decode._id,'tokens.token': token})
        if(!user) {
            throw new Error('Invalid authentication')
        }
        req.token = token
        req.user = user
        next()
    }catch(error){
        res.status(401).send(error.message)
    }
}
module.exports = auth