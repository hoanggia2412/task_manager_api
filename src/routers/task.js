const express = require('express')
const router = express.Router()
const validator = require('validator')
const Task = require('../models/Task')
const User = require('../models/User')
const auth = require('../config/middleware/auth')

router.delete('/tasks/:id', auth, async(req,res) =>{
    const _id = req.params.id
    if(!validator.isMongoId(_id))
        return res.status(400).send('Invalid id')
    try{
        const task = await Task.findOneAndDelete({_id,owner: req.user._id})
        if(!task)
            return res.status(404).send()
        res.send(task)
    }catch (err) {
        res.status(500).send(err.message)
    }
})
router.patch('/tasks/:id',auth,async(req,res) => {
    const {body = null} = req
    const fields = ['description','isCompleted']
    const requestFields = Object.keys(body)
    const validRequest = fields.some( field => requestFields.includes(field))
    if(!validRequest)
        return res.status(400).send('Invalid request')
    const _id = req.params.id
    if(!validator.isMongoId(_id))
        return res.status(400).send('Invalid id')
    try {
        // const task = await Task.findByIdAndUpdate(id,body,{new: true, runValidators: true})
        const task = await Task.findOne({_id,owner: req.user._id})
        if(!task)
            return res.status(400).send()
        
        requestFields.forEach( each => task[each] = body[each] )
        await task.save()
        res.send(task)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/tasks',auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    const requestFields = Object.keys(req.body)
    const fields = ['description','isCompleted']
    const validRequest = fields.every(field => requestFields.includes(field))
    if(!validRequest)
        return res.status(400).send('Invalid request')
    try{
        await task.save()
        return res.status(201).send(task)
    }catch(err){
        return res.status(500).send(err.message)
    }
})

router.get('/tasks/:id', auth,async (req,res) => {
    const _id = req.params.id
    if(!validator.isMongoId(_id))
        return res.status(400).send('Invalid id')
    try{
        // const task = await Task.findById(id)
        const task = await Task.findOne({_id,owner: req.user._id}).populate('owner').exec()
        if(!task)
            return res.status(404).send()
        res.send(task)
    } catch(err) {
        res.status(500).send(err.message)
    }
})


//GET /task?completed=true
//GET /task?limit=10&skip=20
//GET /task?sortBy=createdAt:desc
router.get('/tasks',auth ,async (req,res) => {
    let limit = 0
    if(req.query.limit)
        limit = req.query.limit

    let skip = 0
    if(req.query.skip)
        skip = req.query.skip

    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'decs' ? -1 : 1
    }

    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    try {
        // const tasks = await Task.find({owner: req.user._id})
       const user =  await User.findById(req.user._id).populate({
           path: 'tasks',
           match,
           options: {
               limit: parseInt(limit),
               skip: parseInt(skip)*parseInt(limit),
               sort
            //    sort: {
            //        createdAt: -1
            //    }
           }
       }).exec()
        res.send(user.tasks) 
    } catch(err) {
        res.status(500).send(err.message)
    }
})
module.exports = router