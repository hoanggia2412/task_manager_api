const express = require('express') 
const User = require('../models/User')
const router = express.Router()
const validator = require('validator')
const auth = require('../config/middleware/auth')
const sharp = require('sharp')
const multer = require('multer')
const path = require('path')
const { sendWelcomeEmail } = require('../emails/account')
const upload = multer({
    storage: multer.diskStorage({
        destination: './public/images/',
        limits: {
            fileSize: 1000000
        },
        filename(req,file,cb){
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
        },
    }),
   
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

router.post('/users/login',async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.username,req.body.password)
        const token = await user.generateAuthToken(user)
        res.send({ user,token })
    } catch (error) {
        res.status(400).send(error.message)
    }
})
router.post('/users/logoutAll',auth,async (req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e.message)
    }
})
router.post('/users/logout',auth,async (req,res) => {
    try{
        console.log(req);
        req.user.tokens = req.user.tokens.filter( token => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(error) {
        res.status(500).send(error.message)
    }
})
router.patch('/users/me',auth,async (req,res) => {
    const {body} = req
    const requestFields = Object.keys(body)
    const fields = ["password","email"]
    const validRequest = fields.some( filed => requestFields.includes(filed))
    if(!validRequest)
        return res.status(400).send()
    try{
        const user = req.user
        requestFields.forEach(each => user[each] = body[each])
        await user.save()    
        res.send(user)
    } catch (err) {
        res.status(500).send('Server Error')
    }
    
})
router.patch('/users/:id',async (req,res) => {
    const {body} = req
    const requestFields = Object.keys(body)
    const fields = ["password","email"]
    const validRequest = fields.some( filed => requestFields.includes(filed))
    if(!validRequest)
        return res.status(400).send()  
    const id = req.params.id
    if(!validator.isMongoId(id))
        return res.status(400).send('Invalid Id')
    try{
        // const user = await User.findByIdAndUpdate(id,body,{new: true, runValidators: true})
        const user = await User.findById(id)
        if(!user)
            return res.status(404).send(`Not found Id: ${id}`)

        requestFields.forEach(each => user[each] = body[each])
        await user.save()    
        res.send(user)
    } catch (err) {
        res.status(500).send('Server Error')
    }
})
router.post('/users',async (req,res) => {
    const fields = ["username","password","email"]
    try {
        const {body = []} = req
        const requestFields = Object.keys(body)
        const validRequest = requestFields.every( field => fields.includes(field))
        if(!validRequest)
            return res.status(400).send('Invalid request')
        const user = new User(body)
        await user.save()
        await sendWelcomeEmail(user.email,user.username)
        const token = await user.generateAuthToken()
        return res.status(201).send({user,token})
    } catch (err) {
        return res.status(500).send(err.message)
    }
})
router.get('/users/me',auth, async (req,res) => {
    res.send(req.user)
})
router.delete('/users/me',auth,async (req,res) =>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        //     return res.status(404).send()
        // sendCancelationEmail(req.user.email,req.user.username)
        await req.user.remove()
        res.send(req.user)
    }catch (err){
        res.status(500).send(err.message)
    }
})
router.delete('/users/:id',async (req,res) =>{
    const id = req.params.id
    if(!validator.isMongoId(is))
        return res.status(400).send('Invalid id')
    try{
        const user = await User.findByIdAndDelete(id)
        if(!user)
            return res.status(404).send()
        res.send(user)
    }catch (err){
        res.status(500).send()
    }
})

router.get('/users/:id',async (req,res) => {
    const id = req.params.id
    if(!validator.isMongoId(id))
        return res.status(400).send('Invalid id')
    try {
        const user = await User.findById(id)
        if(!user)
            return res.status(404).send()
        res.send(user)
    } catch (err) {
        res.status(500).send()
    }
})
router.get('/users',auth,async (req,res) => {
    try{
        const users = await User.find({})
        if(!users)
            return res.send('Empty')
        res.send(users)
    } catch(err){
        res.status(500).send(err.message)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res) => {
    if (!req.body && !req.files) {
        throw new Error('Not found an image!')
    } else {
        await sharp(req.file.path).png().resize(262, 317).toFile('./public/images/resizeImgs/'+ '262x317-'+req.file.filename)
        // const user = await User.findOneAndUpdate({_id: req.user._id }, { avatar: req.file.path },{ new :true})
        req.user.avatar = req.file.path.toString().replace('public','')
        await req.user.save()
        res.send()
    }
},(error, req, res, next) => {
    res.status(400).send({error: error.message})
})
module.exports = router